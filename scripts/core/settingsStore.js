import { getAllGoals } from "./savingsGoalsStore.js";
import { getAllTransactionsWithRecurring } from "./transactionsStore.js";
import { loadDB, saveDB, resetDB } from "./storage.js";

// Load from localStorage with defaults
function loadRecurringTransactions() {
  return (
    JSON.parse(localStorage.getItem("settingsRecurringTransactions")) || []
  );
}

function loadCompletedGoals() {
  return JSON.parse(localStorage.getItem("settingsCompletedGoals")) || [];
}

export let recurringTransactions = loadRecurringTransactions();
export let completedGoals = loadCompletedGoals();
let goals = getAllGoals();

// Get all recurring transactions from the main transaction store
export function getAllRecurringTransactions() {
  const allTransactions = getAllTransactionsWithRecurring();
  return allTransactions.filter(
    (transaction) => transaction.isRecurring && transaction.recurrenceInterval,
  );
}

export function getAllTransactionCategories() {
  const allTransactions = getAllTransactionsWithRecurring();
  console.log("All transactions for category extraction:", allTransactions);
  const categoriesSet = new Set(allTransactions.map((t) => t.category));
  console.log("Unique categories:", categoriesSet);
  return Array.from(categoriesSet);
}

export function getAllGoalsCategories() {
  const allTransactions = getAllTransactionsWithRecurring();
  console.log("All transactions for category extraction:", allTransactions);
  let savingsTransactions = allTransactions.filter((t) => t.type === "savings");
  const categoriesSet = new Set(savingsTransactions.map((t) => t.category));
  console.log("Unique categories:", categoriesSet);
  return Array.from(categoriesSet);
}

export function getAllInvestmentCategories() {
  const allTransactions = getAllTransactionsWithRecurring();
  console.log("All transactions for category extraction:", allTransactions);
  let investmentTransactions = allTransactions.filter((t) => t.type === "investment");
  const categoriesSet = new Set(investmentTransactions.map((t) => t.category));
  console.log("Unique categories:", categoriesSet);
  return Array.from(categoriesSet);
}

// Get all recurring transactions from settings store
export function getSettingsRecurringTransactions() {
  return [...recurringTransactions];
}

// Get all completed goals
export function getAllCompletedGoals() {
  return [...completedGoals];
}

export function addRecurringTransaction(transaction) {
  recurringTransactions.push(transaction);
  localStorage.setItem(
    "settingsRecurringTransactions",
    JSON.stringify(recurringTransactions),
  );
}

export function completeGoal(goal) {
  completedGoals.push(goal);
  localStorage.setItem(
    "settingsCompletedGoals",
    JSON.stringify(completedGoals),
  );
}

export const renderMessage = (status, message, functionName) => {
  const messageContainer = document.getElementById("settingsMessageContainer");
  const settingsMessage = document.getElementById("settingsMessage");
  const functionIcon = document.getElementById("functionIcon");

  // Set icon based on message type
  if (functionName === "saveDB") {
    functionIcon.textContent = "💾";
  } else if (functionName === "loadDB") {
    functionIcon.textContent = "📂";
  } else if (functionName === "resetDB") {
    functionIcon.textContent = "🗑️";
  }
  settingsMessage.innerHTML = `<span class="boldText">${status === "success" ? "✅ Success" : "❌ Error"}</span> ${message}`;
  messageContainer.style.display = "flex";

  setTimeout(() => {
    messageContainer.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    messageContainer.style.transform = "translateX(1500%)";
  }, 5000);
};
