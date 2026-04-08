import { getAllGoals, getAllCompletedGoals } from "./savingsGoalsStore.js";
import { getAllTransactionsWithRecurring, getSettingsRecurringTransactions } from "./transactionsStore.js";
import { getAllCompanies } from "./investmentsStore.js";

export function loadDB() {
    const dbString = localStorage.getItem("prosperonDB");
    if (dbString) {
        try {
            const db = JSON.parse(dbString);
            return db, {"message": "Database loaded successfully.", "status": "success", "function": "loadDB"};
        } catch (error) {
            console.error("Error parsing DB from localStorage:", error);
            return null;
        }
    } else {
        console.warn("No DB found in localStorage, returning null.");
        return null;
    }
}

export function saveDB() {
    const transactions = getAllTransactionsWithRecurring();
    const goals = getAllGoals();
    const completedGoals = getAllCompletedGoals();
    const recurringTransactions = getSettingsRecurringTransactions();
    const companies = getAllCompanies();
    console.log("Saving DB with the following data:", {
        transactions,
        goals,
        completedGoals,
        recurringTransactions,
        companies,
    });
    const db = {
        transactions,
        goals,
        completedGoals,
        recurringTransactions,
        companies,
    };
    localStorage.setItem("prosperonDB", JSON.stringify(db));

    return {"message": "Database saved successfully.", "status": "success", "function": "saveDB"};
}

export function resetDB() {
    localStorage.removeItem("prosperonDB");
    return {"message": "Database reset successfully.", "status": "success", "function": "resetDB"};
}