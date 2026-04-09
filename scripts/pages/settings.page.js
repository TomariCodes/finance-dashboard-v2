import { saveDB, resetDB } from "../core/storage.js";
import {
  renderMessage,
  getAllRecurringTransactions,
  getAllTransactionCategories,
  getAllGoalsCategories,
  getAllInvestmentCategories,
} from "../core/settingsStore.js";
import { getAllTransactionsWithRecurring } from "../core/transactionsStore.js";
import { getAllCompletedGoals } from "../core/savingsGoalsStore.js";
import { getAllCompanies } from "../core/investmentsStore.js";

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
    deleteAllTransactionsEl.addEventListener("click", () => {
      localStorage.removeItem("transactions");
      saveDB(); // Save the empty state to localStorage
      renderMessage("success", "All transactions deleted.", "resetDB");
    });
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
function handleRecurringTransactionsClick() {
  const recurringTransactions = getAllRecurringTransactions();
  const recurringTransactionsList = document.getElementById("transactionsList");
  const transactionsSettingsSection = document.getElementById(
    "transactionsSettings",
  );
  recurringTransactionsList.innerHTML = ""; // Clear existing list

  if (recurringTransactions.length === 0) {
    const noTransactionsItem = document.createElement("li");
    noTransactionsItem.textContent = "No recurring transactions found.";
    recurringTransactionsList.appendChild(noTransactionsItem);
  } else {
    recurringTransactions.forEach((transaction) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${transaction.date} - ${transaction.amount} - ${transaction.occurrenceCount}`;
      recurringTransactionsList.appendChild(listItem);
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

function handleAllTransactionHistoryClick() {
  const transactions = getAllTransactionsWithRecurring();
  const allTransactionHistoryList = document.getElementById("transactionsList");
  const transactionsSettingsSection = document.getElementById(
    "transactionsSettings",
  );
  allTransactionHistoryList.innerHTML = ""; // Clear existing list

  if (transactions.length === 0) {
    const noTransactionsItem = document.createElement("li");
    noTransactionsItem.textContent = "No transactions found.";
    allTransactionHistoryList.appendChild(noTransactionsItem);
  } else {
    transactions.forEach((transaction) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${transaction.description} - ${transaction.amount} - ${transaction.type}`;
      allTransactionHistoryList.appendChild(listItem);
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
    deleteAllGoalsEl.addEventListener("click", () => {
      localStorage.removeItem("goals");
      saveDB(); // Save the empty state to localStorage
      renderMessage("success", "All goals deleted.", "resetDB");
    });
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

function handleCompletedGoalsClick() {
  const completedGoals = getAllCompletedGoals();
  const completedGoalsList = document.getElementById("goalsList");
  const goalsSettingsSection = document.getElementById("goalsSettings");
  completedGoalsList.innerHTML = ""; // Clear existing list

  if (completedGoals.length === 0) {
    const noGoalsItem = document.createElement("li");
    noGoalsItem.textContent = "No completed goals found.";
    completedGoalsList.appendChild(noGoalsItem);
  } else {
    completedGoals.forEach((goal) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${goal.name} - ${goal.amount} - ${goal.status}`;
      completedGoalsList.appendChild(listItem);
    });
  }

  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.classList.add("back-button");
  goalsSettingsSection.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetGoalsList();
    goalsSettingsSection.removeChild(backButton);
  });
}

function handleAllGoalsTransactionHistoryClick() {
  const transactions = getAllRecurringTransactions();
  const goalTransactions = transactions.filter(
    (transaction) => transaction.type === "savings",
  );
  const allGoalsHistoryList = document.getElementById("goalsList");
  const goalsSettingsSection = document.getElementById("goalsSettings");
  allGoalsHistoryList.innerHTML = ""; // Clear existing list

  if (goalTransactions.length === 0) {
    const noTransactionsItem = document.createElement("li");
    noTransactionsItem.textContent = "No goal transactions found.";
    allGoalsHistoryList.appendChild(noTransactionsItem);
  } else {
    goalTransactions.forEach((transaction) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${transaction.name} - ${transaction.amount} - ${transaction.frequency}`;
      allGoalsHistoryList.appendChild(listItem);
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
    deleteAllCompaniesEl.addEventListener("click", () => {
      localStorage.removeItem("companies");
      saveDB(); // Save the empty state to localStorage
      renderMessage("success", "All companies deleted.", "resetDB");
    });
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
      listItem.textContent = `${company.name} - ${company.investmentAmount}`;
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
  const transactions = getAllRecurringTransactions();
  const investmentTransactions = transactions.filter(
    (transaction) => transaction.type === "investment",
  );
  const allInvestmentHistoryList = document.getElementById("investmentsList");
  const investmentSettingsSection =
    document.getElementById("investmentSettings");
  allInvestmentHistoryList.innerHTML = ""; // Clear existing list

  if (investmentTransactions.length === 0) {
    const noTransactionsItem = document.createElement("li");
    noTransactionsItem.textContent = "No investment transactions found.";
    allInvestmentHistoryList.appendChild(noTransactionsItem);
  } else {
    investmentTransactions.forEach((transaction) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${transaction.name} - ${transaction.amount} - ${transaction.frequency}`;
      allInvestmentHistoryList.appendChild(listItem);
    });
  }

  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.classList.add("back-button");
  investmentSettingsSection.appendChild(backButton);
  backButton.addEventListener("click", () => {
    resetInvestmentsList();
    investmentSettingsSection.removeChild(backButton);
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

document.getElementById("deleteAllData").addEventListener("click", () => {
  const result = resetDB();
  renderMessage(result.status, result.message, result.function);
});

document
  .getElementById("deleteAllTransactions")
  .addEventListener("click", () => {
    localStorage.removeItem("transactions");
    saveDB(); // Save the empty state to localStorage
    renderMessage("success", "All transactions deleted.", "resetDB");
  });

document.getElementById("deleteAllGoals").addEventListener("click", () => {
  localStorage.removeItem("goals");
  saveDB(); // Save the empty state to localStorage
  renderMessage("success", "All goals deleted.", "resetDB");
});

document.getElementById("deleteAllCompanies").addEventListener("click", () => {
  localStorage.removeItem("companies");
  saveDB(); // Save the empty state to localStorage
  renderMessage("success", "All companies deleted.", "resetDB");
});

// Initialize transaction list listeners when page loads
initializeTransactionListeners();
initializeGoalListeners();
initializeInvestmentsListeners();
