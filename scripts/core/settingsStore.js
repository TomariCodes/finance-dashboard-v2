
import { loadDB, saveDB, getGoals, getTransactions, getRecurringTransactions } from "./storage.js";
let goals = getGoals();


export function getAllTransactionCategories() {
  const allTransactions = getTransactions();
  console.log("All transactions for category extraction:", allTransactions);
  const categoriesSet = new Set(allTransactions.map((t) => t.category));
  console.log("Unique categories:", categoriesSet);
  return Array.from(categoriesSet);
}

export function getAllGoalsCategories() {
  const goals = getGoals();
  const categoriesSet = new Set(goals.map((g) => g.name));
  console.log("Unique categories:", categoriesSet);
  return Array.from(categoriesSet);
}

export function getAllInvestmentCategories() {
  const allTransactions = getTransactions();
  console.log("All transactions for investment category extraction:", allTransactions);
  console.log("All transactions for category extraction:", allTransactions);
  let investmentTransactions = allTransactions.filter(
    (t) => t.type === "investment",
  );
  const categoriesSet = new Set(investmentTransactions.map((t) => t.category));
  console.log("Unique categories:", categoriesSet);
  return Array.from(categoriesSet);
}

export function getSettingsRecurringTransactions() {
  return loadDB().db.recurringTransactions || [];
}

export function getAllCompletedGoals() {
  return loadDB().db.completedGoals || [];
}

export function addRecurringTransaction(transaction) {
  const db = loadDB().db;
  if (!Array.isArray(db.recurringTransactions)) db.recurringTransactions = [];
  db.recurringTransactions.push(transaction);
  saveDB();
}

export function completeGoal(goal) {
  const db = loadDB().db;
  if (!Array.isArray(db.completedGoals)) db.completedGoals = [];
  db.completedGoals.push(goal);
  saveDB();
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
