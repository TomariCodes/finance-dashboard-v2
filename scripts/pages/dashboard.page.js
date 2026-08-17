
import { createChartUI, updateChartUI } from "../ui/chart.ui.js";
import { calculateCashBalance } from "../calculators/cashBalance.js";
import { getTotalByType } from "../calculators/transactions.calc.js";
import { getCompletedGoals, getGoals, getTransactions } from "../core/storage.js";
import { renderDashboardGoals } from "../core/savingsGoalsStore.js";

const fmt = (n) =>
  Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

let transactions = getTransactions();
const chart = document.getElementById("dashboardChart");

const renderDashboardChart = () => {
  const completedGoalNames = new Set(
    (getCompletedGoals() || []).map((g) => g.name),
  );
  const activeTransactions = transactions.filter(
    (transaction) =>
      !(
        transaction.type === "Savings" &&
        completedGoalNames.has(transaction.category)
      ),
  );

  const monthlyTransactions = activeTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const currentDate = new Date();
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  if (monthlyTransactions.length === 0) {
    createChartUI(chart, ["No data"], [1]);
    return;
  }

  const incomeTotal = getTotalByType(activeTransactions, "Income");
  const expenseTotal = getTotalByType(activeTransactions, "Expense");
  const billTotal = getTotalByType(activeTransactions, "Bill");
  const savingsTotal = getTotalByType(activeTransactions, "Savings");

  createChartUI(
    chart,
    ["Income", "Expense", "Bill", "Savings"],
    [incomeTotal, expenseTotal, billTotal, savingsTotal],
  );
};

renderDashboardChart();
renderDashboard();



function renderCashBalance() {
  const cashBalanceElement = document.getElementById("totalAmount");
  if (!cashBalanceElement) {
    return;
  }
  const cashBalance = calculateCashBalance(transactions);
  if (cashBalance < 0) {
    cashBalanceElement.textContent = `-$${fmt(Math.abs(cashBalance))}`;
  } else {
    cashBalanceElement.textContent = `$${fmt(Number(cashBalance))}`;
  }
}

function renderLimitedTables(limit) {
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

  const validTransactions = transactions.filter(
    (transactions) =>
      transactions &&
      transactions.id &&
      transactions.date &&
      transactions.type &&
      transactions.description &&
      transactions.amount !== null &&
      transactions.amount !== undefined &&
      transactions.category,
  );

  const recentTransactions = validTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);

  if (recentTransactions.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" style="text-align: center; padding: 20px;">No data to display</td>`;
    transactionsTableBody.appendChild(row);
    return;
  }

    recentTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      row.innerHTML = `
       <td>${transaction.date}</td>
       <td>${transaction.type}</td>
       <td>$${fmt(transaction.amount)}</td>
       <td class="d-none d-lg-table-cell text-center">${transaction.description}</td>
       <td class="d-none d-lg-table-cell text-center">${transaction.category}</td>
     `;
      transactionsTableBody.appendChild(row);
    });
  
}

function renderDashboard() {
  renderLimitedTables(10); // Show only the 10 most recent transactions
  renderDashboardGoals(3); // Show only the 3 most recent goals
  renderCashBalance();
}
