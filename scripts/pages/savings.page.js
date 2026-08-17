import { createModal } from "../ui/modal.js";
import { renderSavingsSummary } from "../calculators/savings.calc.js";
import {
  renderSavingsChart,
  renderResponsiveGoalsTable,
  renderGoalsTable,
  checkAndCompleteGoals,
  reconcileGoalAmountsFromTransactions,
} from "../core/savingsGoalsStore.js";
import { getTransactions, getGoals, getCompanies, saveDB } from "../core/storage.js"


// Fix any goal amounts that were never updated by recurring transaction backfill
reconcileGoalAmountsFromTransactions();

renderSavingsSummary(getGoals());
// Make functions available globally for goal updates
window.renderSavingsSummary = () => renderSavingsSummary(getAllGoals());

const renderModal = createModal({
  titleId: "goalModalTitle",
  bodyId: "goalModalBody",
});

// Make chart renderer available globally
window.renderSavingsChart = renderSavingsChart;
// Make goals table renderer available globally (used by transaction-delete path)
window.renderGoalsTable = renderGoalsTable;

// Make modal functions available globally for the goal form and savings transactions
window.closeModal = renderModal.closeModal;
window.openModal = renderModal.openModal;
renderResponsiveGoalsTable();
checkAndCompleteGoals();

document.getElementById("addGoalBtn").addEventListener("click", async () => {
  // Load the goal form HTML
  const response = await fetch("components/addGoalForm.html");
  const formHTML = await response.text();

  renderModal.openModal("Add Goal", formHTML);

  // Wait for DOM to update, then initialize
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (window.initializeAddGoalForm) {
    window.initializeAddGoalForm();
  }
});

renderSavingsChart();
