const { TASK_TYPES } = require('../utils/constants');

class BaseTaskCreator {
    create(payload) {
        return { ...payload };
    }
}

class BugTaskCreator extends BaseTaskCreator {
    create(payload) {
        return {
            ...payload,
            type: 'BUG',
            priority: payload.priority || 'ALTA',
            title: payload.title.startsWith('[BUG]') ? payload.title : `[BUG] ${payload.title}`
        };
    }
}

class FeatureTaskCreator extends BaseTaskCreator {
    create(payload) {
        return {
            ...payload,
            type: 'FEATURE',
            priority: payload.priority || 'MEDIA'
        };
    }
}

class ImprovementTaskCreator extends BaseTaskCreator {
    create(payload) {
        return {
            ...payload,
            type: 'IMPROVEMENT',
            priority: payload.priority || 'MEDIA'
        };
    }
}

class GenericTaskCreator extends BaseTaskCreator {
    create(payload) {
        return {
            ...payload,
            type: 'TASK',
            priority: payload.priority || 'MEDIA'
        };
    }
}

class TaskFactory {
    constructor() {
        this.creators = {
            BUG: new BugTaskCreator(),
            FEATURE: new FeatureTaskCreator(),
            IMPROVEMENT: new ImprovementTaskCreator(),
            TASK: new GenericTaskCreator()
        };
    }

    getCreator(type) {
        const normalizedType = TASK_TYPES.includes(type) ? type : 'TASK';
        return this.creators[normalizedType];
    }
}

module.exports = new TaskFactory();
