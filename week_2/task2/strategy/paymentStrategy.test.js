const {
    CreditCardStrategy,
    PayPalStrategy,
    BankTransferStrategy
} = require('./paymentStrategy');
const CheckoutContext = require('./checkoutContext');

describe('Payment Strategies', () => {
    test('CreditCardStrategy: valid details', () => {
        const strategy = new CreditCardStrategy();
        const details = { cardNumber: '4111', cvv: '123', expiry: '12/25', amount: 50 };
        expect(strategy.validate(details)).toBe(true);
        expect(strategy.process(details)).toBe('Processed credit card payment for 50');
    });
    test('CreditCardStrategy: invalid details', () => {
        const strategy = new CreditCardStrategy();
        expect(() => strategy.validate({})).toThrow('Invalid credit card details');
    });
    test('PayPalStrategy: valid details', () => {
        const strategy = new PayPalStrategy();
        const details = { email: 'a@b.com', password: 'pw', amount: 60 };
        expect(strategy.validate(details)).toBe(true);
        expect(strategy.process(details)).toBe('Processed PayPal payment for 60');
    });
    test('PayPalStrategy: invalid details', () => {
        const strategy = new PayPalStrategy();
        expect(() => strategy.validate({})).toThrow('Invalid PayPal credentials');
    });
    test('BankTransferStrategy: valid details', () => {
        const strategy = new BankTransferStrategy();
        const details = { accountNumber: '123', routingNumber: '456', amount: 70 };
        expect(strategy.validate(details)).toBe(true);
        expect(strategy.process(details)).toBe('Processed bank transfer payment for 70');
    });
    test('BankTransferStrategy: invalid details', () => {
        const strategy = new BankTransferStrategy();
        expect(() => strategy.validate({})).toThrow('Invalid bank transfer details');
    });
});

describe('CheckoutContext', () => {
    test('Dynamic strategy switching and payment', () => {
        const creditCard = new CreditCardStrategy();
        const paypal = new PayPalStrategy();
        const bank = new BankTransferStrategy();
        const checkout = new CheckoutContext(creditCard);
        const ccDetails = { cardNumber: '4111', cvv: '123', expiry: '12/25', amount: 10 };
        const ppDetails = { email: 'a@b.com', password: 'pw', amount: 20 };
        const bankDetails = { accountNumber: '123', routingNumber: '456', amount: 30 };
        expect(checkout.pay(ccDetails)).toBe('Processed credit card payment for 10');
        checkout.setStrategy(paypal);
        expect(checkout.pay(ppDetails)).toBe('Processed PayPal payment for 20');
        checkout.setStrategy(bank);
        expect(checkout.pay(bankDetails)).toBe('Processed bank transfer payment for 30');
    });
    test('Throws error for invalid strategy', () => {
        expect(() => new CheckoutContext({})).toThrow('Invalid payment strategy');
    });
}); 