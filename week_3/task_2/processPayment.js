function processPaymentWithDeps(
  { database, paymentGateway, emailService, calculateFee },
  userId,
  amount,
  cardToken,
  options
) {
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  if (!cardToken) {
    throw new Error('Card token is required');
  }

  const user = database.getUser(userId);
  if (!user) throw new Error('User not found');

  const card = paymentGateway.validateCard(cardToken);
  if (!card.valid) throw new Error('Invalid card');

  const fee = calculateFee(amount, user.tier);
  if (typeof fee !== 'number' || fee < 0) {
    throw new Error('Fee must be zero or positive');
  }
  const total = amount + fee;

  if (user.balance < total) {
    throw new Error('Insufficient funds');
  }

  const transaction = paymentGateway.charge(cardToken, total);
  const updatedUser = { ...user, balance: user.balance - total };

  database.updateUser(updatedUser);
  emailService.sendReceipt(user.email, transaction);

  return transaction;
}

// Legacy-compatible export
const defaultDependencies = {
  database,
  paymentGateway,
  emailService,
  calculateFee,
};

function processPayment(userId, amount, cardToken, options) {
  return processPaymentWithDeps(
    defaultDependencies,
    userId,
    amount,
    cardToken,
    options
  );
}

module.exports = {
  processPaymentWithDeps,
  processPayment, // backward compatible
}; 