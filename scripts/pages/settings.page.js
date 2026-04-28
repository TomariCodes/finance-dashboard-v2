import { loadDB, saveDB } from "../core/storage.js";
import { confirmAction } from "../ui/confirm.js";
import {
  renderMessage,
  getAllRecurringTransactions,
  getAllTransactionCategories,
  getAllGoalsCategories,
  getAllInvestmentCategories,
} from "../core/settingsStore.js";
import {
  getAllTransactions,
  getAllTransactionsWithRecurring,
  deleteRecurringTemplate,
} from "../core/transactionsStore.js";
import {
  getAllCompletedGoals,
  deleteCompletedGoal,
  resetAllGoalProgress,
} from "../core/savingsGoalsStore.js";
import { getAllCompanies } from "../core/investmentsStore.js";

const fmt = (n) =>
  Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PAGE_SIZE = 8;

/**
 * Renders a paged list inside `container`.
 * `renderItem(item)` must return an HTMLElement (li or similar).
 * Pagination controls (Prev / Page N of M / Next) are appended after the list.
 */
function renderPaged(items, container, renderItem, page = 0) {
  container.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);
  const start = clampedPage * PAGE_SIZE;
  const slice = items.slice(start, start + PAGE_SIZE);

  if (items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No items found.";
    li.style.color = "var(--text-muted)";
    container.appendChild(li);
    return;
  }

  slice.forEach((item) => container.appendChild(renderItem(item)));

  if (totalPages > 1) {
    const nav = document.createElement("li");
    nav.classList.add("pagination-nav");
    nav.innerHTML = `
      <button class="action-btn" id="prevPage" ${clampedPage === 0 ? "disabled" : ""}>&#8249; Prev</button>
      <span>Page ${clampedPage + 1} of ${totalPages}</span>
      <button class="action-btn" id="nextPage" ${clampedPage >= totalPages - 1 ? "disabled" : ""}>Next &#8250;</button>
    `;
    nav
      .querySelector("#prevPage")
      .addEventListener("click", () =>
        renderPaged(items, container, renderItem, clampedPage - 1),
      );
    nav
      .querySelector("#nextPage")
      .addEventListener("click", () =>
        renderPaged(items, container, renderItem, clampedPage + 1),
      );
    container.appendChild(nav);
  }
}

async function handleDeleteAllTransactions() {
  if (!(await confirmAction())) return;
  const db = loadDB().db;
  db.transactions = [];
  db.recurringTransactions = [];
  saveDB();
  resetAllGoalProgress();
  renderMessage("success", "All transactions deleted.", "resetDB");
}

async function handleDeleteAllGoals() {
  if (!(await confirmAction())) return;
  const db = loadDB().db;
  db.goals = [];
  db.completedGoals = [];
  saveDB();
  renderMessage("success", "All goals deleted.", "resetDB");
}

async function handleDeleteAllCompanies() {
  if (!(await confirmAction())) return;
  const db = loadDB().db;
  db.companies = [];
  saveDB();
  renderMessage("success", "All companies deleted.", "resetDB");
}

// Function to initialize transaction list event listeners
function initializeTransactionListeners() {
  const recurringTransactionsEl = document.getElementById(
    "recurringTransactions",
  );
  const allTransactionHistoryEl = document.getElementById(
    "allTransactionHistory",
  );
  const allTransactionCategoriesEl = document.getElementById(
    "allTransactionCategories",
  );
  const deleteAllTransactionsEl = document.getElementById(
    "deleteAllTransactions",
  );

  if (recurringTransactionsEl) {
    recurringTransactionsEl.addEventListener(
      "click",
      handleRecurringTransactionsClick,
    );
  }
  if (allTransactionHistoryEl) {
    allTransactionHistoryEl.addEventListener(
      "click",
      handleAllTransactionHistoryClick,
    );
  }
  if (allTransactionCategoriesEl) {
    allTransactionCategoriesEl.addEventListener(
      "click",
      handleAllTransactionCategoriesClick,
    );
  }
  if (deleteAllTransactionsEl) {
    deleteAllTransactionsEl.addEventListener(
      "click",
      handleDeleteAllTransactions,
    );
  }
}

// Function to reset list to original state and re-attach listeners
function resetTransactionsList() {
  const recurringTransactionsList = document.getElementById("transactionsList");
  recurringTransactionsList.innerHTML = `
    <li id="recurringTransactions" tabindex="0">
    Recurring Transactions
    </li>
    <li tabindex="0" id="allTransactionHistory">All Transaction History</li>
      <li tabindex="0" id="allTransactionCategories">Transaction Categories</li>
      <li tabindex="0" id="deleteAllTransactions">
        Delete All Transactions
        </li>`;

  // Re-attach listeners after recreating the content
  initializeTransactionListeners();
}

// Event handler functions
function renderRecurringTransactionsList() {
  const recurringTransactions = getAllRecurringTransactions();
  const list = document.getElementById("transactionsList");

  renderPaged(recurringTransactions, list, (transaction) => {
    const listItem = document.createElement("li");
    listItem.classList.add("recurring-transaction-item");
    const info = document.createElement("span");
    info.textContent = `${transaction.description} - $${Number(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${transaction.recurrenceInterval})`;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "action-btn delete";
    deleteBtn.addEventListener("click", async () => {
      if (!(await confirmAction())) return;
      deleteRecurringTemplate(transaction.id);
      renderMessage("success", "Recurring transaction deleted.", "resetDB");
      renderRecurringTransactionsList();
    });
    listItem.appendChild(info);
    listItem.appendChild(deleteBtn);
    return listItem;
  });
}

function handleRecurringTransactionsClick() {
  const transactionsSettingsSection = document.getElementById(
    "transactionsSettings",
  );
  renderRecurringTransactionsList();

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.textContent = "Back";
  transactionsSettingsSection.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetTransactionsList();
    transactionsSettingsSection.removeChild(backButton);
  });
}

function handleAllTransactionHistoryClick() {
  const transactions = getAllTransactions();
  const list = document.getElementById("transactionsList");
  const section = document.getElementById("transactionsSettings");

  renderPaged(transactions, list, (tx) => {
    const li = document.createElement("li");
    li.textContent = `${tx.date} — ${tx.description} — $${fmt(tx.amount)} (${tx.type})`;
    return li;
  });

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.textContent = "Back";
  section.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetTransactionsList();
    section.removeChild(backButton);
  });
}

function handleAllTransactionCategoriesClick() {
  const transactionCategories = getAllTransactionCategories();
  const allTransactionCategoriesList =
    document.getElementById("transactionsList");
  const transactionsSettingsSection = document.getElementById(
    "transactionsSettings",
  );
  allTransactionCategoriesList.innerHTML = ""; // Clear existing list

  if (transactionCategories.length === 0) {
    const noTransactionsItem = document.createElement("li");
    noTransactionsItem.textContent = "No transactions found.";
    allTransactionCategoriesList.appendChild(noTransactionsItem);
  } else {
    transactionCategories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${category}`;
      allTransactionCategoriesList.appendChild(listItem);
    });
  }

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.textContent = "Back";
  transactionsSettingsSection.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetTransactionsList();
    transactionsSettingsSection.removeChild(backButton);
  });
}

function initializeGoalListeners() {
  const completedGoalsEl = document.getElementById("completedGoals");
  const goalTransactionHistoryEl = document.getElementById(
    "goalTransactionHistory",
  );
  const goalCategoriesEl = document.getElementById("goalCategories");
  const deleteAllGoalsEl = document.getElementById("deleteAllGoals");
  if (completedGoalsEl) {
    completedGoalsEl.addEventListener("click", handleCompletedGoalsClick);
  }
  if (goalTransactionHistoryEl) {
    goalTransactionHistoryEl.addEventListener(
      "click",
      handleAllGoalsTransactionHistoryClick,
    );
  }
  if (goalCategoriesEl) {
    goalCategoriesEl.addEventListener("click", handleGoalCategoriesClick);
  }
  if (deleteAllGoalsEl) {
    deleteAllGoalsEl.addEventListener("click", handleDeleteAllGoals);
  }
}

function resetGoalsList() {
  const completedGoalsList = document.getElementById("goalsList");
  completedGoalsList.innerHTML = `
    <li id="completedGoals" tabindex="0">
        Completed Goals
      </li>
      <li tabindex="0" id="goalTransactionHistory">Goal Transaction History</li>
      <li tabindex="0" id="goalCategories">Goal Categories</li>
      <li tabindex="0" id="deleteAllGoals">
        Delete All Goals
      </li>`;

  // Re-attach listeners after recreating the content
  initializeGoalListeners();
}

function renderCompletedGoalsPage() {
  const list = document.getElementById("goalsList");
  const goals = getAllCompletedGoals();
  renderPaged(goals, list, (goal) => {
    const li = document.createElement("li");
    li.classList.add("recurring-transaction-item");
    const completedDate = goal.completedDate
      ? new Date(goal.completedDate).toLocaleDateString()
      : "—";
    const info = document.createElement("span");
    info.textContent = `${goal.name} — $${fmt(goal.targetAmount)} — completed ${completedDate}`;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "action-btn delete";
    deleteBtn.addEventListener("click", async () => {
      if (!(await confirmAction())) return;
      deleteCompletedGoal(goal.id);
      renderMessage("success", "Completed goal deleted.", "resetDB");
      renderCompletedGoalsPage();
    });
    li.appendChild(info);
    li.appendChild(deleteBtn);
    return li;
  });
}

function handleCompletedGoalsClick() {
  const section = document.getElementById("goalsSettings");
  renderCompletedGoalsPage();

  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.classList.add("back-button");
  section.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetGoalsList();
    section.removeChild(backButton);
  });
}

function handleAllGoalsTransactionHistoryClick() {
  const savingsTx = getAllTransactions().filter((t) => t.type === "Savings");
  const list = document.getElementById("goalsList");
  const section = document.getElementById("goalsSettings");

  renderPaged(savingsTx, list, (tx) => {
    const li = document.createElement("li");
    const direction = tx.toTotal !== false ? "→ Savings" : "← Savings";
    li.textContent = `${tx.date} — ${tx.description} — $${fmt(tx.amount)} — ${tx.category || "—"} (${direction})`;
    return li;
  });

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.textContent = "Back";
  section.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetGoalsList();
    section.removeChild(backButton);
  });
}

function handleGoalCategoriesClick() {
  console.log("Goal categories clicked");
  const goalCategories = getAllGoalsCategories();
  const allgoalsCategoriesList = document.getElementById("goalsList");
  const goalsSettingsSection = document.getElementById("goalsSettings");
  allgoalsCategoriesList.innerHTML = ""; // Clear existing list

  if (goalCategories.length === 0) {
    const noGoalCategoriesItem = document.createElement("li");
    noGoalCategoriesItem.textContent = "No goal categories found.";
    allgoalsCategoriesList.appendChild(noGoalCategoriesItem);
  } else {
    goalCategories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.textContent = category;
      allgoalsCategoriesList.appendChild(listItem);
    });
  }

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.textContent = "Back";
  goalsSettingsSection.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetGoalsList();
    goalsSettingsSection.removeChild(backButton);
  });
}

function initializeInvestmentsListeners() {
  const investmentCompaniesEl = document.getElementById("investmentCompanies");
  const investmentTransactionHistoryEl = document.getElementById(
    "investmentTransactionHistory",
  );
  const investmentCategoriesEl = document.getElementById(
    "investmentCategories",
  );

  const deleteAllCompaniesEl = document.getElementById("deleteAllCompanies");

  if (investmentCompaniesEl) {
    investmentCompaniesEl.addEventListener(
      "click",
      handleInvestmentCompaniesClick,
    );
  }
  if (investmentTransactionHistoryEl) {
    investmentTransactionHistoryEl.addEventListener(
      "click",
      handleInvestmentsTransactionHistoryClick,
    );
  }
  if (investmentCategoriesEl) {
    investmentCategoriesEl.addEventListener(
      "click",
      handleInvestmentCategoriesClick,
    );
  }

  if (deleteAllCompaniesEl) {
    deleteAllCompaniesEl.addEventListener("click", handleDeleteAllCompanies);
  }
}

function resetInvestmentsList() {
  const investmentsList = document.getElementById("investmentsList");
  investmentsList.innerHTML = `
    <li tabindex="0" id="investmentCompanies">Investment Companies</li>
            <li tabindex="0" id="investmentTransactionHistory">Investment Transaction History</li>
            <li tabindex="0" id="investmentCategories">Investment Categories</li>
            <li tabindex="0" id="deleteAllCompanies">Delete All Companies</li>`;

  // Re-attach listeners after recreating the content
  initializeInvestmentsListeners();
}

function handleInvestmentCompaniesClick() {
  const companies = getAllCompanies();
  const investmentsList = document.getElementById("investmentsList");
  const investmentSettingsSection =
    document.getElementById("investmentSettings");
  investmentsList.innerHTML = ""; // Clear existing list

  if (companies.length === 0) {
    const noCompaniesItem = document.createElement("li");
    noCompaniesItem.textContent = "No investment companies found.";
    investmentsList.appendChild(noCompaniesItem);
  } else {
    companies.forEach((company) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${company.name} - ${company.ticker}`;
      investmentsList.appendChild(listItem);
    });
  }

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.textContent = "Back";
  investmentSettingsSection.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetInvestmentsList();
    investmentSettingsSection.removeChild(backButton);
  });
}

function handleInvestmentsTransactionHistoryClick() {
  const investmentTx = getAllTransactions().filter(
    (t) => t.type === "Investment",
  );
  const list = document.getElementById("investmentsList");
  const section = document.getElementById("investmentSettings");

  renderPaged(investmentTx, list, (tx) => {
    const li = document.createElement("li");
    const direction =
      tx.investmentDirection === "from" ? "← Investment" : "→ Investment";
    li.textContent = `${tx.date} — ${tx.description} — $${fmt(tx.amount)} — ${tx.category || "—"} (${direction})`;
    return li;
  });

  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.classList.add("back-button");
  section.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetInvestmentsList();
    section.removeChild(backButton);
  });
}

function handleInvestmentCategoriesClick() {
  console.log("Investment categories clicked");
  const investmentCategories = getAllInvestmentCategories();
  const allInvestmentCategoriesList =
    document.getElementById("investmentsList");
  const investmentSettingsSection =
    document.getElementById("investmentSettings");
  allInvestmentCategoriesList.innerHTML = ""; // Clear existing list

  if (investmentCategories.length === 0) {
    const noInvestmentCategoriesItem = document.createElement("li");
    noInvestmentCategoriesItem.textContent = "No investment categories found.";
    allInvestmentCategoriesList.appendChild(noInvestmentCategoriesItem);
  } else {
    investmentCategories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.textContent = category;
      allInvestmentCategoriesList.appendChild(listItem);
    });
  }

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.textContent = "Back";
  investmentSettingsSection.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetInvestmentsList();
    investmentSettingsSection.removeChild(backButton);
  });
}

// Initialize static event listeners
document.getElementById("saveDB").addEventListener("click", () => {
  const result = saveDB();
  renderMessage(result.status, result.message, result.function);
});

document.getElementById("deleteAllData").addEventListener("click", async () => {
  if (!(await confirmAction())) return;
  const db = loadDB().db;
  db.transactions = [];
  db.goals = [];
  db.completedGoals = [];
  db.recurringTransactions = [];
  db.companies = [];
  db.lastRecurringProcessDate = null;
  saveDB();
  renderMessage("success", "All data deleted.", "resetDB");
});

document
  .getElementById("deleteAllTransactions")
  .addEventListener("click", handleDeleteAllTransactions);

document
  .getElementById("deleteAllGoals")
  .addEventListener("click", handleDeleteAllGoals);

document
  .getElementById("deleteAllCompanies")
  .addEventListener("click", handleDeleteAllCompanies);

// Initialize transaction list listeners when page loads
initializeTransactionListeners();
initializeGoalListeners();
initializeInvestmentsListeners();
