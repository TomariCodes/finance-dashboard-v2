import { createModal } from "../ui/modal.js";
import { getAllTransactions } from "../core/transactionsStore.js";
import {
  getAllCompanies,
  renderInvestmentTransactionsTable,
  renderResponsiveCompaniesList,
  renderCompaniesList,
  renderInvestmentsChart,
} from "../core/investmentsStore.js";

let transactions = getAllTransactions();

const renderModal = createModal({
  titleId: "companyModalTitle",
  bodyId: "companyModalBody",
});


// Make modal functions available globally for the investment form and transactions
window.closeModal = renderModal.closeModal;
window.openModal = renderModal.openModal;

renderInvestmentsChart();

const companies = getAllCompanies();
const investmentsTable = document.querySelector(
  ".investments-transactions-table",
);
renderInvestmentTransactionsTable(investmentsTable, transactions, 3);
const companiesTable = document.querySelector(".investment-companies-table");
renderResponsiveCompaniesList(companiesTable, companies, transactions);

const addCompanyBtn = document.getElementById("addCompanyBtn");
addCompanyBtn.addEventListener("click", async () => {
  // Load the company form HTML
  const response = await fetch("components/addCompanyForm.html");
  const formHTML = await response.text();

  renderModal.openModal("Add Company", formHTML);

  // Wait for DOM to update, then initialize
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (window.initializeAddCompanyForm) {
    window.initializeAddCompanyForm();
  }
});

// Add Investment Transaction button functionality
const addInvestmentBtn = document.getElementById("addInvestmentBtn");
if (addInvestmentBtn) {
  addInvestmentBtn.addEventListener("click", async () => {
    // Load the transaction form HTML
    const response = await fetch("components/addTransactionForm.html");
    const formHTML = await response.text();

    renderModal.openModal("Add Investment Transaction", formHTML);

    // Wait for DOM to update, then initialize
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (window.initializeTransactionForm) {
      window.initializeTransactionForm({
        type: "Investment",
        disableTypeChange: false,
      });
    }
  });
}
