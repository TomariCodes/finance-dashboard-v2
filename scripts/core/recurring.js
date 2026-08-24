import {saveDB, loadDB, getTransactions, getGoals} from "./storage.js";
import {setRecurrence} from "./dates.js";
import { addTransaction } from "./transactionsStore.js";

export function getRecurringTransactionTemplates() {
  return (getTransactions() || []).filter((t) => t.isTemplate === true);
}

export function processRecurringTransactions(force = false) {
  const today = new Date().toISOString().split("T")[0];
  const currentTransactions = getTransactions() || [];
  const db = {
    transactions: currentTransactions,
    goals: getGoals(),
  };
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


export function addRecurringTransaction(data, recurrenceInterval) {
  const today = new Date().toISOString().split("T")[0];
  const startDate = data.date;

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
  loadDB().db.recurringTransactions.push(savedTemplate);
  saveDB();
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

  const allTransactions = getTransactions() || [];
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
        const goalsArr = getGoals() || [];
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
            const updatedTransactions = getTransactions().filter(
              (t) =>
                t.id !== templateId &&
                !(t.templateId === templateId && t.date > dateString),
            );
            saveDB({ transactions: updatedTransactions });
            //
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

export function deleteRecurringTemplate(templateId) {
  const today = new Date().toISOString().split("T")[0];
  const db = loadDB().db;
  db.transactions = db.transactions.filter(
    (t) =>
      t.id !== templateId && !(t.templateId === templateId && t.date > today),
  );
  saveDB();
}