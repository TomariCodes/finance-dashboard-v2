import { getAllGoals, updateGoal } from "../core/savingsGoalsStore.js";
import { getAllTransactions } from "../core/transactionsStore.js";

export function calculateCashBalance(transactions) {
  if (transactions) {
    let posTotal = transactions
      .filter((t) => {
        if (t.type === "Income") return true;
        if (t.type === "Savings" && t.toTotal === false) return true;
        if (t.type === "Investment" && t.investmentDirection === "from")
          return true;
      })
      .reduce((balance, t) => balance + parseFloat(t.amount), 0);

    let negTotal = transactions
      .filter((t) => {
        if (t.type === "Expense" || t.type === "Bill") return true;
        // toTotal===true OR missing defaults to "going to savings" (negative)
        if (t.type === "Savings" && t.toTotal !== false) return true;
        // investmentDirection==="to" OR missing defaults to "going to investment" (negative)
        if (t.type === "Investment" && t.investmentDirection !== "from")
          return true;
      })
      .reduce((balance, t) => balance + parseFloat(t.amount), 0);
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
