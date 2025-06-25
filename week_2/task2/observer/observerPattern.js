// Observer interface
class Observer {
    update(eventData) {
        throw new Error('update() must be implemented');
    }
}

// Subject interface
class Subject {
    constructor() {
        this.observers = [];
    }
    addObserver(observer) {
        this.observers.push(observer);
    }
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }
    notify(eventData) {
        this.observers.forEach(observer => observer.update(eventData));
    }
}

// Concrete Observers
class EmailService extends Observer {
    update(eventData) {
        // Simulate sending email
        return `Email sent: ${eventData.type} for user ${eventData.user}`;
    }
}

class LogService extends Observer {
    update(eventData) {
        // Simulate logging
        return `Log entry: ${eventData.type} by user ${eventData.user}`;
    }
}

class AnalyticsService extends Observer {
    update(eventData) {
        // Simulate analytics tracking
        return `Analytics updated: ${eventData.type} for user ${eventData.user}`;
    }
}

module.exports = {
    Observer,
    Subject,
    EmailService,
    LogService,
    AnalyticsService
}; 