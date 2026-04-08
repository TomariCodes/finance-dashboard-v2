export function filterByDateRange(transactions, range, referenceDate) {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  const now = referenceDate ? new Date(referenceDate) : new Date();
  let startDate;
  switch (range) {
    case "last7Days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case "last30Days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case "thisYear":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "lastYear":
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      break;
    default:
      return transactions;
  }
  return transactions.filter(
    (transaction) => new Date(transaction.date) >= startDate,
  );
}

export function filterByType(transactions, type) {
  return transactions.filter((transaction) => transaction.type === type);
}

export function getTotalByType(transactions, type) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function filterByCategory(transactions, category) {
  return transactions.filter(
    (transaction) => transaction.category === category,
  );
}

export function getRecentTransactions(transactions, count) {
  return transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);
}

export function getTransactionsByMonth(transactions, month, year) {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === month &&
      transactionDate.getFullYear() === year
    );
  });
}

export function getTransactionsByYear(transactions, year) {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getFullYear() === year;
  });
}

export function calcMonthlySpending(transactions) {
  const monthlySpending = {};
  transactions.forEach((transaction) => {
    if (transaction.type === "Expense" || transaction.type === "Bill") {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
      if (!monthlySpending[monthYear]) {
        monthlySpending[monthYear] = 0;
      }
      monthlySpending[monthYear] += transaction.amount;
    }
  });
  return monthlySpending;
}

export function calcMonthlyIncome(transactions) {
  const monthlyIncome = {};
  transactions.forEach((transaction) => {
    if (
      transaction.type === "Income" ||
      transaction.type === "Savings" ||
      transaction.type === "Investment"
    ) {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
      if (!monthlyIncome[monthYear]) {
        monthlyIncome[monthYear] = 0;
      }
      monthlyIncome[monthYear] += transaction.amount;
    }
  });
  return monthlyIncome;
}

export function makeTransactionsTableView(db, tableQuery) {}

export function makeTransactionsChartView(db, chartQuery) {}
