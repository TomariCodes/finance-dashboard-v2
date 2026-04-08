import { loadDB } from "../core/storage.js";
import { createModal } from "modal.js";

const db = loadDB(); // Ensure DB is loaded before rendering settings

const data = db.db || {
  transactions: [],
  goals: [],
  completedGoals: [],
  recurringTransactions: [],
  companies: [],
};
export function createSettingsModal(settingsType) {
  const modal = createModal("appModal", "settingsTitle", "settingsModalBody");

  const settingsList = document.getElementById("settingsList");
}
