const {
    Subject,
    EmailService,
    LogService,
    AnalyticsService
} = require('./observerPattern');

// Create subject and observers
const eventSubject = new Subject();
const emailService = new EmailService();
const logService = new LogService();
const analyticsService = new AnalyticsService();

// Add observers
eventSubject.addObserver(emailService);
eventSubject.addObserver(logService);
eventSubject.addObserver(analyticsService);

// Simulate user action event
const eventData = { type: 'UserRegistered', user: 'alice' };

// Notify all observers and collect responses
const responses = eventSubject.observers.map(observer => observer.update(eventData));
console.log(responses);

// Remove an observer and trigger another event
eventSubject.removeObserver(logService);
const eventData2 = { type: 'OrderPlaced', user: 'alice' };
const responses2 = eventSubject.observers.map(observer => observer.update(eventData2));
console.log(responses2); 