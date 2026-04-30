import { loadDB } from "../core/storage.js";

// Compute total saved as the sum of currentAmount across all active goals.
// This stays correct regardless of how transactions are added/removed because
// goal.currentAmount is kept in sync whenever transactions are created or
// deleted.
const getSavingsTotal = () => {
  const goals = loadDB().db.goals || [];
  return goals.reduce((sum, g) => sum + parseFloat(g.currentAmount || 0), 0);
};

export const getSavingsGoalTotal = (savings) => {
  const savingsGoalTotal = savings.reduce((total, saving) => {
    if (!saving.toTotal) {
      return total + parseFloat(saving.targetAmount || 0);
    }
    return total;
  }, 0);
  return savingsGoalTotal;
};

export const renderSavingsSummary = (savings) => {
  const fmt = (n) =>
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const totalSaved = getSavingsTotal();
  const totalGoal = getSavingsGoalTotal(savings);
  const totalEarned = document.getElementById("totalEarned");
  const totalGoalElem = document.getElementById("totalDesired");
  totalEarned.textContent = `$${fmt(totalSaved)}`;
  totalGoalElem.textContent = `$${fmt(totalGoal)}`;
};
