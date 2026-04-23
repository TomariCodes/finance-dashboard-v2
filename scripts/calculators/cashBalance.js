import { getAllGoals, updateGoal } from "../core/savingsGoalsStore.js";
import { getAllTransactions } from "../core/transactionsStore.js";

export function calculateCashBalance(transactions) {
  if (transactions) {
    let posTotal = transactions
      .filter((t) => {
        if (t.type === "Income") return true;
        if (t.type === "Savings" && t.toTotal === false) return true; // Money coming from savings (toTotal = false)
        if (t.type === "Investment" && t.investmentDirection === "from")
          return true; // Money coming from investments
      })
      .reduce((balance, t) => balance + t.amount, 0);

    let negTotal = transactions
      .filter((t) => {
        if (t.type === "Expense" || t.type === "Bill") return true;
        if (t.type === "Savings" && t.toTotal === true) return true; // Money going to savings (toTotal = true)
        if (t.type === "Investment" && t.investmentDirection === "to")
          return true; // Money going to investments
      })
      .reduce((balance, t) => balance + t.amount, 0);
    return (posTotal - negTotal).toFixed(2);
  }
}

export function getCurrentCashBalance() {
  const transactions = getAllTransactions();
  return Number(calculateCashBalance(transactions));
}

export default calculateCashBalance;

export function addToSavingsGoal(amount, savingsName, goals) {
  if (savingsName) {
    const goal = goals.find((g) => g.name === savingsName);
    if (goal) {
      goal.currentAmount = parseFloat(goal.currentAmount) + parseFloat(amount);
      updateGoal(goal.id, { currentAmount: goal.currentAmount });
    }
  }
}

export function removeFromSavingsGoal(amount, savingsName, goals) {
  if (savingsName) {
    const goal = goals.find((g) => g.name === savingsName);
    if (goal) {
      goal.currentAmount = parseFloat(goal.currentAmount) - parseFloat(amount);
      updateGoal(goal.id, { currentAmount: goal.currentAmount });
    }
  }
}
