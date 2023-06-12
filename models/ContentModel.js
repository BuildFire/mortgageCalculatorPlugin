class ContentModal {
    constructor(data = {}) {
        this.introduction = data.introduction || '';
        this.createdOn = data.createdOn || new Date();
        this.createdBy = data.createdBy || null;
        this.lastUpdatedOn = data.lastUpdatedOn || new Date();
        this.lastUpdatedBy = data.lastUpdatedBy || null;
        this.deletedOn = data.deletedOn || null;
        this.deletedBy = data.deletedBy || null;
        this.isActive = data.isActive || 1;
    }

    toJSON() {
        return {
            introduction: this.introduction,
            createdOn: this.createdOn,
            createdBy: this.createdBy,
            lastUpdatedOn: this.lastUpdatedOn,
            lastUpdatedBy: this.lastUpdatedBy,
            deletedOn: this.deletedOn,
            deletedBy: this.deletedBy,
            isActive: this.isActive,
            _buildfire: {
                index: {
                    string1: this.createdOn,
                },
            },
        };
    }
}
