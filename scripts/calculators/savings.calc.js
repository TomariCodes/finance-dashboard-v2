const getSavingsTotal = (savings) => {

  const savingsTotal = savings.reduce((total, saving) => {
    if (!saving.toTotal) {
      return total + saving.currentAmount;
    }
    return total;
  }, 0);
  return savingsTotal;
};

export const getSavingsGoalTotal = (savings) => {
  const savingsGoalTotal = savings.reduce((total, saving) => {
    if (!saving.toTotal) {
      return total + saving.targetAmount;
    }
    return total;
  }, 0);
  return savingsGoalTotal;
};

export const renderSavingsSummary = (savings) => {
    const totalSaved = getSavingsTotal(savings);
    const totalGoal = getSavingsGoalTotal(savings);
    const totalEarned = document.getElementById("totalEarned");
    const totalGoalElem = document.getElementById("totalDesired");
    totalEarned.textContent = `$${totalSaved.toFixed(2)}`;
    totalGoalElem.textContent = `$${totalGoal.toFixed(2)}`;

}
