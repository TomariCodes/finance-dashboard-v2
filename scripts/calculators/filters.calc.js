import { getAllTransactions } from '../core/transactionsStore.js';

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

export function getTransactionsByDateAsc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
}

export function getTransactionsByDateDesc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
}

export function getTransactionsByAmountAsc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort((a, b) => a.amount - b.amount);
}

export function getTransactionsByAmountDesc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort((a, b) => b.amount - a.amount);
}

export function getTransactionsByTypeAsc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort((a, b) =>
    a.type.localeCompare(b.type, undefined, { sensitivity: "base" }),
  );
}

export function getTransactionsByTypeDesc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort((a, b) =>
    b.type.localeCompare(a.type, undefined, { sensitivity: "base" }),
  );
}



const includeTypes = ["Income", "Expense", "Savings", "Investment", "Bill"];
const excludeTypes = ["Savings", "Investment"];


export const filteredTransactions = getAllTransactions().filter((transaction) =>
  includeTypes.includes(transaction.type) && !excludeTypes.includes(transaction.type)
);

