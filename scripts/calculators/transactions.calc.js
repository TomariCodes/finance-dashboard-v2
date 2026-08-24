
export function filterByType(transactions, type) {
  return transactions.filter((transaction) => transaction.type === type);
}

export function getTotalByType(transactions, type) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}