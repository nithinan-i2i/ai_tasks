const {
    PaymentStrategy
} = require('./paymentStrategy');

class CheckoutContext {
    constructor(strategy) {
        this.setStrategy(strategy);
    }

    setStrategy(strategy) {
        if (!(strategy instanceof PaymentStrategy)) {
            throw new Error('Invalid payment strategy');
        }
        this.strategy = strategy;
    }

    pay(paymentDetails) {
        this.strategy.validate(paymentDetails);
        return this.strategy.process(paymentDetails);
    }
}

module.exports = CheckoutContext; 