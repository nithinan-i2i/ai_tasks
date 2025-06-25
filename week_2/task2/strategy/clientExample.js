const {
    CreditCardStrategy,
    PayPalStrategy,
    BankTransferStrategy
} = require('./paymentStrategy');
const CheckoutContext = require('./checkoutContext');

// Example payment details
const creditCardDetails = {
    cardNumber: '4111111111111111',
    cvv: '123',
    expiry: '12/25',
    amount: 100
};

const paypalDetails = {
    email: 'user@example.com',
    password: 'securepassword',
    amount: 200
};

const bankTransferDetails = {
    accountNumber: '123456789',
    routingNumber: '987654321',
    amount: 300
};

// Dynamic strategy selection
const checkout = new CheckoutContext(new CreditCardStrategy());
console.log(checkout.pay(creditCardDetails)); // Processed credit card payment for 100

checkout.setStrategy(new PayPalStrategy());
console.log(checkout.pay(paypalDetails)); // Processed PayPal payment for 200

checkout.setStrategy(new BankTransferStrategy());
console.log(checkout.pay(bankTransferDetails)); // Processed bank transfer payment for 300 