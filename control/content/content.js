const contentUi = {
    init() {
        this.initTinymce();
    },

    initTinymce() {
        let timerDelay = null;
        tinymce.init({
            selector: '#introduction',
            setup: (editor) => {
                editor.on('change keyUp', (e) => {
                    // use change and keyUp to cover all cases
                    if (timerDelay) clearTimeout(timerDelay);
                    timerDelay = setTimeout(() => {
                        // use timer delay to avoid handling too many WYSIWYG updates
                        let wysiwygContent = tinymce.activeEditor.getContent();
                        setIntroductionContent(wysiwygContent);
                        buildfire.messaging.sendMessageToWidget({ scope: 'introduction', introduction : wysiwygContent });
                    }, 500);
                });
                editor.on('init', () => {
                    getIntroduction().then((res) => {
                        tinymce.activeEditor.setContent(res.introduction);
                    });
                });
            },
        });
    },
};

contentUi.init();
