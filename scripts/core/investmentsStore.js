import { getAllTransactionsWithRecurring } from "./transactionsStore.js";
import { createChartUI, updateChartUI } from "../ui/chart.ui.js";
import { getTotalByType } from "../calculators/transactions.calc.js";
import { saveDB, loadDB } from "./storage.js";
const database = loadDB();
const data = database.db;
let transactions = getAllTransactionsWithRecurring();
console.log(database);
console.log(data);

export function getAllCompanies() {
  const companies = data.companies || [];
  console.log("Loaded companies: ", companies);
  return companies;
}

const companies = getAllCompanies();
console.log("Companies after initialization: ", companies);
export function getCompanyByName(name) {
  return companies.find((c) => c.name === name);
}

export function updateCompany(originalName, updatedData) {
  const companyIndex = companies.findIndex((c) => c.name === originalName);
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  companies[companyIndex] = { ...companies[companyIndex], ...updatedData };

  // Re-render the companies table
  const companiesTable = document.querySelector(".investment-companies-table");
  if (companiesTable) {
    renderCompaniesList(
      companiesTable,
      companies,
      getAllTransactionsWithRecurring(),
    );
  }

  return companies[companyIndex];
}

export function addCompany(companyData) {
  const newCompany = {
    id: companies.length > 0 ? Math.max(...companies.map((c) => c.id)) + 1 : 1,
    name: companyData.name,
    ticker: companyData.ticker || companyData.name.toUpperCase(),
  };

  companies.push(newCompany);
  saveDB();

  // Re-render the companies table
  const companiesTable = document.querySelector(".investment-companies-table");
  if (companiesTable) {
    renderCompaniesList(
      companiesTable,
      companies,
      getAllTransactionsWithRecurring(),
    );
  }

  return newCompany;
}

export function renderInvestmentCategories(select, companies) {
  if (!select) {
    console.error("Investment category select element not found");
  }
  select.innerHTML = "<option value=''>Select Company</option>";
  companies.forEach((company) => {
    let option = document.createElement("option");
    option.value = company.id;
    option.textContent = company.name;
    select.appendChild(option);
  });
}

export function renderInvestmentTransactionsTable(
  table,
  transactions,
  limit = 7,
) {
  if (!table) {
    console.error("Investment transactions table element not found");
  }
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  const investmentTransactions = transactions
    .filter((tx) => tx.type === "Investment")
    .slice(0, limit);
  investmentTransactions.forEach((tx) => {
    if (tx.type !== "Investment") return; // Only render investment transactions
  });

  console.log("Rendering investment transactions: ", investmentTransactions);
  if (investmentTransactions.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="4" style="text-align: center; color: #888;">No data to display</td>
    `;
    tbody.appendChild(emptyRow);
    return;
  }

  investmentTransactions.slice(0, limit).forEach((tx) => {
    console.log("Rendering transaction: ", tx);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.type}</td>
      <td>$${tx.amount}</td>
      <td>N/A</td>
    `;
    tbody.appendChild(row);

    if (investmentTransactions.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="4" style="text-align: center; color: #888;">No data to display</td>
      `;
      tbody.appendChild(emptyRow);
    }
  });
}

function renderCompanyAmount(companyName, transactions) {
  const companyTransactions = transactions.filter(
    (tx) => tx.type === "Investment" && tx.category === companyName,
  );
  const totalAmount = companyTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0,
  );
  return totalAmount;
}

export function addInvestmentTransaction(transaction) {
  transactions.push(transaction);
}

export function renderResponsiveCompaniesList(table, companies, transactions) {
  const userWidth = window.innerWidth;
  if (!table) {
    console.error("Investment companies table element not found");
    return;
  }
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = ""; // Clear existing content

  // Clear existing headers to avoid duplication
  const headRow = document.getElementById("investmentsTableHeadRow");
  if (headRow) {
    headRow.innerHTML = "<th>Company</th>"; // Reset to base header
  }

  if (userWidth <= 320) {
    // Mobile view - minimal columns
    if (headRow) {
      const tickerTh = document.createElement("th");
      tickerTh.innerHTML = "Ticker";
      headRow.appendChild(tickerTh);
      const actionTh = document.createElement("th");
      actionTh.innerHTML = "Actions";
      headRow.appendChild(actionTh);
    }

    companies.forEach((company) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${company.name}</td>
        <td>${company.ticker}</td>
        <td>
          <button class="editMoney-btn" data-edit-name="${company.name}">Add/Move Money</button>
          <button class="delete-btn" data-delete-name="${company.name}">Delete</button>
        </td>
      `;

      const changeFundsBtn = row.querySelector(".editMoney-btn");
      const deleteBtn = row.querySelector(".delete-btn");

      changeFundsBtn.addEventListener("click", () =>
        handleChangeInvestmentFunds(company.name),
      );

      deleteBtn.addEventListener("click", () =>
        handleDeleteCompany(company.name),
      );

      tbody.appendChild(row);
    });
  } else if (userWidth <= 768) {
    // Tablet view - medium columns
    if (headRow) {
      const targetTh = document.createElement("th");
      targetTh.innerHTML = "Total Invested";
      headRow.appendChild(targetTh);
      const tickerTh = document.createElement("th");
      tickerTh.innerHTML = "Ticker";
      headRow.appendChild(tickerTh);
      const actionTh = document.createElement("th");
      actionTh.innerHTML = "Actions";
      headRow.appendChild(actionTh);
    }

    companies.forEach((company) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${company.name}</td>
        <td>$${renderCompanyAmount(company.name, transactions)}</td>
        <td>${company.ticker}</td>
        <td>
          <button class="editMoney-btn" data-edit-name="${company.name}">Add/Move Money</button>
          <button class="delete-btn" data-delete-name="${company.name}">Delete</button>
        </td>
      `;

      const changeFundsBtn = row.querySelector(".editMoney-btn");
      const deleteBtn = row.querySelector(".delete-btn");

      changeFundsBtn.addEventListener("click", () =>
        handleChangeInvestmentFunds(company.name),
      );

      deleteBtn.addEventListener("click", () =>
        handleDeleteCompany(company.name),
      );

      tbody.appendChild(row);
    });
  } else {
    // Desktop view - all columns
    if (headRow) {
      const targetTh = document.createElement("th");
      targetTh.innerHTML = "Total Invested";
      headRow.appendChild(targetTh);
      const tickerTh = document.createElement("th");
      tickerTh.innerHTML = "Ticker";
      headRow.appendChild(tickerTh);
      const dividendTh = document.createElement("th");
      dividendTh.innerHTML = "Dividends";
      headRow.appendChild(dividendTh);
      const actionTh = document.createElement("th");
      actionTh.innerHTML = "Actions";
      headRow.appendChild(actionTh);
    }

    companies.forEach(async (company) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${company.name}</td>
      <td>$${renderCompanyAmount(company.name, transactions)}</td>
      <td>${company.ticker}</td>
        <td>${(await returnDividend(company.ticker)) === null ? "0.00 USD" : await returnDividend(company.ticker)}</td>
        <td>
          <button class="editMoney-btn" data-edit-name="${company.name}">Add/Move Money</button>
          <button class="delete-btn" data-delete-name="${company.name}">Delete</button>
        </td>
      `;

      const changeFundsBtn = row.querySelector(".editMoney-btn");
      const deleteBtn = row.querySelector(".delete-btn");

      changeFundsBtn.addEventListener("click", () =>
        handleChangeInvestmentFunds(company.name),
      );

      if (companies.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
        <td colspan="4" style="text-align: center; color: #888;">No data to display</td>
      `;
        tbody.appendChild(emptyRow);
        return;
      }
      deleteBtn.addEventListener("click", () =>
        handleDeleteCompany(company.name),
      );

      tbody.appendChild(row);
    });
  }
}

export function renderCompaniesList(table, companies, transactions) {
  if (!table) {
    console.error("Investment companies table element not found");
  }
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  companies.forEach(async (company) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${company.name}</td>
      <td>$${renderCompanyAmount(company.name, transactions)}</td>
      <td>${company.ticker}</td>
      <td>${await returnDividend(company.ticker)}</td>
      <td>

      <button class="editMoney-btn" data-edit-name="${company.name}">Add/Move Money</button>
      <button class="delete-btn" data-delete-name="${company.name}">Delete</button>
      </td>
    `;

    const changeFundsBtn = row.querySelector(".editMoney-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    changeFundsBtn.addEventListener("click", () =>
      handleChangeInvestmentFunds(company.name),
    );

    deleteBtn.addEventListener("click", () =>
      handleDeleteCompany(company.name),
    );

    tbody.appendChild(row);
  });
}

export function renderInvestmentsChart() {
  const canvas = document.getElementById("investmentsChart");

  if (transactions.length === 0) {
    console.log("No transactions found - rendering empty chart");
    createChartUI(canvas, ["No Data"], [1], "left");
    return;
  }

  createChartUI(
    canvas,
    ["Income", "Expense", "Bill", "Savings", "Investment"],
    [
      getTotalByType(transactions, "Income"),
      getTotalByType(transactions, "Expense"),
      getTotalByType(transactions, "Bill"),
      getTotalByType(transactions, "Savings"),
      getTotalByType(transactions, "Investment"),
    ],
    "left",
  );
}

const backendBASEURL = "https://prosperon-proxy.tomari7878.workers.dev/";

export async function returnTicker(companyName) {
  const lowerCompanyName = companyName.toLowerCase();

  // Handle hardcoded cases first
  if (lowerCompanyName === "blackrock") {
    return "BLK";
  } else if (lowerCompanyName === "apple") {
    return "AAPL";
  }

  try {
    const res = await fetch(
      `${backendBASEURL}utilities/search?query=${encodeURIComponent(companyName)}`,
    );

    if (!res.ok) {
      console.error(`API request failed with status: ${res.status}`);
      return null;
    }

    const results = await res.json();
    console.log(`API response for "${companyName}":`, results);

    if (!Array.isArray(results) || results.length === 0) {
      console.warn(`No results found for company: ${companyName}`);
      return null;
    }

    const first = results[0];
    console.log(`First result for "${companyName}":`, first);

    // Verify the structure and extract ticker
    if (first && first.ticker) {
      console.log(`Ticker found for "${companyName}": ${first.ticker}`);
      return first.ticker;
    } else {
      console.error(
        `No ticker property found in result for "${companyName}". Available properties:`,
        Object.keys(first || {}),
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching ticker:", error);
    return null;
  }
}

export async function returnDividend(ticker) {
  try {
    const res = await fetch(
      `${backendBASEURL}corporate-actions/distributions?ticker=${encodeURIComponent(ticker)}`,
    );
    if (!res.ok) throw new Error(`Dividend lookup failed: ${res.status}`);

    const { latest } = await res.json();
    console.log(latest);

    let dividend = `$${(latest.trailingDivY * 100).toFixed(2)} USD`;
    console.log(dividend);
    if (dividend === null || dividend === "NaN USD") {
      dividend = `$0.00 USD`;
    }
    return dividend; // Return the latest dividend or null if not available
  } catch (error) {
    console.error("Error fetching dividend:", error);
    return null;
  }
}

export function handleChangeInvestmentFunds(companyName) {
  console.log(`Change investment funds for company: ${companyName}`);

  // Find the company to get its details
  const company = companies.find((c) => c.name === companyName);
  if (!company) {
    console.error("Company not found:", companyName);
    return;
  }

  // Load the transaction form and open modal
  if (window.openModal && window.initializeTransactionForm) {
    // Load the transaction form
    fetch("components/addTransactionForm.html")
      .then((response) => response.text())
      .then((html) => {
        // Open modal with the transaction form content
        window.openModal(`Add/Move Money - ${companyName}`, html);

        // Initialize form with pre-filled investment data after modal is open
        setTimeout(() => {
          window.initializeTransactionForm({
            type: "Investment",
            investmentCompanyName: company.name,
            disableTypeChange: true,
            disableInvestmentCompany: true,
          });
        }, 100);
      })
      .catch((error) => {
        console.error("Error loading transaction form:", error);
      });
  } else {
    console.error("Modal functions not available");
  }
}

export function handleDeleteCompany(companyName) {
  console.log(`Delete company: ${companyName}`);

  const company = companies.find((c) => c.name === companyName);
  if (!company) {
    console.error("Company not found:", companyName);
    return;
  }

  if (
    confirm(
      `Are you sure you want to delete the company "${companyName}"? This cannot be undone.`,
    )
  ) {
    const index = companies.findIndex((c) => c.name === companyName);
    if (index !== -1) {
      companies.splice(index, 1);
      // Re-render the companies list after deletion
      const companiesTable = document.querySelector(
        ".investment-companies-table",
      );
      renderCompaniesList(
        companiesTable,
        companies,
        getAllTransactionsWithRecurring(),
      );
    }
    saveDB();
  }
}
