const {
    Subject,
    EmailService,
    LogService,
    AnalyticsService
} = require('./observerPattern');

describe('Observer Pattern', () => {
    let subject, email, log, analytics;
    beforeEach(() => {
        subject = new Subject();
        email = new EmailService();
        log = new LogService();
        analytics = new AnalyticsService();
    });

    test('Observers receive notifications', () => {
        subject.addObserver(email);
        subject.addObserver(log);
        subject.addObserver(analytics);
        const event = { type: 'UserRegistered', user: 'bob' };
        const responses = subject.observers.map(o => o.update(event));
        expect(responses).toEqual([
            'Email sent: UserRegistered for user bob',
            'Log entry: UserRegistered by user bob',
            'Analytics updated: UserRegistered for user bob'
        ]);
    });

    test('Can remove observers at runtime', () => {
        subject.addObserver(email);
        subject.addObserver(log);
        subject.addObserver(analytics);
        subject.removeObserver(log);
        const event = { type: 'OrderPlaced', user: 'bob' };
        const responses = subject.observers.map(o => o.update(event));
        expect(responses).toEqual([
            'Email sent: OrderPlaced for user bob',
            'Analytics updated: OrderPlaced for user bob'
        ]);
    });

    test('No observers means no notifications', () => {
        const event = { type: 'UserRegistered', user: 'bob' };
        const responses = subject.observers.map(o => o.update(event));
        expect(responses).toEqual([]);
    });
}); 