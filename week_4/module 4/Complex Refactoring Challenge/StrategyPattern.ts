/**
 * @overview
 * This file demonstrates the Strategy design pattern for a payment processing system.
 * It defines a common interface for different payment strategies and encapsulates
 * each payment method into its own class.
 */

// 1. The Strategy Interface
/**
 * The PaymentStrategy interface declares a method that all supported
 * payment algorithms must implement. The Context uses this interface to call
 * the algorithm defined by a Concrete Strategy.
 */
interface PaymentStrategy {
  pay(amount: number): void;
}

// 2. Concrete Strategies
/**
 * The CreditCardPayment class implements the credit card payment algorithm.
 */
class CreditCardPayment implements PaymentStrategy {
  private name: string;
  private cardNumber: string;

  constructor(name: string, cardNumber: string) {
    this.name = name;
    this.cardNumber = cardNumber;
  }

  public pay(amount: number): void {
    console.log(`Processing a payment of $${amount.toFixed(2)} with Credit Card.`);
    // In a real application, you would integrate with a payment gateway here.
    console.log(`Card Holder: ${this.name}`);
    console.log(`Card Number: (ending in ${this.cardNumber.slice(-4)})`);
    console.log('Credit card payment processed successfully.');
  }
}

/**
 * The PayPalPayment class implements the PayPal payment algorithm.
 */
class PayPalPayment implements PaymentStrategy {
  private email: string;

  constructor(email: string) {
    this.email = email;
  }

  public pay(amount: number): void {
    console.log(`Processing a payment of $${amount.toFixed(2)} with PayPal.`);
    // In a real application, you would call the PayPal API here.
    console.log(`PayPal account: ${this.email}`);
    console.log('PayPal payment processed successfully.');
  }
}

/**
 * The BankTransferPayment class implements the bank transfer payment algorithm.
 */
class BankTransferPayment implements PaymentStrategy {
  private accountNumber: string;

  constructor(accountNumber: string) {
    this.accountNumber = accountNumber;
  }

  public pay(amount: number): void {
    console.log(`Processing a payment of $${amount.toFixed(2)} with Bank Transfer.`);
    // In a real application, you would handle bank transfer logic here.
    console.log(`Bank Account: ${this.accountNumber}`);
    console.log('Bank transfer initiated successfully.');
  }
}

// 3. The Context
/**
 * The PaymentContext class is not aware of the concrete strategies.
 * It works with all strategies through the PaymentStrategy interface.
 * It provides a way for the client to replace the strategy at runtime.
 */
class PaymentContext {
  private paymentStrategy: PaymentStrategy;

  // The initial strategy is set via the constructor.
  constructor(strategy: PaymentStrategy) {
    this.paymentStrategy = strategy;
  }

  /**
   * Allows replacing the strategy at runtime.
   */
  public setPaymentStrategy(strategy: PaymentStrategy): void {
    console.log('\nSwitching payment strategy...');
    this.paymentStrategy = strategy;
  }

  /**
   * Delegates the payment execution to the current strategy object.
   */
  public executePayment(amount: number): void {
    this.paymentStrategy.pay(amount);
  }
}

// 4. Client Code / Example Usage
function runPaymentProcessingExample() {
  console.log('--- Strategy Pattern for Payment Processing Example ---');

  const orderAmount = 250.75;

  // Scenario 1: User chooses to pay with Credit Card
  const creditCardStrategy = new CreditCardPayment('John Doe', '1234-5678-9876-5432');
  const paymentContext = new PaymentContext(creditCardStrategy);
  paymentContext.executePayment(orderAmount);

  // Scenario 2: User changes their mind and decides to use PayPal
  const payPalStrategy = new PayPalPayment('john.doe@example.com');
  paymentContext.setPaymentStrategy(payPalStrategy);
  paymentContext.executePayment(orderAmount);

  // Scenario 3: Another user opts for a Bank Transfer
  const bankTransferStrategy = new BankTransferPayment('ACC-987654321');
  paymentContext.setPaymentStrategy(bankTransferStrategy);
  paymentContext.executePayment(orderAmount);
}

// Run the example
runPaymentProcessingExample(); 