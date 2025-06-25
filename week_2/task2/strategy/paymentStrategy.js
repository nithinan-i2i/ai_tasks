// PaymentStrategy interface (abstract class)
class PaymentStrategy {
    validate(paymentDetails) {
        throw new Error('validate() must be implemented');
    }
    process(paymentDetails) {
        throw new Error('process() must be implemented');
    }
}

// Credit Card Strategy
class CreditCardStrategy extends PaymentStrategy {
    validate(paymentDetails) {
        // Simple validation for example
        if (!paymentDetails.cardNumber || !paymentDetails.cvv || !paymentDetails.expiry) {
            throw new Error('Invalid credit card details');
        }
        return true;
    }
    process(paymentDetails) {
        // Simulate processing
        return `Processed credit card payment for ${paymentDetails.amount}`;
    }
}

// PayPal Strategy
class PayPalStrategy extends PaymentStrategy {
    validate(paymentDetails) {
        if (!paymentDetails.email || !paymentDetails.password) {
            throw new Error('Invalid PayPal credentials');
        }
        return true;
    }
    process(paymentDetails) {
        return `Processed PayPal payment for ${paymentDetails.amount}`;
    }
}

// Bank Transfer Strategy
class BankTransferStrategy extends PaymentStrategy {
    validate(paymentDetails) {
        if (!paymentDetails.accountNumber || !paymentDetails.routingNumber) {
            throw new Error('Invalid bank transfer details');
        }
        return true;
    }
    process(paymentDetails) {
        return `Processed bank transfer payment for ${paymentDetails.amount}`;
    }
}

module.exports = {
    PaymentStrategy,
    CreditCardStrategy,
    PayPalStrategy,
    BankTransferStrategy
}; 