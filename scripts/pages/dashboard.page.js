import { getAllTransactions } from "../core/transactionsStore.js";
import { getAllGoals } from "../core/savingsGoalsStore.js";
import { createChartUI, updateChartUI } from "../ui/chart.ui.js";
import { calculateCashBalance } from "../calculators/cashBalance.js";
import { getTotalByType } from "../calculators/transactions.calc.js";

let transactions = getAllTransactions();
const chart = document.getElementById("dashboardChart");

const renderDashboardChart = () => {
  const monthlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const currentDate = new Date();
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  if (monthlyTransactions.length === 0) {
    console.log(
      "No transactions found for the current month - rendering empty chart",
    );
    createChartUI(chart, ["No Data"], [1]);
    return;
  }

  const incomeTotal = getTotalByType(transactions, "Income");
  const expenseTotal = getTotalByType(transactions, "Expense");
  const billTotal = getTotalByType(transactions, "Bill");
  const savingsTotal = getTotalByType(transactions, "Savings");

  createChartUI(
    chart,
    ["Income", "Expense", "Bill", "Savings"],
    [incomeTotal, expenseTotal, billTotal, savingsTotal],
  );
};

renderDashboardChart();

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
});

function renderDashboardGoals(limit) {
  const goalsTableBody = document.getElementById("goalsTableBody");

  if (!goalsTableBody) {
    console.error("Cannot find goalsTableBody element");
    return;
  }

  goalsTableBody.innerHTML = "";

  const goals = getAllGoals();
  const recentGoals = goals
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
    .slice(0, limit);

  if (recentGoals.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3" style="text-align: center; padding: 20px;">No goals found.</td>`;
    goalsTableBody.appendChild(row);
    return;
  }
  recentGoals.forEach((goal) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${goal.name}</td>
            <td>$${goal.targetAmount.toFixed(2)}</td>
            <td>$${goal.currentAmount.toFixed(2)}</td>
        `;
    goalsTableBody.appendChild(row);
  });
}

function renderCashBalance() {
  const cashBalanceElement = document.getElementById("totalAmount");
  if (!cashBalanceElement) {
    console.error("Cannot find totalAmount element");
    return;
  }
  const cashBalance = calculateCashBalance(transactions);
  if (cashBalance < 0) {
    cashBalanceElement.textContent = `-$${Math.abs(cashBalance).toFixed(2)}`;
  } else {
    cashBalanceElement.textContent = `$${Number(cashBalance).toFixed(2)}`;
  }
}

function renderMediaTables(limit) {
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
    row.innerHTML = `<td colspan="6" style="text-align: center; padding: 20px;">No transactions found.</td>`;
    transactionsTableBody.appendChild(row);
    return;
  }

  if (userWidth <= 400) {
    recentTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      row.innerHTML = `
             <td>${transaction.date}</td>
             <td>${transaction.type}</td>
             <td>$${transaction.amount.toFixed(2)}</td>
           `;
      transactionsTableBody.appendChild(row);
    });
  } else if (userWidth >= 700 && userWidth < 1400) {
    console.log("Rendering medium screen transactions");
    const headRow = document.getElementById("transactionsTableHeadRow");
    const th = document.createElement("th");
    th.innerHTML = "Description";
    headRow.appendChild(th);
    recentTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      row.innerHTML = `
           <td>${transaction.date}</td>
           <td>${transaction.type}</td>
           <td>$${transaction.amount.toFixed(2)}</td>
           <td>${transaction.description}</td>
         `;
      transactionsTableBody.appendChild(row);
    });
  } else if (userWidth >= 1400) {
    console.log("Rendering large screen transactions");
    const headRow = document.getElementById("transactionsTableHeadRow");
    const thOne = document.createElement("th");
    const thTwo = document.createElement("th");
    thOne.innerHTML = "Description";
    thTwo.innerHTML = "Category";
    headRow.appendChild(thOne);
    headRow.appendChild(thTwo);
    recentTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      row.innerHTML = `
       <td>${transaction.date}</td>
       <td>${transaction.type}</td>
       <td>$${transaction.amount.toFixed(2)}</td>
       <td>${transaction.description}</td>
       <td>${transaction.category}</td>
     `;
      transactionsTableBody.appendChild(row);
    });
  }
}

function renderDashboard() {
  renderMediaTables(10); // Show only the 10 most recent transactions
  renderDashboardGoals(3); // Show only the 3 most recent goals
  renderCashBalance();
}
