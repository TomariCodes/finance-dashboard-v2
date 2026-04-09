import { getAllGoals } from "../core/savingsGoalsStore.js";
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

// Helper function to get current cash balance from all transactions
export function getCurrentCashBalance() {
  const transactions = getAllTransactions(); // This gets all instances, excluding templates
  return Number(calculateCashBalance(transactions));
}

// Legacy variable - deprecated, use getCurrentCashBalance() instead
let cashBalance = getCurrentCashBalance();

export default calculateCashBalance;

export function addToSavingsGoal(amount, savingsName, goals) {
  console.log(
    "Adding to savings goal. Amount to add:",
    amount,
    "Savings name:",
    savingsName,
  );
  if (savingsName) {
    const goal = goals.find((g) => g.name === savingsName);
    if (goal) {
      goal.currentAmount = parseFloat(goal.currentAmount) + parseFloat(amount);
      localStorage.setItem("savingsGoals", JSON.stringify(goals));
      console.log(
        `Added ${amount} to savings goal "${savingsName}". New current amount: ${goal.currentAmount}`,
      );
      console.log(
        `Cash balance is now calculated from transactions automatically`,
      );
    }
  }
}

export function removeFromSavingsGoal(amount, savingsName, goals) {
  console.log(
    "Removing from savings goal. Amount to remove:",
    amount,
    "Savings name:",
    savingsName,
  );
  if (savingsName) {
    const goal = goals.find((g) => g.name === savingsName);
    if (goal) {
      goal.currentAmount = parseFloat(goal.currentAmount) - parseFloat(amount);
      localStorage.setItem("savingsGoals", JSON.stringify(goals));
      console.log(
        `Removed ${amount} from savings goal "${savingsName}". New current amount: ${goal.currentAmount}`,
      );
    }
  }
}

// Legacy functions kept for backwards compatibility - these are now deprecated
export function addToCashBalance(cashBalance, amount, savingsName) {
  console.log(
    "DEPRECATED: addToCashBalance called. Use addToSavingsGoal instead.",
  );
  if (savingsName) {
    addToSavingsGoal(amount, savingsName, getAllGoals());
  }
  return (parseFloat(cashBalance) + parseFloat(amount)).toFixed(2);
}

export function removeFromCashBalance(cashBalance, amount, savingsName) {
  console.log(
    "DEPRECATED: removeFromCashBalance called. Use removeFromSavingsGoal instead.",
  );
  if (savingsName) {
    removeFromSavingsGoal(amount, savingsName, getAllGoals());
  }
  return (parseFloat(cashBalance) - parseFloat(amount)).toFixed(2);
}
