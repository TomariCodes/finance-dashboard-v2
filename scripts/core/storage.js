function createDefaultDb() {
  return {
    transactions: [],
    goals: [],
    completedGoals: [],
    recurringTransactions: [],
    companies: [],
    lastRecurringProcessDate: null,
  };
}

let _db = null;

function initDb() {
  const stored = localStorage.getItem("prosperonDB");
  if (stored) {
    try {
      _db = { ...createDefaultDb(), ...JSON.parse(stored) };
      return;
    } catch {
      _db = createDefaultDb();
      return;
    }
  }
  // Legacy fallback: migrate old separate keys into the single DB
  _db = {
    ...createDefaultDb(),
    transactions:
      JSON.parse(localStorage.getItem("transactions") || "null") || [],
    goals: JSON.parse(localStorage.getItem("goals") || "null") || [],
    companies: JSON.parse(localStorage.getItem("companies") || "null") || [],
  };
}

export function loadDB() {
  if (!_db) initDb();
  return { db: _db, message: "Database loaded.", status: "success" };
}

export function saveDB() {
  if (!_db) initDb();
  localStorage.setItem("prosperonDB", JSON.stringify(_db));
  return { message: "Database saved successfully.", status: "success" };
}

export function getTransactions() {
  if (!_db) initDb();
  return _db.transactions;
}

export function getRecurringTransactions() {
  const allTransactions = getTransactions();
  const recurring = allTransactions.filter(
    (transaction) => transaction.isRecurring
  );

  let loggedDescriptions = new Set();
  recurring.forEach((transaction) => {
    // Log recurring transaction once with the amount of times it has occured
    if (!loggedDescriptions.has(transaction.description)) {
      const occurrences = allTransactions.filter(t => t.isRecurring && t.description === transaction.description).length;
      console.log(`Recurring transaction: ${transaction.description}, occurred ${occurrences} times`);
      loggedDescriptions.add(JSON.stringify({description: transaction.description, occurrences, amount: transaction.amount}));
    }
  });
  console.log("Logged recurring transaction descriptions:", Array.from(loggedDescriptions).map(JSON.parse ));
  return Array.from(loggedDescriptions).map(JSON.parse);
}

export function getGoals() {
  if (!_db) initDb();
  return _db.goals;
}

export function getCompletedGoals() {
  if (!_db) initDb();
  return _db.completedGoals;
}

export function getCompanies() {
  if (!_db) initDb();
  return _db.companies;
}
