export function applyQuery(transactions, query) {
    return transactions.filter((transaction) => {
        for (const key in query) {
            if (transaction[key] !== query[key]) {
                return false;
            }
        }        return true;
    });

}

const includeTypes = ["Income", "Expense", "Savings", "Investment", "Bill"];
const excludeTypes = ["Savings", "Investment"];


export const filteredTransactions = transactions.filter((transaction) =>
  includeTypes.includes(transaction.type) && !excludeTypes.includes(transaction.type)
);

