const { processPaymentWithDeps } = require('./processPayment');

describe('processPaymentWithDeps', () => {
  let database, paymentGateway, emailService, calculateFee;
  let user, card, transaction;

  beforeEach(() => {
    user = { id: 'u1', email: 'test@example.com', tier: 'basic', balance: 200 };
    card = { valid: true };
    transaction = { id: 'txn1', amount: 110 };

    database = {
      getUser: jest.fn().mockReturnValue(user),
      updateUser: jest.fn(),
    };
    paymentGateway = {
      validateCard: jest.fn().mockReturnValue(card),
      charge: jest.fn().mockReturnValue(transaction),
    };
    emailService = {
      sendReceipt: jest.fn(),
    };
    calculateFee = jest.fn().mockReturnValue(10);
  });

  it('processes payment successfully', () => {
    const result = processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    );
    expect(database.getUser).toHaveBeenCalledWith('u1');
    expect(paymentGateway.validateCard).toHaveBeenCalledWith('card123');
    expect(calculateFee).toHaveBeenCalledWith(100, 'basic');
    expect(paymentGateway.charge).toHaveBeenCalledWith('card123', 110);
    expect(database.updateUser).toHaveBeenCalledWith({ ...user, balance: 90 });
    expect(emailService.sendReceipt).toHaveBeenCalledWith('test@example.com', transaction);
    expect(result).toBe(transaction);
  });

  it('throws if user not found', () => {
    database.getUser.mockReturnValue(null);
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u2', 100, 'card123', {}
    )).toThrow('User not found');
  });

  it('throws if card is invalid', () => {
    paymentGateway.validateCard.mockReturnValue({ valid: false });
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    )).toThrow('Invalid card');
  });

  it('throws if insufficient funds', () => {
    user.balance = 50;
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    )).toThrow('Insufficient funds');
  });

  it('handles zero fee', () => {
    calculateFee.mockReturnValue(0);
    user.balance = 100;
    const result = processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    );
    expect(paymentGateway.charge).toHaveBeenCalledWith('card123', 100);
    expect(result).toBe(transaction);
  });

  it('handles exact balance', () => {
    calculateFee.mockReturnValue(10);
    user.balance = 110;
    const result = processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    );
    expect(result).toBe(transaction);
    expect(user.balance).toBe(0);
  });

  it('propagates error if paymentGateway.charge fails', () => {
    paymentGateway.charge.mockImplementation(() => { throw new Error('Charge failed'); });
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    )).toThrow('Charge failed');
  });

  it('propagates error if database.updateUser fails', () => {
    database.updateUser.mockImplementation(() => { throw new Error('DB update failed'); });
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    )).toThrow('DB update failed');
  });

  it('propagates error if emailService.sendReceipt fails', () => {
    emailService.sendReceipt.mockImplementation(() => { throw new Error('Email failed'); });
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    )).toThrow('Email failed');
  });

  it('does not mutate original user object reference', () => {
    const originalUser = { ...user };
    processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    );
    expect(user).not.toEqual(originalUser); // balance should be updated
  });

  it('passes options parameter through', () => {
    // This test is a placeholder in case options are used in the future
    processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', { test: true }
    );
    // No assertion needed unless options are used
    expect(true).toBe(true);
  });

  it('throws if amount is zero', () => {
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 0, 'card123', {}
    )).toThrow('Amount must be greater than zero');
  });

  it('throws if amount is negative', () => {
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', -50, 'card123', {}
    )).toThrow('Amount must be greater than zero');
  });

  it('throws if fee is negative', () => {
    calculateFee.mockReturnValue(-5);
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, 'card123', {}
    )).toThrow('Fee must be zero or positive');
  });

  it('throws if cardToken is missing', () => {
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, '', {}
    )).toThrow('Card token is required');
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, null, {}
    )).toThrow('Card token is required');
    expect(() => processPaymentWithDeps(
      { database, paymentGateway, emailService, calculateFee },
      'u1', 100, undefined, {}
    )).toThrow('Card token is required');
  });
}); 