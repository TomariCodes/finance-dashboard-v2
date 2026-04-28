import { getAllTransactions } from "../core/transactionsStore.js";
import { loadDB } from "../core/storage.js";

// Compute total saved from transactions so the value is unaffected by goal
// completion/deletion. Sums all "to savings" transactions minus "from savings".
const getSavingsTotal = () => {
  const transactions = getAllTransactions();
  // Exclude transactions belonging to completed goals so the total only
  // reflects money currently in active savings goals.
  const completedGoalNames = new Set(
    (loadDB().db.completedGoals || []).map((g) => g.name),
  );
  console.log(
    "[getSavingsTotal] all non-template transactions:",
    transactions.length,
    transactions.map((t) => ({
      type: t.type,
      amount: t.amount,
      toTotal: t.toTotal,
      isTemplate: t.isTemplate,
    })),
  );
  console.log("[getSavingsTotal] completed goal names excluded:", [
    ...completedGoalNames,
  ]);
  const savingsTx = transactions.filter(
    (t) => t.type === "Savings" && !completedGoalNames.has(t.category),
  );
  console.log("[getSavingsTotal] savings transactions:", savingsTx);
  const toTotal = savingsTx
    .filter((t) => t.toTotal !== false)
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const fromTotal = savingsTx
    .filter((t) => t.toTotal === false)
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  console.log(
    `[getSavingsTotal] toTotal=${toTotal}, fromTotal=${fromTotal}, net=${toTotal - fromTotal}`,
  );
  return toTotal - fromTotal;
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
