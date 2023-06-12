const getIntroduction = () => ContentRepository.get();

const setIntroductionContent = (content) => {
    const payload = {
        $set: {
            introduction: content,
        },
    };
    ContentRepository.save(payload).then((res) => res);
};
