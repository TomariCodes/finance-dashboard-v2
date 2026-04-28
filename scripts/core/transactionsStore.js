import { createModal } from "../ui/modal.js";
import { setRecurrence } from "./dates.js";
import { confirmAction } from "../ui/confirm.js";
import { saveDB, loadDB } from "./storage.js";

const fmt = (n) =>
  Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function getAllTransactions() {
  return (loadDB().db.transactions || [])
    .filter((t) => !t.isTemplate)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getRecurringTransactionTemplates() {
  return (loadDB().db.transactions || []).filter((t) => t.isTemplate === true);
}

export function processRecurringTransactions(force = false) {
  const today = new Date().toISOString().split("T")[0];
  const db = loadDB().db;
  let currentTransactions = db.transactions;
  let newTransactionsAdded = false;

  // Get all recurring template transactions (the originals, not instances)
  const recurringTransactions = currentTransactions.filter(
    (t) => t.isRecurring && t.recurrenceInterval && t.isTemplate !== false,
  );

  for (const recurringTransaction of recurringTransactions) {
    if (!recurringTransaction.nextDue || !recurringTransaction.lastProcessed) {
      continue;
    }

    // Check if we already processed this specific recurring transaction today
    if (!force && recurringTransaction.lastRecurringProcessDate === today) {
      continue;
    }

    // Process all due instances for this recurring transaction
    // Change from <= to < to only process transactions whose due date has passed
    let processedToday = false;
    while (recurringTransaction.nextDue < today) {
      // Check if a transaction already exists for this date and recurring transaction
      const existsForDate = currentTransactions.some(
        (t) =>
          t.isRecurring &&
          t.isTemplate === false &&
          t.date === recurringTransaction.nextDue &&
          t.templateId === recurringTransaction.id,
      );

      if (!existsForDate) {
        // Increment occurrence counter
        if (!recurringTransaction.occurrenceCount) {
          recurringTransaction.occurrenceCount = 0;
        }
        recurringTransaction.occurrenceCount++;

        // Create the new recurring transaction instance
        const newTransaction = {
          id: Date.now() + Math.random(),
          type: recurringTransaction.type,
          date: recurringTransaction.nextDue,
          description: recurringTransaction.description,
          amount: recurringTransaction.amount,
          category: recurringTransaction.category,
          isRecurring: true,
          isTemplate: false,
          templateId: recurringTransaction.id,
          occurrenceNumber: recurringTransaction.occurrenceCount,
          ...(recurringTransaction.toTotal !== undefined && {
            toTotal: recurringTransaction.toTotal,
          }),
          ...(recurringTransaction.investmentDirection && {
            investmentDirection: recurringTransaction.investmentDirection,
          }),
        };

        currentTransactions.push(newTransaction);
        newTransactionsAdded = true;
        processedToday = true;

        // Update savings goal currentAmount for "to savings" transactions
        if (
          newTransaction.type === "Savings" &&
          newTransaction.toTotal !== false
        ) {
          const goalsArr = db.goals || [];
          const goalToUpdate = goalsArr.find(
            (g) => g.name === newTransaction.category,
          );
          if (goalToUpdate) {
            goalToUpdate.currentAmount =
              parseFloat(goalToUpdate.currentAmount || 0) +
              parseFloat(newTransaction.amount);

            // Stop processing if the goal is now completed
            if (
              parseFloat(goalToUpdate.currentAmount) >=
              parseFloat(goalToUpdate.targetAmount)
            ) {
              goalToUpdate.currentAmount = parseFloat(
                goalToUpdate.targetAmount,
              );
              // Remove template and any future instances
              currentTransactions = currentTransactions.filter(
                (t) =>
                  t.id !== recurringTransaction.id &&
                  !(
                    t.templateId === recurringTransaction.id &&
                    t.date > recurringTransaction.nextDue
                  ),
              );
              db.transactions = currentTransactions;
              processedToday = true;
              recurringTransaction.lastRecurringProcessDate = today;
              newTransactionsAdded = true;
              break;
            }
          }
        }
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

    // If today is exactly the due date, create the transaction for today
    if (recurringTransaction.nextDue === today) {
      // Check if a transaction already exists for this date and recurring transaction
      const existsForDate = currentTransactions.some(
        (t) =>
          t.isRecurring &&
          t.isTemplate === false &&
          t.date === recurringTransaction.nextDue &&
          t.templateId === recurringTransaction.id,
      );

      if (!existsForDate) {
        // Increment occurrence counter
        if (!recurringTransaction.occurrenceCount) {
          recurringTransaction.occurrenceCount = 0;
        }
        recurringTransaction.occurrenceCount++;

        // Create the new recurring transaction instance
        const newTransaction = {
          id: Date.now() + Math.random(),
          type: recurringTransaction.type,
          date: recurringTransaction.nextDue,
          description: recurringTransaction.description,
          amount: recurringTransaction.amount,
          category: recurringTransaction.category,
          isRecurring: true,
          isTemplate: false,
          templateId: recurringTransaction.id,
          occurrenceNumber: recurringTransaction.occurrenceCount,
          ...(recurringTransaction.toTotal !== undefined && {
            toTotal: recurringTransaction.toTotal,
          }),
          ...(recurringTransaction.investmentDirection && {
            investmentDirection: recurringTransaction.investmentDirection,
          }),
        };

        currentTransactions.push(newTransaction);
        newTransactionsAdded = true;
        processedToday = true;

        // Update savings goal currentAmount for "to savings" transactions
        if (
          newTransaction.type === "Savings" &&
          newTransaction.toTotal !== false
        ) {
          const goalsArr = db.goals || [];
          const goalToUpdate = goalsArr.find(
            (g) => g.name === newTransaction.category,
          );
          if (goalToUpdate) {
            goalToUpdate.currentAmount =
              parseFloat(goalToUpdate.currentAmount || 0) +
              parseFloat(newTransaction.amount);

            // Stop processing if the goal is now completed
            if (
              parseFloat(goalToUpdate.currentAmount) >=
              parseFloat(goalToUpdate.targetAmount)
            ) {
              goalToUpdate.currentAmount = parseFloat(
                goalToUpdate.targetAmount,
              );
              // Remove template and any future instances
              currentTransactions = currentTransactions.filter(
                (t) =>
                  t.id !== recurringTransaction.id &&
                  !(t.templateId === recurringTransaction.id && t.date > today),
              );
              db.transactions = currentTransactions;
              processedToday = true;
              newTransactionsAdded = true;
            }
          }
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

    // Mark this recurring transaction as processed today
    if (processedToday) {
      recurringTransaction.lastRecurringProcessDate = today;
    }
  }

  db.lastRecurringProcessDate = today;
  saveDB();
  return newTransactionsAdded;
}

export function getAllTransactionsWithRecurring() {
  return loadDB().db.transactions || [];
}

processRecurringTransactions();

let transactions = getAllTransactions();

export function handleEditTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (transaction) {
    editTransaction(id, transaction);
  }
}

export async function handleDeleteTransaction(id) {
  if (!(await confirmAction())) return;
  deleteTransaction(id);
  renderResponsiveTransactions();
  if (window.updateCharts) window.updateCharts();
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
    const colSpan = headRow?.children?.length || 3;
    row.innerHTML = `<td colspan="${colSpan}" style="text-align: center; padding: 20px;">No data to display</td>`;
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
       <td>$${fmt(transaction.amount)}</td>
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
      <td>$${fmt(transaction.amount)}</td>
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
           <td>$${fmt(transaction.amount)}</td>
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
       <td>$${fmt(transaction.amount)}</td>
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
  transactions = getAllTransactions();
  return newTransaction;
}

export function addRecurringTransaction(data, recurrenceInterval) {
  const today = new Date().toISOString().split("T")[0];
  const startDate = data.date;

  console.log(`Creating recurring transaction: ${data.description}`);
  console.log(
    `Start date: ${startDate}, Today: ${today}, Recurrence: ${recurrenceInterval}`,
  );

  // Create the template recurring transaction
  const templateTransaction = {
    ...data,
    isRecurring: true,
    isTemplate: true,
    recurrenceInterval: recurrenceInterval,
    lastProcessed: startDate,
    nextDue: startDate,
    occurrenceCount: 0,
    createdDate: today,
  };

  const savedTemplate = addTransaction(templateTransaction);

  // Immediately backfill all instances from start date to today
  backfillRecurringTransaction(
    savedTemplate.id,
    startDate,
    today,
    recurrenceInterval,
  );

  // Refresh the transactions array
  transactions = getAllTransactions();
}

// Helper function to create all recurring instances from start date to end date
function backfillRecurringTransaction(
  templateId,
  startDate,
  endDate,
  recurrenceInterval,
) {
  console.log(
    `Backfilling recurring transaction from ${startDate} to ${endDate}`,
  );

  const db = loadDB().db;
  const allTransactions = db.transactions;
  const template = allTransactions.find((t) => t.id === templateId);

  if (!template) {
    return;
  }

  let currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  let occurrenceCount = 0;

  while (currentDate <= endDateObj) {
    const dateString = currentDate.toISOString().split("T")[0];

    // Check if instance already exists
    const exists = allTransactions.some(
      (t) =>
        t.templateId === templateId &&
        t.date === dateString &&
        t.isTemplate === false,
    );

    if (!exists) {
      occurrenceCount++;

      const instance = {
        id: Date.now() + Math.random(),
        type: template.type,
        date: dateString,
        description: template.description,
        amount: template.amount,
        category: template.category,
        isRecurring: true,
        isTemplate: false,
        templateId: templateId,
        occurrenceNumber: occurrenceCount,
        ...(template.toTotal !== undefined && { toTotal: template.toTotal }),
        ...(template.investmentDirection && {
          investmentDirection: template.investmentDirection,
        }),
      };

      allTransactions.push(instance);
      console.log(
        `Created instance #${occurrenceCount}: ${instance.description} for ${dateString}`,
      );

      // Update savings goal currentAmount for "to savings" transactions
      if (instance.type === "Savings" && instance.toTotal !== false) {
        const goalsArr = db.goals || [];
        const goalToUpdate = goalsArr.find((g) => g.name === instance.category);
        if (goalToUpdate) {
          goalToUpdate.currentAmount =
            parseFloat(goalToUpdate.currentAmount || 0) +
            parseFloat(instance.amount);

          // Stop backfilling if the goal is now completed
          if (
            parseFloat(goalToUpdate.currentAmount) >=
            parseFloat(goalToUpdate.targetAmount)
          ) {
            goalToUpdate.currentAmount = parseFloat(goalToUpdate.targetAmount);
            // Remove the template and any future instances
            db.transactions = db.transactions.filter(
              (t) =>
                t.id !== templateId &&
                !(t.templateId === templateId && t.date > dateString),
            );
            template.occurrenceCount = occurrenceCount;
            template.lastProcessed = dateString;
            template.nextDue = setRecurrence(
              new Date(dateString),
              recurrenceInterval,
            )
              .toISOString()
              .split("T")[0];
            saveDB();
            return;
          }
        }
      }
    }

    // Move to next recurrence
    currentDate = setRecurrence(currentDate, recurrenceInterval);
  }

  // Update the template with the occurrence count and next due date
  template.occurrenceCount = occurrenceCount;
  template.lastProcessed = endDate;
  template.nextDue = setRecurrence(new Date(endDate), recurrenceInterval)
    .toISOString()
    .split("T")[0];

  saveDB();
}

export function deleteTransaction(id) {
  const db = loadDB().db;
  db.transactions = db.transactions.filter((t) => t.id !== id);
  saveDB();
  transactions = getAllTransactions();
}

export function deleteRecurringTemplate(templateId) {
  const today = new Date().toISOString().split("T")[0];
  const db = loadDB().db;
  db.transactions = db.transactions.filter(
    (t) =>
      t.id !== templateId && !(t.templateId === templateId && t.date > today),
  );
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
  // Return only the template transactions for settings display
  return getRecurringTransactionTemplates();
}
