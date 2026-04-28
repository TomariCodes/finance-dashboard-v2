import {
  getAllTransactionsWithRecurring,
  deleteRecurringTemplate,
} from "./transactionsStore.js";
import { getTotalByType } from "../calculators/transactions.calc.js";
import { createChartUI } from "../ui/chart.ui.js";
import { saveDB, loadDB } from "./storage.js";
import { confirmAction } from "../ui/confirm.js";

const fmt = (n) =>
  Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

let goals = null;

export function getAllGoals() {
  if (Array.isArray(goals) && goals.length > 0) {
    return goals;
  }

  const database = loadDB();
  const data = database?.db || {};
  const loadedGoals = Array.isArray(data.goals) ? data.goals : [];

  if (!Array.isArray(goals) || (goals.length === 0 && loadedGoals.length > 0)) {
    goals = [...loadedGoals];
  }

  console.log(goals);
  return goals;
}

export function resetAllGoalProgress() {
  const updatedGoals = getAllGoals().map((goal) => ({
    ...goal,
    currentAmount: 0,
    isCompleted: false,
  }));
  const db = loadDB().db;
  db.goals = updatedGoals;
  db.completedGoals = [];
  goals = updatedGoals;
  saveDB();
  goals = null;
}

export function renderSavingsChart() {
  const canvas = document.getElementById("savingsChart");
  // Exclude templates (recurring rules) and savings transactions that belong
  // to completed goals so the chart only reflects active/current money.
  const completedGoalNames = new Set(
    (loadDB().db.completedGoals || []).map((g) => g.name),
  );
  const transactions = getAllTransactionsWithRecurring().filter(
    (t) =>
      t.isTemplate !== true &&
      !(t.type === "Savings" && completedGoalNames.has(t.category)),
  );
  if (transactions.length === 0) {
    console.log("No transactions found - rendering empty chart");
    createChartUI(canvas, ["No data"], [1]);
    return;
  }
  createChartUI(
    canvas,
    ["Income", "Expense", "Bill", "Savings"],
    [
      getTotalByType(transactions, "Income"),
      getTotalByType(transactions, "Expense"),
      getTotalByType(transactions, "Bill"),
      getTotalByType(transactions, "Savings"),
    ],
  );
}

export function renderResponsiveGoalsTable() {
  const userWidth = window.innerWidth;
  let container = document.getElementById("goals-table-body");

  // Check if container exists (might not exist on all pages)
  if (!container) {
    console.log("Goals table container not found - skipping table render");
    return;
  }

  // Clear existing content
  container.innerHTML = "";

  // Clear table headers first to prevent duplicates
  const headRow = document.getElementById("goalsTableHeadRow");
  if (headRow) {
    // Keep only the first header (Goal Name)
    while (headRow.children.length > 1) {
      headRow.removeChild(headRow.lastChild);
    }
  }

  const currentGoals = getAllGoals();

  if (currentGoals.length === 0) {
    let row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" style="text-align: center; padding: 20px;">No data to display</td>`;
    container.appendChild(row);
    return;
  }

  if (userWidth >= 320 && userWidth < 768) {
    const headRow = document.getElementById("goalsTableHeadRow");
    const totalTh = document.createElement("th");
    totalTh.innerHTML = "Target/Current";
    headRow.appendChild(totalTh);
    const actionTh = document.createElement("th");
    actionTh.innerHTML = "Actions";
    headRow.appendChild(actionTh);
    currentGoals.forEach((goal) => {
      let row = document.createElement("tr");
      row.innerHTML = `
      <td>${goal.name}</td>
      <td>$${fmt(goal.currentAmount)}/$${fmt(goal.targetAmount)}</td>
      <td>
      <button class="action-btn changeFunds" data-name="${goal.name}">Add/Move Money</button>
      <div>
      <button class="action-btn edit" data-name="${goal.name}">Edit</button>
      <button class="action-btn delete" data-name="${goal.name}">Delete</button>
      </div>
      </td>
      `;

      const changeFundsBtn = row.querySelector(".changeFunds");
      const editBtn = row.querySelector(".edit");
      const deleteBtn = row.querySelector(".delete");
      changeFundsBtn.addEventListener("click", () =>
        handleChangeFunds(goal.name),
      );

      editBtn.addEventListener("click", () => handleEditTransaction(goal.name));
      deleteBtn.addEventListener("click", () =>
        handleDeleteTransaction(goal.name),
      );
      container.appendChild(row);
    });
  } else if (userWidth >= 768 && userWidth < 1400) {
    const headRow = document.getElementById("goalsTableHeadRow");
    const targetTh = document.createElement("th");
    targetTh.innerHTML = "Target Amount";
    headRow.appendChild(targetTh);
    const currentTh = document.createElement("th");
    currentTh.innerHTML = "Current Amount";
    headRow.appendChild(currentTh);
    const actionTh = document.createElement("th");
    actionTh.innerHTML = "Actions";
    headRow.appendChild(actionTh);
    currentGoals.forEach((goal) => {
      let row = document.createElement("tr");
      row.innerHTML = `
      <td>${goal.name}</td>
      <td>$${fmt(goal.targetAmount)}</td>
      <td>$${fmt(goal.currentAmount)}</td>
      <td>
      <button class="action-btn changeFunds" data-name="${goal.name}">Add/Move Money</button>
      <div>
        <button class="action-btn edit" data-name="${goal.name}">Edit</button>
        <button class="action-btn delete" data-name="${goal.name}">Delete</button>
        </div>
      </td>
      `;

      const changeFundsBtn = row.querySelector(".changeFunds");
      const editBtn = row.querySelector(".edit");
      const deleteBtn = row.querySelector(".delete");
      changeFundsBtn.addEventListener("click", () =>
        handleChangeFunds(goal.name),
      );

      editBtn.addEventListener("click", () => handleEditTransaction(goal.name));
      deleteBtn.addEventListener("click", () =>
        handleDeleteTransaction(goal.name),
      );
      container.appendChild(row);
    });
  } else if (userWidth >= 1400) {
    const headRow = document.getElementById("goalsTableHeadRow");
    const targetTh = document.createElement("th");
    targetTh.innerHTML = "Target Amount";
    headRow.appendChild(targetTh);
    const currentTh = document.createElement("th");
    currentTh.innerHTML = "Current Amount";
    headRow.appendChild(currentTh);
    const progressTh = document.createElement("th");
    progressTh.innerHTML = "Progress";
    headRow.appendChild(progressTh);
    const actionTh = document.createElement("th");
    actionTh.innerHTML = "Actions";
    headRow.appendChild(actionTh);
    currentGoals.forEach((goal) => {
      let row = document.createElement("tr");
      row.innerHTML = `
    <td>${goal.name}</td>
    <td>$${fmt(goal.targetAmount)}</td>
    <td>$${fmt(goal.currentAmount)}</td>
    <td>
        <progress class="progress-bar" value="${goal.currentAmount}" max="${goal.targetAmount}"></progress>
      </td>
    <td>
    <button class="action-btn changeFunds" data-name="${goal.name}">Add/Move Money</button>
    <div>
      <button class="action-btn edit" data-name="${goal.name}">Edit</button>
      <button class="action-btn delete" data-name="${goal.name}">Delete</button>
      </div>
    </td>
    `;

      const changeFundsBtn = row.querySelector(".changeFunds");
      const editBtn = row.querySelector(".edit");
      const deleteBtn = row.querySelector(".delete");
      changeFundsBtn.addEventListener("click", () =>
        handleChangeFunds(goal.name),
      );

      editBtn.addEventListener("click", () => handleEditTransaction(goal.name));
      deleteBtn.addEventListener("click", () =>
        handleDeleteTransaction(goal.name),
      );
      container.appendChild(row);
    });
  }
}
export function renderSavingsCategories(select, goalsList) {
  if (!select) {
    console.error("Savings category select element not found");
  }
  const currentGoals = goalsList || getAllGoals();
  select.innerHTML = "<option value=''>Select Goal</option>";
  currentGoals.forEach((goal) => {
    let option = document.createElement("option");
    option.value = goal.name;
    option.textContent = goal.name;
    select.appendChild(option);
  });
}

export function addGoal(goalData) {
  const currentGoals = getAllGoals();
  const newGoal = {
    id:
      currentGoals.length > 0
        ? Math.max(...currentGoals.map((g) => g.id)) + 1
        : 1,
    name: goalData.name,
    targetAmount: parseFloat(goalData.desiredAmount) || 0,
    currentAmount: parseFloat(goalData.startingAmount) || 0,
  };
  currentGoals.push(newGoal);
  goals = currentGoals;
  loadDB().db.goals = goals;
  saveDB();
  goals = null;

  // Re-render immediately
  renderGoalsTable();

  // Update savings summary
  if (window.renderSavingsSummary) {
    window.renderSavingsSummary();
  }

  // Update savings chart
  if (window.renderSavingsChart) {
    window.renderSavingsChart();
  }

  return newGoal;
}

export function updateGoal(idOrName, updatedData) {
  console.log(
    "updateGoal called with idOrName:",
    idOrName,
    "data:",
    updatedData,
  );

  const currentGoals = getAllGoals();
  console.log("Current goals before update:", currentGoals);

  // Try to find by ID first (if idOrName is a number), then by name
  let goalIndex = -1;
  if (typeof idOrName === "number" || !isNaN(idOrName)) {
    goalIndex = currentGoals.findIndex((g) => g.id == idOrName);
    console.log("Searching by ID, found goal at index:", goalIndex);
  }

  if (goalIndex === -1) {
    goalIndex = currentGoals.findIndex((g) => g.name === idOrName);
    console.log("Searching by name, found goal at index:", goalIndex);
  }

  if (goalIndex === -1) {
    console.error("Goal not found with idOrName:", idOrName);
    throw new Error("Goal not found");
  } else {
    console.log(
      "Updating goal from:",
      currentGoals[goalIndex],
      "to:",
      updatedData,
    );

    currentGoals[goalIndex] = { ...currentGoals[goalIndex], ...updatedData };
    console.log("Goal after update:", currentGoals[goalIndex]);
    console.log("All goals after update:", currentGoals);

    goals = currentGoals;
    loadDB().db.goals = goals;
    saveDB();
    goals = null;

    // Re-render immediately
    renderGoalsTable();

    // Update savings summary
    if (window.renderSavingsSummary) {
      window.renderSavingsSummary();
    }

    // Update savings chart
    if (window.renderSavingsChart) {
      window.renderSavingsChart();
    }

    console.log("updateGoal completed successfully");
  }
}

export function renderGoalsTable() {
  const container = document.getElementById("goals-table-body");
  if (!container) return;

  container.innerHTML = "";
  const headRow = document.getElementById("goalsTableHeadRow");
  if (headRow) {
    headRow.innerHTML =
      "<th>Goal Name</th><th>Target Amount</th><th>Current Amount</th><th>Progress</th><th>Actions</th>";
  }

  const currentGoals = getAllGoals();
  if (currentGoals.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" style="text-align: center; padding: 20px;">No data to display</td>`;
    container.appendChild(row);
    return;
  }

  currentGoals.forEach((goal) => {
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${goal.name}</td>
      <td>$${fmt(goal.targetAmount)}</td>
      <td>$${fmt(goal.currentAmount)}</td>
      <td>
        <progress class="progress-bar" value="${goal.currentAmount}" max="${goal.targetAmount}"></progress>
      </td>
      <td>
      <button class="action-btn changeFunds" data-name="${goal.name}">Add/Move Money</button>
      <div>
        <button class="action-btn edit" data-name="${goal.name}">Edit</button>
        <button class="action-btn delete" data-name="${goal.name}">Delete</button>
        </div>
      </td>
    `;

    const changeFundsBtn = row.querySelector(".changeFunds");
    const editBtn = row.querySelector(".edit");
    const deleteBtn = row.querySelector(".delete");
    changeFundsBtn.addEventListener("click", () =>
      handleChangeFunds(goal.name),
    );

    editBtn.addEventListener("click", () => handleEditTransaction(goal.name));
    deleteBtn.addEventListener("click", () =>
      handleDeleteTransaction(goal.name),
    );

    container.appendChild(row);
  });
}

export function handleChangeFunds(goalName) {
  console.log(`Change funds for goal: ${goalName}`);

  // Find the goal to get its ID
  const goal = getAllGoals().find((g) => g.name === goalName);
  if (!goal) {
    console.error("Goal not found:", goalName);
    return;
  }

  // Load the transaction form and open modal
  if (window.openModal && window.initializeTransactionForm) {
    // Load the transaction form
    fetch("components/addTransactionForm.html")
      .then((response) => response.text())
      .then((html) => {
        // Open modal with the transaction form content
        window.openModal(`Add/Move Money - ${goalName}`, html);

        // Initialize form with pre-filled savings data after modal is open
        setTimeout(() => {
          window.initializeTransactionForm({
            type: "Savings",
            savingsGoalName: goal.name,
            disableTypeChange: true,
            disableSavingsGoal: true,
          });
        }, 100);
      })
      .catch((error) => {
        console.error("Error loading transaction form:", error);
      });
  }
}

export function deleteGoal(idOrName) {
  const currentGoals = getAllGoals();
  let goalIndex = -1;
  if (typeof idOrName === "number" || !isNaN(idOrName)) {
    goalIndex = currentGoals.findIndex((g) => g.id == idOrName);
  }
  if (goalIndex === -1) {
    goalIndex = currentGoals.findIndex((g) => g.name === idOrName);
  }
  if (goalIndex === -1) throw new Error("Goal not found");

  currentGoals.splice(goalIndex, 1);
  goals = currentGoals;
  loadDB().db.goals = goals;
  saveDB();
  goals = null;

  // Re-render immediately
  renderGoalsTable();

  // Update savings summary
  if (window.renderSavingsSummary) {
    window.renderSavingsSummary();
  }

  // Update savings chart
  if (window.renderSavingsChart) {
    window.renderSavingsChart();
  }
}

export function editGoal(goalName) {
  console.log("Edit goal with name:", goalName);

  // Force fresh load from localStorage to avoid cache issues
  goals = null;
  const allGoals = getAllGoals();
  console.log("All goals after fresh load:", allGoals);
  console.log("Looking for goal with name:", goalName);

  // Try both exact match and trimmed match
  let goal = allGoals.find((g) => g.name === goalName);
  if (!goal) {
    console.log("Exact match failed, trying trimmed match");
    goal = allGoals.find((g) => g.name.trim() === goalName.trim());
  }

  console.log("Found goal:", goal);

  if (goal) {
    fetch("components/addGoalForm.html")
      .then((response) => response.text())
      .then((html) => {
        // Open modal with the goal form content
        window.openModal(`Edit Goal - ${goalName}`, html);

        // Initialize form with existing goal data
        setTimeout(() => {
          if (window.initializeAddGoalForm) {
            window.initializeAddGoalForm({
              name: goal.name,
              targetAmount: goal.targetAmount,
              currentAmount: goal.currentAmount,
              isEdit: true,
            });
          }
        }, 100);
      })
      .catch((error) => {
        console.error("Error loading goal form:", error);
      });
  } else {
    console.error("Goal not found with name:", goalName);
  }
}

export function handleEditTransaction(goalName) {
  console.log(`Edit goal: ${goalName}`);
  editGoal(goalName);
}

async function handleDeleteTransaction(goalName) {
  const goal = getAllGoals().find((g) => g.name === goalName);
  if (!goal) return;
  if (await confirmAction()) {
    deleteGoal(goal.id);
  }
}

function renderCompletedGoalMessage(goal) {
  if (goal.isCompleted) {
    const messageContainer = document.getElementById("completedGoalMessage");
    const messageText = document.getElementById("completedGoalText");

    if (messageContainer && messageText) {
      messageText.innerHTML = `<span class="boldText">Congratulations!</span> You have completed the goal "${goal.name}"!`;
      messageContainer.style.transform = "translateX(1500%)";
      messageContainer.style.display = "flex";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          messageContainer.style.transform = "translateX(0)";
          setTimeout(() => {
            messageContainer.style.transform = "translateX(1500%)";
            setTimeout(() => {
              messageContainer.style.display = "none";
            }, 500);
          }, 4000);
        }),
      );
    }
  }
}

// Local function to save completed goals
function saveCompletedGoal(goal) {
  const db = loadDB().db;
  if (!Array.isArray(db.completedGoals)) db.completedGoals = [];
  db.completedGoals.push({
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    completedDate: new Date().toISOString(),
  });
  saveDB();
}

export function changeGoalStatus(goal) {
  if (parseFloat(goal.currentAmount) >= parseFloat(goal.targetAmount)) {
    goal.isCompleted = true;

    // Add to completed goals locally
    saveCompletedGoal(goal);

    // Show congratulations message
    renderCompletedGoalMessage(goal);

    // Remove from active goals after a brief delay
    setTimeout(() => {
      // Stop any recurring savings transactions targeting this goal
      const templatesToDelete = (loadDB().db.transactions || [])
        .filter(
          (t) =>
            t.isTemplate && t.type === "Savings" && t.category === goal.name,
        )
        .map((t) => t.id);
      templatesToDelete.forEach((id) => deleteRecurringTemplate(id));

      deleteGoal(goal.id);
    }, 500);
  }
}

/**
 * Reconciles each goal's currentAmount against the actual savings transactions.
 * If the net of all "to savings" minus "from savings" transactions exceeds the
 * stored currentAmount (indicating the backfill never updated it), the stored
 * value is corrected upward. It never decreases a stored amount so manually
 * set starting balances are not overwritten.
 */
export function reconcileGoalAmountsFromTransactions() {
  const db = loadDB().db;
  const allTx = (db.transactions || []).filter(
    (t) => t.isTemplate !== true && t.type === "Savings",
  );
  const currentGoals = db.goals || [];
  let changed = false;

  currentGoals.forEach((goal) => {
    const toSum = allTx
      .filter((t) => t.category === goal.name && t.toTotal !== false)
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const fromSum = allTx
      .filter((t) => t.category === goal.name && t.toTotal === false)
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const netFromTx = toSum - fromSum;

    if (netFromTx > parseFloat(goal.currentAmount || 0) + 0.001) {
      // Cap at target so we don't overshoot
      goal.currentAmount = Math.min(netFromTx, parseFloat(goal.targetAmount));
      changed = true;
    }
  });

  if (changed) {
    saveDB();
    goals = null; // force cache reload
  }
}

export function checkAndCompleteGoals() {
  const currentGoals = [...getAllGoals()];
  currentGoals.forEach((goal) => {
    if (
      parseFloat(goal.targetAmount) > 0 &&
      parseFloat(goal.currentAmount) >= parseFloat(goal.targetAmount)
    ) {
      changeGoalStatus(goal);
    }
  });
}

export function getAllCompletedGoals() {
  return loadDB().db.completedGoals || [];
}

export function deleteCompletedGoal(goalId) {
  const db = loadDB().db;
  db.completedGoals = (db.completedGoals || []).filter((g) => g.id !== goalId);
  saveDB();
}
