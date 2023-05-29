class ContentRepository {
    static get TAG() {
        return 'content';
    }

    static get() {
        return new Promise((resolve, reject) => {
            buildfire.datastore.get(ContentRepository.TAG, (err, res) => {
                if (err) return reject(err);
                if (!res || !res.data || Object.keys(res.data).length === 0) {
                    const data = new ContentModal();
                    data.createdBy = authManager.currentUser.userId;
                    ContentRepository.save(data);
                    resolve(data);
                } else {
                    const data = new ContentModal(res.data).toJSON();
                    resolve(data);
                }
            });
        });
    }

    static save(data) {
        return new Promise((resolve, reject) => {
            data.lastUpdatedBy = authManager.currentUser.userId;
            buildfire.datastore.save(
                data,
                ContentRepository.TAG,
                (err, res) => {
                    if (err) return reject(err);
                    resolve(new ContentModal(res).toJSON());
                }
            );
        });
    }
}
