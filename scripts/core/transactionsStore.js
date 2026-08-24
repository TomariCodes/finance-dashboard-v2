import { createModal } from "../ui/modal.js";
import { setRecurrence } from "./dates.js";
import { confirmAction } from "../ui/confirm.js";
import {
  getTransactions,
  saveDB,
  loadDB,
} from "./storage.js";
import {
  processRecurringTransactions,
  getRecurringTransactionTemplates,
} from "./recurring.js";

const fmt = (n) =>
  Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function getAllTransactions() {
  return (getTransactions() || [])
    .filter((t) => !t.isTemplate)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}



try {
  processRecurringTransactions();
} catch (e) {
  console.error("processRecurringTransactions failed:", e);
}

let transactions = getTransactions();

export function handleEditTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (transaction) {
    editTransaction(id, transaction);
  }
}

export async function handleDeleteTransaction(id) {
  if (!(await confirmAction())) return;

  // Before removing the transaction, reverse its effect on the associated
  // savings goal so the goal's currentAmount stays in sync.
  const db = loadDB().db;
  const tx = (db.transactions || []).find((t) => t.id === id);
  if (tx && tx.type === "Savings") {
    const goal = (db.goals || []).find((g) => g.name === tx.category);
    if (goal) {
      const amt = parseFloat(tx.amount || 0);
      if (tx.toTotal !== false) {
        // Transaction was adding to the goal — subtract it back
        goal.currentAmount = Math.max(
          0,
          parseFloat(goal.currentAmount || 0) - amt,
        );
      } else {
        // Transaction was removing from the goal — add it back
        goal.currentAmount = parseFloat(goal.currentAmount || 0) + amt;
      }
    }
  }

  deleteTransaction(id);
  renderTransactions();
  if (window.updateCharts) window.updateCharts();
  if (window.renderSavingsSummary) window.renderSavingsSummary();
  if (window.renderGoalsTable) window.renderGoalsTable();
}

export function renderTransactions(
  transactionsToRender = transactions,
) {
  const transactionsTableBody = document.getElementById(
    "transactionsTableBody",
  );

  if (!transactionsTableBody) {
    console.error("Cannot find transactionsTableBody element");
    return;
  }
  transactionsTableBody.innerHTML = "";

  const validTransactions = transactionsToRender.filter(
    (transaction) =>
      transaction &&
      transaction.id &&
      transaction.date &&
      transaction.type &&
      transaction.amount &&
      transaction.amount !== null &&
      transaction.amount !== undefined &&
      transaction.category,
  );

  if (validTransactions.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="text-center p-3">No data to display</td>`;
    transactionsTableBody.appendChild(row);
    return;
  }
  validTransactions.forEach((transaction) => {
    const row = document.createElement("tr");
    const typeDisplay = transaction.isRecurring
      ? `${transaction.type} 🔄`
      : transaction.type;
    row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${typeDisplay}</td>
      <td>$${fmt(transaction.amount)}</td>
      <td class="d-none d-lg-table-cell text-center">${transaction.description}</td>
      <td class="d-none d-lg-table-cell text-center">${transaction.category}</td>
      <td>
      <button class="edit-btn" data-id="${transaction.id}">Edit</button>
      <button class="delete-btn" data-id="${transaction.id}">Delete</button>
      </td>
      `;

    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    editBtn.addEventListener("click", () =>
      handleEditTransaction(transaction.id),
    );
    deleteBtn.addEventListener("click", () =>
      handleDeleteTransaction(transaction.id),
    );
    transactionsTableBody.appendChild(row);
  });
}

export function addTransaction(data) {
  const newTransaction = {
    id: Date.now(),
    type: "",
    date: "",
    description: "",
    amount: 0,
    category: "",
  };

  if (data) {
    newTransaction.date = data.date;
    newTransaction.type = data.type;
    newTransaction.description = data.description;
    newTransaction.amount = parseFloat(data.amount);
    newTransaction.category = data.category;

    // Copy additional properties if they exist
    if (data.toTotal !== undefined) newTransaction.toTotal = data.toTotal;
    if (data.investmentDirection)
      newTransaction.investmentDirection = data.investmentDirection;
    if (data.isRecurring) {
      newTransaction.isRecurring = data.isRecurring;
      if (data.isTemplate !== undefined)
        newTransaction.isTemplate = data.isTemplate;
      if (data.templateId) newTransaction.templateId = data.templateId;
      if (data.occurrenceNumber)
        newTransaction.occurrenceNumber = data.occurrenceNumber;
      if (data.occurrenceCount !== undefined)
        newTransaction.occurrenceCount = data.occurrenceCount;
      if (data.recurrenceInterval)
        newTransaction.recurrenceInterval = data.recurrenceInterval;
      if (data.lastProcessed) newTransaction.lastProcessed = data.lastProcessed;
      if (data.nextDue) newTransaction.nextDue = data.nextDue;
      if (data.lastRecurringProcessDate)
        newTransaction.lastRecurringProcessDate = data.lastRecurringProcessDate;
      if (data.createdDate) newTransaction.createdDate = data.createdDate;
    }
  }

  loadDB().db.transactions.push(newTransaction);
  saveDB();
  return newTransaction;
}


export function deleteTransaction(id) {
  const db = loadDB().db;
  db.transactions = db.transactions.filter((t) => t.id !== id);
  saveDB();
  transactions = getAllTransactions();
}



export function updateTransaction(id, data) {
  const db = loadDB().db;
  const transactionIndex = db.transactions.findIndex(
    (t) => t.id === parseInt(id),
  );

  if (transactionIndex !== -1) {
    db.transactions[transactionIndex] = {
      ...db.transactions[transactionIndex],
      date: data.date,
      type: data.type,
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
      ...(data.isTemplate !== undefined && { isTemplate: data.isTemplate }),
      ...(data.templateId && { templateId: data.templateId }),
      ...(data.occurrenceNumber && { occurrenceNumber: data.occurrenceNumber }),
      ...(data.occurrenceCount !== undefined && {
        occurrenceCount: data.occurrenceCount,
      }),
      ...(data.recurrenceInterval && {
        recurrenceInterval: data.recurrenceInterval,
      }),
      ...(data.lastProcessed && { lastProcessed: data.lastProcessed }),
      ...(data.nextDue && { nextDue: data.nextDue }),
      ...(data.lastRecurringProcessDate && {
        lastRecurringProcessDate: data.lastRecurringProcessDate,
      }),
      ...(data.toTotal !== undefined && { toTotal: data.toTotal }),
      ...(data.investmentDirection && {
        investmentDirection: data.investmentDirection,
      }),
    };
    saveDB();
    transactions = getAllTransactions();
    return true;
  }
  return false;
}

export function editTransaction(id, transactionData) {
  console.log("Edit transaction with ID:", id);

  const allTransactions = loadDB().db.transactions;
  const matchingTransaction = allTransactions.find((t) => t.id === id);

  if (matchingTransaction) {
    console.log("Found transaction to edit:", matchingTransaction);

    // Only create modal if the required DOM elements exist
    const modalRoot = document.getElementById("appModal");
    const modalBody = document.getElementById("modalBody");

    if (modalRoot && modalBody) {
      const renderModal = createModal();
      // Open the modal with the transaction data pre-filled
      renderModal.openModal("Edit Transaction", modalBody.innerHTML);

      // Pre-fill the form after the modal is opened
      setTimeout(() => {
        const form = document.querySelector("#addTransactionForm");
        if (form) {
          // Use the correct ID-based selectors
          form.querySelector("#date").value = matchingTransaction.date;
          form.querySelector("#type").value = matchingTransaction.type;
          form.querySelector("#description").value =
            matchingTransaction.description;
          form.querySelector("#amount").value =
            matchingTransaction.amount.toFixed(2);
          form.querySelector("#category").value = matchingTransaction.category;

          // Store the transaction ID for updating
          form.setAttribute("data-edit-id", id);
        }

        // Reinitialize the form
        if (window.initializeTransactionForm) {
          window.initializeTransactionForm();
        }
      }, 100);
    } else {
      console.warn("Modal elements not found. Cannot open edit modal.");
    }
  }
}

// Initialize search functionality after DOM is ready
function initializeSearch() {
  const searchBar = document.querySelector("#search");

  if (searchBar) {
    searchBar.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredTransactions = transactions.filter((transaction) => {
        // Only search through valid transactions
        if (
          !transaction ||
          !transaction.description ||
          !transaction.type ||
          transaction.amount === null ||
          transaction.amount === undefined ||
          !transaction.category
        ) {
          return false;
        }

        return (
          transaction.description.toLowerCase().includes(searchTerm) ||
          transaction.type.toLowerCase().includes(searchTerm) ||
          transaction.amount.toString().includes(searchTerm) ||
          transaction.category.toLowerCase().includes(searchTerm)
        );
      });
      const event = new CustomEvent("transactionsFiltered", {
        detail: { transactions: filteredTransactions },
      });
      document.dispatchEvent(event);
    });
  }
}

// Initialize search when components are loaded
document.addEventListener("componentsLoaded", initializeSearch);
document.addEventListener("DOMContentLoaded", initializeSearch);


