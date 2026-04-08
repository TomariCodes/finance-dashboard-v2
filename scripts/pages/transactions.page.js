import { createChartUI, updateChartUI } from "../ui/chart.ui.js"; // Ensure charts are loaded for the dashboard
import { createModal } from "../ui/modal.js";
import * as storage from "../core/transactionsStore.js";
import {
  getTotalByType,
  filterByDateRange,
} from "../calculators/transactions.calc.js";

let transactions = storage.getAllTransactions();
const renderModal = createModal();
let transactionsRendered = false; // Flag to prevent double rendering

// Make closeModal available globally for the transaction form
window.closeModal = renderModal.closeModal;

document
  .getElementById("addTransactionBtn")
  .addEventListener("click", async () => {
    const modalBody = document.getElementById("modalBody");

    // Ensure the form component is loaded
    if (!modalBody.innerHTML.trim()) {
      try {
        const response = await fetch("components/addTransactionForm.html");
        if (response.ok) {
          modalBody.innerHTML = await response.text();
        } else {
          console.error("Failed to load add transaction form");
          return;
        }
      } catch (error) {
        console.error("Error loading add transaction form:", error);
        return;
      }
    }

    renderModal.openModal("Add Transaction", modalBody.innerHTML);

    // Reinitialize the form in the modal
    setTimeout(() => {
      if (window.initializeTransactionForm) {
        window.initializeTransactionForm();
      }
    }, 0);
  });

// Store chart references for updating
let transactionsChart = null;
let allCategoriesChart = null;

// Make updateTransaction available globally for the form
window.updateTransaction = (id, data) => {
  const success = storage.updateTransaction(id, data);
  if (success) {
    transactions = storage.getAllTransactions(); // Refresh local data
    storage.renderResponsiveTransactions(); // Re-render the table
    updateCharts(); // Update charts after editing
  }
  return success;
};

// Make refreshTransactions available globally for the form
window.refreshTransactions = () => {
  transactions = storage.getAllTransactions(); // Refresh local data
  storage.renderResponsiveTransactions(); // Re-render the table
  updateCharts(); // Update charts after refresh
};

// Function to update charts with current transaction data
function updateCharts(filteredTransactions = transactions) {
  const updateData = filteredTransactions;

  if (transactionsChart) {
    const transactionsData = [
      getTotalByType(updateData, "Income"),
      getTotalByType(updateData, "Expense"),
      getTotalByType(updateData, "Bill"),
    ];
    transactionsChart.data.datasets[0].data = transactionsData;
    transactionsChart.update();
  }

  if (allCategoriesChart) {
    const allCategoriesData = [
      getTotalByType(updateData, "Income"),
      getTotalByType(updateData, "Expense"),
      getTotalByType(updateData, "Bill"),
      getTotalByType(updateData, "Savings"),
      getTotalByType(updateData, "Investment"),
    ];
    allCategoriesChart.data.datasets[0].data = allCategoriesData;
    allCategoriesChart.update();
  }
}

// Make updateCharts available globally
window.updateCharts = updateCharts;

document.addEventListener("componentsLoaded", () => {
  if (!transactionsRendered) {
    console.log("Components loaded, rendering transactions...");
    storage.renderResponsiveTransactions();
    transactionsRendered = true;
  }
});

// Fallback: Try to render transactions after DOM is loaded, even if componentsLoaded doesn't fire
document.addEventListener("DOMContentLoaded", () => {
  // Give some time for components to load, then render if not already done
  setTimeout(() => {
    if (!transactionsRendered) {
      const tbody = document.getElementById("transactionsTableBody");
      if (tbody && tbody.children.length === 0) {
        console.log("Fallback: rendering transactions after DOMContentLoaded");
        storage.renderResponsiveTransactions();
        transactionsRendered = true;
      }
    }
  }, 500); // Wait 500ms for async component loading
});

document.addEventListener("transactionsFiltered", (e) => {
  const filteredTransactions = e.detail.transactions;
  storage.renderResponsiveTransactions(filteredTransactions);
  updateCharts(filteredTransactions);
});

document.getElementById("filter").addEventListener("change", (e) => {
  const filterValue = e.target.value;

  let sortedTransactions = [...transactions];
  switch (filterValue) {
    case "dateAsc":
      sortedTransactions = storage.getTransactionsByDateAsc();
      break;
    case "dateDesc":
      sortedTransactions = storage.getTransactionsByDateDesc();
      break;
    case "amountAsc":
      sortedTransactions = storage.getTransactionsByAmountAsc();
      break;
    case "amountDesc":
      sortedTransactions = storage.getTransactionsByAmountDesc();
      break;
    case "typeAsc":
      sortedTransactions = storage.getTransactionsByTypeAsc();
      break;
    case "typeDesc":
      sortedTransactions = storage.getTransactionsByTypeDesc();
      break;
    default:
      sortedTransactions = [...transactions];
  }
  storage.renderResponsiveTransactions(sortedTransactions);
});

document.getElementById("filterChart").addEventListener("change", (e) => {
  const filterValue = e.target.value;

  let filteredTransactions = [...transactions];

  const dateRangeFilters = [
    "last7Days",
    "last30Days",
    "thisMonth",
    "lastMonth",
    "thisYear",
    "lastYear",
  ];

  if (dateRangeFilters.includes(filterValue)) {
    // Use date range filtering for charts
    filteredTransactions = filterByDateRange(
      storage.getAllTransactions(),
      filterValue,
    );
  } else {
    // Show all transactions (default)
    filteredTransactions = storage.getAllTransactions();
  }

  // Only update charts, not the table
  updateCharts(filteredTransactions);
});

transactionsChart =
  transactions.length > 0
    ? createChartUI(document.getElementById("transactionsChart"), 
        ["Income", "Expense", "Bill"],
        [
          getTotalByType(transactions, "Income"),
          getTotalByType(transactions, "Expense"),
          getTotalByType(transactions, "Bill"),
        ],
      )
    : createChartUI(
        document.getElementById("transactionsChart"),
        ["No Data"],
        [1],
      );

allCategoriesChart =
  transactions.length > 0
    ? createChartUI(
        document.getElementById("allCategoriesChart"),
        ["Income", "Expense", "Bill", "Savings", "Investment"],
        [
          getTotalByType(transactions, "Income"),
          getTotalByType(transactions, "Expense"),
          getTotalByType(transactions, "Bill"),
          getTotalByType(transactions, "Savings"),
          getTotalByType(transactions, "Investment"),
        ],
      )
    : createChartUI(
        document.getElementById("allCategoriesChart"),
        ["No Data"],
        [1],
      );
