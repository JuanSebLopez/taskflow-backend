class EventBus {
    constructor() {
        this.subscribers = new Map();
    }

    subscribe(eventType, observer) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Set());
        }

        this.subscribers.get(eventType).add(observer);
    }

    unsubscribe(eventType, observer) {
        if (!this.subscribers.has(eventType)) {
            return;
        }

        this.subscribers.get(eventType).delete(observer);

        if (this.subscribers.get(eventType).size === 0) {
            this.subscribers.delete(eventType);
        }
    }

    async publish(eventType, payload = {}, options = { swallowErrors: true }) {
        const observers = this.subscribers.get(eventType);

        if (!observers || observers.size === 0) {
            return;
        }

        const errors = [];
        const promises = Array.from(observers).map(async (observer) => {
            if (typeof observer.handle !== 'function') {
                return;
            }

            try {
                await observer.handle(eventType, payload);
            } catch (error) {
                const message = error?.message || error;
                console.error(`EventBus error on event ${eventType}:`, message);
                errors.push(error);
            }
        });

        await Promise.all(promises);

        if (!options.swallowErrors && errors.length > 0) {
            throw errors[0];
        }
    }
}

module.exports = new EventBus();
