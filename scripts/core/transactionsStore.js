/*
TESTING RECURRING TRANSACTIONS:

1. Create a recurring transaction with a start date of yesterday:
   - Set date to yesterday (e.g., if today is 2026-03-26, set to 2026-03-25)
   - Select "daily" recurrence
   - Submit the form

2. Check the results:
   - You should see the original transaction for yesterday
   - You should also see a new transaction for today (created automatically)
   - The original transaction should show "(Next: tomorrow's date)" in description

3. Test with browser console:
   - Open browser console (F12)
   - Type: debugRecurringTransactions()
   - This will show you all recurring transactions and their due dates

4. Test manual processing:
   - Type: processRecurringTransactionsManually()
   - This forces the system to check for due recurring transactions

Note: Recurring transactions are automatically processed once per day when the app loads.
Duplicates are prevented by checking for existing transactions on the same date.
*/

import { createModal } from "../ui/modal.js";
import { setRecurrence } from "./dates.js";

// Track when we last processed recurring transactions to prevent duplicates
let lastRecurringProcessDate =
  localStorage.getItem("lastRecurringProcessDate") || null;

export function getAllTransactions() {
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  return transactions;
}

// Separate function to process recurring transactions
export function processRecurringTransactions(force = false) {
  const today = new Date().toISOString().split("T")[0];

  // Only process once per day unless forced
  if (!force && lastRecurringProcessDate === today) {
    console.log("Recurring transactions already processed today");
    return false;
  }

  let currentTransactions =
    JSON.parse(localStorage.getItem("transactions")) || [];
  let newTransactionsAdded = false;

  // Get all recurring transactions
  const recurringTransactions = currentTransactions.filter(
    (t) => t.isRecurring && t.recurrenceInterval,
  );

  for (const recurringTransaction of recurringTransactions) {
    // Skip if this recurring transaction doesn't have the necessary metadata
    if (!recurringTransaction.nextDue || !recurringTransaction.lastProcessed) {
      continue;
    }

    // Check if the next due date has passed
    while (recurringTransaction.nextDue <= today) {
      // Check if a transaction already exists for this date and recurring transaction
      const existsForDate = currentTransactions.some(
        (t) =>
          t.isRecurring &&
          t.date === recurringTransaction.nextDue &&
          t.description === recurringTransaction.description &&
          t.amount === recurringTransaction.amount &&
          t.category === recurringTransaction.category,
      );

      if (!existsForDate) {
        // Create the new recurring transaction
        const newTransaction = {
          id: Date.now() + Math.random(),
          type: recurringTransaction.type,
          date: recurringTransaction.nextDue,
          description: recurringTransaction.description,
          amount: recurringTransaction.amount,
          category: recurringTransaction.category,
          isRecurring: true,
          recurrenceInterval: recurringTransaction.recurrenceInterval,
          lastProcessed: recurringTransaction.nextDue,
          nextDue: setRecurrence(
            new Date(recurringTransaction.nextDue),
            recurringTransaction.recurrenceInterval,
          )
            .toISOString()
            .split("T")[0],
          ...(recurringTransaction.toTotal !== undefined && {
            toTotal: recurringTransaction.toTotal,
          }),
          ...(recurringTransaction.investmentDirection && {
            investmentDirection: recurringTransaction.investmentDirection,
          }),
        };

        currentTransactions.push(newTransaction);
        newTransactionsAdded = true;
        console.log(
          `Added recurring transaction: ${newTransaction.description} for ${newTransaction.date}`,
        );
      } else {
        console.log(
          `Skipping duplicate recurring transaction: ${recurringTransaction.description} for ${recurringTransaction.nextDue}`,
        );
      }

      // Update the original recurring transaction's next due date and last processed
      recurringTransaction.lastProcessed = recurringTransaction.nextDue;
      recurringTransaction.nextDue = setRecurrence(
        new Date(recurringTransaction.nextDue),
        recurringTransaction.recurrenceInterval,
      )
        .toISOString()
        .split("T")[0];
    }
  }

  // Save if new transactions were added
  if (newTransactionsAdded) {
    localStorage.setItem("transactions", JSON.stringify(currentTransactions));
    console.log("Processed recurring transactions - new transactions added");
  }

  // Update the last processed date
  lastRecurringProcessDate = today;
  localStorage.setItem("lastRecurringProcessDate", today);

  return newTransactionsAdded;
}

// Function to get all transactions including processing recurring ones
export function getAllTransactionsWithRecurring() {
  processRecurringTransactions();
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

// Helper function to manually trigger recurring transaction processing
export function processRecurringTransactionsManually() {
  const wasProcessed = processRecurringTransactions(true); // Force processing
  transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  console.log(
    `Manual recurring transaction processing completed. New transactions added: ${wasProcessed}`,
  );
}

// Debug function to test recurring transactions
export function debugRecurringTransactions() {
  const recurringTransactions = transactions.filter(
    (t) => t.isRecurring && t.recurrenceInterval,
  );
  console.log("Current recurring transactions:", recurringTransactions);

  const today = new Date().toISOString().split("T")[0];
  console.log("Today's date:", today);

  recurringTransactions.forEach((transaction) => {
    console.log(`Transaction "${transaction.description}":
    - Last processed: ${transaction.lastProcessed}
    - Next due: ${transaction.nextDue}
    - Due today? ${transaction.nextDue <= today ? "YES" : "NO"}`);
  });
}

// Initialize transactions and process recurring ones on first load
processRecurringTransactions();
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

export function handleEditTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (transaction) {
    editTransaction(id, transaction);
  }
}

// Handle delete transaction
export function handleDeleteTransaction(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    deleteTransaction(id); // Refresh local data
    renderTransactions(); // Re-render the table
    updateCharts(); // Update charts after deletion
  }
}

export function renderResponsiveTransactions(
  transactionsToRender = transactions,
) {
  const userWidth = window.innerWidth;
  console.log(userWidth);

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
  const headRow = document.getElementById("transactionsTableHeadRow");

  if (validTransactions.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" style="text-align: center; padding: 20px;">No transactions found.</td>`;
    transactionsTableBody.appendChild(row);
    return;
  }

  if (headRow.children.length >= 6) {
    validTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      const typeDisplay = transaction.isRecurring
        ? `${transaction.type} 🔄`
        : transaction.type;
      row.innerHTML = `
       <td>${transaction.date}</td>
       <td>${typeDisplay}</td>
       <td>$${transaction.amount.toFixed(2)}</td>
       <td>${transaction.description}</td>
       <td>${transaction.category}</td>
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
  } else if (userWidth <= 400 && headRow.children.length <= 4) {
    headRow.maxLength = 4;
    const actionTh = document.createElement("th");
    actionTh.innerHTML = "Actions";
    headRow.appendChild(actionTh);
    validTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      const typeDisplay = transaction.isRecurring
        ? `${transaction.type} 🔄`
        : transaction.type;
      row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${typeDisplay}</td>
      <td>$${transaction.amount.toFixed(2)}</td>
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
  } else if (
    userWidth >= 700 &&
    userWidth < 1400 &&
    headRow.children.length <= 5
  ) {
    console.log("Rendering medium screen transactions");
    headRow.maxLength = 5;
    const descriptionTh = document.createElement("th");
    descriptionTh.innerHTML = "Description";
    headRow.appendChild(descriptionTh);
    const actionTh = document.createElement("th");
    actionTh.innerHTML = "Actions";
    headRow.appendChild(actionTh);
    validTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      const typeDisplay = transaction.isRecurring
        ? `${transaction.type} 🔄`
        : transaction.type;
      row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${typeDisplay}</td>
           <td>$${transaction.amount.toFixed(2)}</td>
           <td>${transaction.description}</td>
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
  } else if (userWidth >= 1400 && headRow.children.length <= 6) {
    console.log("Rendering large screen transactions");
    headRow.maxLength = 6;
    const descriptionTh = document.createElement("th");
    const categoryTh = document.createElement("th");
    const actionTh = document.createElement("th");
    descriptionTh.innerHTML = "Description";
    categoryTh.innerHTML = "Category";
    headRow.appendChild(descriptionTh);
    headRow.appendChild(categoryTh);
    actionTh.innerHTML = "Actions";
    headRow.appendChild(actionTh);
    validTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      const typeDisplay = transaction.isRecurring
        ? `${transaction.type} 🔄`
        : transaction.type;
      row.innerHTML = `
       <td>${transaction.date}</td>
       <td>${typeDisplay}</td>
       <td>$${transaction.amount.toFixed(2)}</td>
       <td>${transaction.description}</td>
       <td>${transaction.category}</td>
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
}

export function renderTransactions(transactionsToRender = transactions) {
  const transactionsTableBody = document.getElementById(
    "transactionsTableBody",
  );
  if (!transactionsTableBody) {
    console.error("Cannot find transactionsTableBody element");
    return;
  }

  transactionsTableBody.innerHTML = "";

  // Filter out invalid transactions
  const validTransactions = transactionsToRender.filter(
    (transaction) =>
      transaction &&
      transaction.id &&
      transaction.date &&
      transaction.type &&
      transaction.description &&
      transaction.amount !== null &&
      transaction.amount !== undefined &&
      transaction.category,
  );

  validTransactions.forEach((transaction) => {
    const row = document.createElement("tr");
    const typeDisplay = transaction.isRecurring
      ? `${transaction.type} 🔄`
      : transaction.type;

    let descriptionDisplay = transaction.description;
    if (transaction.isRecurring && transaction.nextDue) {
      const today = new Date().toISOString().split("T")[0];
      if (transaction.nextDue > today) {
        descriptionDisplay += ` (Next: ${transaction.nextDue})`;
      }
    }

    row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${typeDisplay}</td>
      <td>${descriptionDisplay}</td>
      <td>$${transaction.amount.toFixed(2)}</td>
      <td>${transaction.category}</td>
      <td>
        <button class="edit-btn" data-id="${transaction.id}">Edit</button>
        <button class="delete-btn" data-id="${transaction.id}">Delete</button>
      </td>
    `;

    // Add event listeners to the buttons
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
      if (data.recurrenceInterval)
        newTransaction.recurrenceInterval = data.recurrenceInterval;
      if (data.lastProcessed) newTransaction.lastProcessed = data.lastProcessed;
      if (data.nextDue) newTransaction.nextDue = data.nextDue;
    }
  }

  transactions.push(newTransaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Refresh the transactions array from localStorage to ensure consistency
  transactions = JSON.parse(localStorage.getItem("transactions")) || [];
}

export function addRecurringTransaction(data, recurrenceInterval) {
  // Create only the original transaction with recurring metadata
  addTransaction({
    ...data,
    isRecurring: true,
    recurrenceInterval: recurrenceInterval,
    lastProcessed: data.date, // Track when we last processed this recurring transaction
    nextDue: setRecurrence(new Date(data.date), recurrenceInterval)
      .toISOString()
      .split("T")[0], // When the next occurrence is due
  });
}

export function deleteTransaction(id) {
  const newTransactions = transactions.filter(
    (transaction) => transaction.id !== id,
  );
  transactions = newTransactions;
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Refresh the transactions array from localStorage to ensure consistency
  transactions = JSON.parse(localStorage.getItem("transactions")) || [];
}

export function updateTransaction(id, data) {
  const transactionIndex = transactions.findIndex((t) => t.id === parseInt(id));
  if (transactionIndex !== -1) {
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      date: data.date,
      type: data.type,
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
      ...(data.recurrenceInterval && {
        recurrenceInterval: data.recurrenceInterval,
      }),
      ...(data.lastProcessed && { lastProcessed: data.lastProcessed }),
      ...(data.nextDue && { nextDue: data.nextDue }),
      ...(data.toTotal !== undefined && { toTotal: data.toTotal }),
      ...(data.investmentDirection && {
        investmentDirection: data.investmentDirection,
      }),
    };
    localStorage.setItem("transactions", JSON.stringify(transactions));

    // Refresh the transactions array from localStorage to ensure consistency
    transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    return true;
  }
  return false;
}

export function editTransaction(id, transactionData) {
  console.log("Edit transaction with ID:", id);
  let matchingTransaction = transactions.find((t) => t.id === id);
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

// Make debug functions available globally for testing
window.debugRecurringTransactions = debugRecurringTransactions;
window.processRecurringTransactionsManually =
  processRecurringTransactionsManually;

export function getTransactionsByDateAsc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
}

export function getTransactionsByDateDesc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
}

export function getTransactionsByAmountAsc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort((a, b) => a.amount - b.amount);
}

export function getTransactionsByAmountDesc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort((a, b) => b.amount - a.amount);
}

export function getTransactionsByTypeAsc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort((a, b) =>
    a.type.localeCompare(b.type, undefined, { sensitivity: "base" }),
  );
}

export function getTransactionsByTypeDesc() {
  const freshTransactions = getAllTransactions();
  return [...freshTransactions].sort((a, b) =>
    b.type.localeCompare(a.type, undefined, { sensitivity: "base" }),
  );
}


export function getSettingsRecurringTransactions() {
  let allTransactions = getAllTransactionsWithRecurring();

  return allTransactions.filter(
    (transaction) => transaction.isRecurring && transaction.recurrenceInterval,
  );
}