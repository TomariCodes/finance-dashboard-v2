/* VALIDATION */
import {
  getAllTransactions,
  addTransaction,
  addRecurringTransaction,
} from "../core/transactionsStore.js";
import {
  renderGoalsTable,
  renderSavingsCategories,
  getAllGoals,
  changeGoalStatus,
} from "../core/savingsGoalsStore.js";
import {
  renderInvestmentCategories,
  getAllCompanies,
} from "../core/investmentsStore.js";
import {
  addToSavingsGoal,
  removeFromSavingsGoal,
} from "../calculators/cashBalance.js";

export const getStatusColor = () => {
  return document.documentElement.classList.contains("dark")
    ? "hsl(9 26% 64%)"
    : "hsl(9 21% 41%)";
};

function initializeTransactionForm(presetData = {}) {
  console.log("initializeTransactionForm called with presetData:", presetData);
  const form = document.querySelector("#addTransactionForm");
  if (!form) return; // Form not found, exit

  const amountInput = form.querySelector("#amount");
  const descriptionInput = form.querySelector("#description");
  const dateInput = form.querySelector("#date");
  const typeInput = form.querySelector("#type");
  const categoryInput = document.querySelector("#category");
  const recurrenceInput = document.querySelector("#recurrence");
  const extraFieldsContainer = document.querySelector("#extras");

  const amountStatus = form.querySelector("#amountStatus");
  const descriptionStatus = form.querySelector("#descriptionStatus");
  const dateStatus = form.querySelector("#dateStatus");
  const typeStatus = form.querySelector("#typeStatus");
  const categoryStatus = form.querySelector("#categoryStatus");

  // Define the handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Get form values
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const date = dateInput.value;
    const type = typeInput.value;
    const category = categoryInput.value;
    const recurrence = recurrenceInput.value;
    let hasErrors = false;

    // Clear previous status messages
    amountStatus.innerHTML = "";
    descriptionStatus.innerHTML = "";
    dateStatus.innerHTML = "";
    typeStatus.innerHTML = "";
    categoryStatus.innerHTML = "";

    // Validation logic
    if (isNaN(amount) || amount <= 0) {
      amountStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg> Please enter a valid amount greater than 0.`;
      hasErrors = true;
    }

    if (description === "") {
      descriptionStatus.innerHTML = `
      <svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>Description cannot be empty.`;
      hasErrors = true;
    }

    if (date === "") {
      dateStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>Please select a date.`;
      hasErrors = true;
    }

    if (type === "") {
      typeStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>Please select a transaction type.`;
      hasErrors = true;
    }

    // Savings and Investment have their own dedicated category selectors in #extras;
    // skip the generic #category check for those types.
    if (category === "" && type !== "Savings" && type !== "Investment") {
      categoryStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>Please select a category.`;
      hasErrors = true;
    }

    if (typeInput.value === "Expense" && amount > 0) {
      amountStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>For expenses, please enter a positive amount.`;
    } else if (typeInput.value === "Income" && amount < 0) {
      amountStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>For income, please enter a positive amount.`;
    }

    if (typeInput.value === "Savings") {
      const savingsCategory = document.querySelector("#savingsCategory");
      const savingsCategoryStatus = document.querySelector(
        "#savingsCategoryStatus",
      );
      const savingsDirection = document.querySelector("#savingsDirection");
      const savingsDirectionStatus = document.querySelector(
        "#savingsDirectionStatus",
      );

      if (!savingsCategory || !savingsCategory.value) {
        if (savingsCategoryStatus) {
          savingsCategoryStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>Please select a savings category.`;
        }
        hasErrors = true;
      } else {
        if (savingsCategoryStatus) {
          savingsCategoryStatus.innerHTML = "";
        }
      }

      if (!savingsDirection || !savingsDirection.value) {
        if (savingsDirectionStatus) {
          savingsDirectionStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256"> 
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3 -3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>Please select a savings direction.`;
        }
        hasErrors = true;
      } else {
        if (savingsDirectionStatus) {
          savingsDirectionStatus.innerHTML = "";
        }
      }
    }

    if (typeInput.value === "Investment") {
      const investmentCategory = document.querySelector("#investmentCategory");
      const investmentCategoryStatus = document.querySelector(
        "#investmentCategoryStatus",
      );
      const investmentDirection = document.querySelector(
        "#investmentDirection",
      );
      const investmentDirectionStatus = document.querySelector(
        "#investmentDirectionStatus",
      );

      if (!investmentCategory || !investmentCategory.value) {
        if (investmentCategoryStatus) {
          investmentCategoryStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>Please select an investment company.`;
        }
        hasErrors = true;
      } else {
        if (investmentCategoryStatus) {
          investmentCategoryStatus.innerHTML = "";
        }
      }

      if (!investmentDirection || !investmentDirection.value) {
        if (investmentDirectionStatus) {
          investmentDirectionStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256"> 
<g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
</svg>Please select an investment direction.`;
        }
        hasErrors = true;
      } else {
        if (investmentDirectionStatus) {
          investmentDirectionStatus.innerHTML = "";
        }
      }
    }

    // Return early if there are validation errors (keep modal open)
    if (hasErrors) {
      console.log("[transactionForm] Validation failed — not submitting");
      return;
    }

    console.log(
      "[transactionForm] Validation passed. type:",
      type,
      "amount:",
      amount,
      "date:",
      date,
      "recurrence:",
      recurrence,
    );

    // All validation passed - handle the form submission
    const editId = form.getAttribute("data-edit-id");

    try {
      if (editId) {
        // We're editing an existing transaction
        const transactionData = {
          date,
          type,
          description,
          amount,
          category,
        };

        // Add savings direction if it's a savings transaction
        if (type === "Savings") {
          const savingsDirection =
            document.querySelector("#savingsDirection").value;

          transactionData.toTotal = savingsDirection === "to" ? true : false;

          if (savingsDirection === "to") {
            addToSavingsGoal(amount, category, getAllGoals());
          } else if (savingsDirection === "from") {
            removeFromSavingsGoal(amount, category, getAllGoals());
          }
        }

        // Add investment direction if it's an investment transaction
        if (type === "Investment") {
          const investmentCategoryEl = document.querySelector(
            "#investmentCategory",
          );
          const investmentDirection = document.querySelector(
            "#investmentDirection",
          ).value;
          if (investmentCategoryEl && investmentCategoryEl.value) {
            const co = getAllCompanies().find(
              (c) => c.id == investmentCategoryEl.value,
            );
            if (co) transactionData.category = co.name;
          }
          transactionData.investmentDirection = investmentDirection;
        }

        if (recurrence && recurrence !== "") {
          transactionData.isRecurring = true;
          transactionData.recurrenceInterval = recurrence;
        }

        console.log("Updating transaction with ID:", editId, transactionData);

        // Call the global updateTransaction function
        if (window.updateTransaction) {
          window.updateTransaction(editId, transactionData);
          if (window.updateCharts) window.updateCharts();
          if (type === "Investment" && window.refreshInvestments)
            window.refreshInvestments();
        }
      } else {
        // We're adding a new transaction
        const transactionData = {
          date,
          type,
          description,
          amount,
          category,
        };

        // Add savings direction if it's a savings transaction
        if (type === "Savings") {
          const savingsCategory =
            document.querySelector("#savingsCategory").value;
          transactionData.category = savingsCategory;
          const savingsDirection =
            document.querySelector("#savingsDirection").value;
          transactionData.toTotal = savingsDirection === "to" ? true : false;
        }

        // Add investment direction if it's an investment transaction
        if (type === "Investment") {
          const investmentCategoryEl = document.querySelector(
            "#investmentCategory",
          );
          const investmentDirection = document.querySelector(
            "#investmentDirection",
          ).value;
          if (investmentCategoryEl && investmentCategoryEl.value) {
            const co = getAllCompanies().find(
              (c) => c.id == investmentCategoryEl.value,
            );
            if (co) transactionData.category = co.name;
          }
          transactionData.investmentDirection = investmentDirection;
        }

        // Check if this is a recurring transaction
        if (recurrence && recurrence !== "") {
          console.log(
            "Creating recurring transaction with interval:",
            recurrence,
          );
          addRecurringTransaction(transactionData, recurrence);

          if (type === "Savings" && transactionData.toTotal !== false) {
            const goal = getAllGoals().find(
              (g) => g.name === transactionData.category,
            );
            if (goal) changeGoalStatus(goal);
            if (window.renderSavingsSummary) window.renderSavingsSummary();
          }
        } else {
          addTransaction(transactionData);

          if (type === "Savings") {
            const savingsDirection =
              transactionData.toTotal !== false ? "to" : "from";
            if (savingsDirection === "to") {
              addToSavingsGoal(amount, transactionData.category, getAllGoals());
              const goal = getAllGoals().find(
                (g) => g.name === transactionData.category,
              );
              if (goal) changeGoalStatus(goal);
            } else {
              removeFromSavingsGoal(
                amount,
                transactionData.category,
                getAllGoals(),
              );
            }
            if (window.renderSavingsSummary) window.renderSavingsSummary();
          }
        }

        if (type === "Savings") renderGoalsTable(getAllGoals());
        if (window.refreshTransactions) window.refreshTransactions();
        if (window.updateCharts) window.updateCharts();
        if (type === "Investment" && window.refreshInvestments)
          window.refreshInvestments();
      }
    } catch (err) {
      console.error("[transactionForm] Submission error:", err);
    } finally {
      // Always close the modal and reset the form regardless of errors
      console.log(
        "[transactionForm] closing modal. window.closeModal:",
        typeof window.closeModal,
      );
      if (window.closeModal) window.closeModal();

      form.reset();
      typeInput.disabled = false;
      const savingsCatEl = document.querySelector("#savingsCategory");
      if (savingsCatEl) savingsCatEl.disabled = false;
      const investmentCatEl = document.querySelector("#investmentCategory");
      if (investmentCatEl) investmentCatEl.disabled = false;
      form.removeAttribute("data-edit-id");
      amountStatus.textContent = "";
      descriptionStatus.textContent = "";
      dateStatus.textContent = "";
      typeStatus.textContent = "";
      categoryStatus.textContent = "";
    }
  };

  // Handle preset data if provided
  if (presetData.type) {
    typeInput.value = presetData.type;
    if (presetData.disableTypeChange) {
      typeInput.disabled = true;
      console.log("Disabled type input");
    }
  }

  // Remove any existing listeners to avoid duplicates
  form.removeEventListener("submit", handleSubmit);
  form.addEventListener("submit", handleSubmit);

  typeInput.addEventListener("change", () => {
    // Clear any existing validation status messages
    const statusElements = form.querySelectorAll(".statusText");
    statusElements.forEach((status) => {
      if (status.id.includes("Category") || status.id.includes("Direction")) {
        status.innerHTML = "";
      }
    });

    const categoryFieldWrapper = categoryInput.closest(".mb-3");

    if (typeInput.value === "Income") {
      if (categoryFieldWrapper) categoryFieldWrapper.style.display = "";
      categoryInput.innerHTML = `
       <option value="">Select category</option>
          <option value="salary">Salary</option>
          <option value="freelance">Freelance</option>
          <option value="investments">Investments</option>
          <option value="gifts">Gifts</option>
          <option value="other">Other</option>`;
    } else if (
      typeInput.value === "Savings" ||
      typeInput.value === "Investment"
    ) {
      // Savings and Investment use dedicated selectors in #extras; hide the generic one.
      if (categoryFieldWrapper) categoryFieldWrapper.style.display = "none";
    } else {
      if (categoryFieldWrapper) categoryFieldWrapper.style.display = "";
      categoryInput.innerHTML = `
      <option value="">Select category</option>
      <option value="food">Food & Groceries</option>
      <option value="entertainment">Entertainment</option>
      <option value="util">Utilities & Bills</option>
      <option value="income">Gift</option>
      <option value="savings">Salary</option>
      <option value="misc">Misc</option>`;
    }

    if (typeInput.value === "Expense") {
      recurrenceInput.disabled = true;
      recurrenceInput.value = "";
    } else {
      recurrenceInput.disabled = false;
    }

    if (typeInput.value === "Investment") {
      extraFieldsContainer.innerHTML = ""; // Clear any existing extra fields
      console.log("Creating Investment fields...");
      const firstLabelDiv = document.createElement("div");
      const investmentCategoryStatus = document.createElement("p");
      const inputFirst = document.createElement("select");
      const labelFirst = document.createElement("label");
      firstLabelDiv.classList.add("mb-3");
      investmentCategoryStatus.setAttribute("id", "investmentCategoryStatus");
      investmentCategoryStatus.classList.add("statusText");
      labelFirst.classList.add("form-label");
      labelFirst.classList.add("extra-label");
      labelFirst.setAttribute("for", "investmentCategory");
      labelFirst.textContent = "Investment Category:";
      inputFirst.classList.add("form-control");
      inputFirst.setAttribute("id", "investmentCategory");

      const secondLabelDiv = document.createElement("div");
      const investmentDirectionStatus = document.createElement("p");
      const labelSecond = document.createElement("label");
      const inputSecond = document.createElement("select");
      secondLabelDiv.classList.add("mb-3");
      investmentDirectionStatus.setAttribute("id", "investmentDirectionStatus");
      investmentDirectionStatus.classList.add("statusText");
      labelSecond.classList.add("form-label");
      labelSecond.classList.add("extra-label");
      labelSecond.setAttribute("for", "investmentDirection");
      labelSecond.textContent = "Investment Direction:";
      inputSecond.classList.add("form-control");
      inputSecond.setAttribute("id", "investmentDirection");
      inputSecond.innerHTML = `
        <option value="">Select direction</option>
        <option value="to">Total → Investment</option>
        <option value="from">Investment → Total</option>
            `;

      renderInvestmentCategories(inputFirst, getAllCompanies());
      firstLabelDiv.appendChild(labelFirst);
      firstLabelDiv.appendChild(inputFirst);
      firstLabelDiv.appendChild(investmentCategoryStatus);
      extraFieldsContainer.appendChild(firstLabelDiv);
      secondLabelDiv.appendChild(labelSecond);
      secondLabelDiv.appendChild(inputSecond);
      secondLabelDiv.appendChild(investmentDirectionStatus);
      extraFieldsContainer.appendChild(secondLabelDiv);
    } else if (typeInput.value === "Savings") {
      extraFieldsContainer.innerHTML = "";
      console.log("Creating Savings fields...");
      const firstLabelDiv = document.createElement("div");
      const savingsCategoryStatus = document.createElement("p");
      const inputFirst = document.createElement("select");
      const labelFirst = document.createElement("label");
      firstLabelDiv.classList.add("mb-3");
      savingsCategoryStatus.setAttribute("id", "savingsCategoryStatus");
      savingsCategoryStatus.classList.add("statusText");
      labelFirst.classList.add("form-label");
      labelFirst.classList.add("extra-label");
      labelFirst.setAttribute("for", "savingsCategory");
      labelFirst.textContent = "Savings Category:";
      inputFirst.classList.add("form-control");
      inputFirst.setAttribute("id", "savingsCategory");

      const secondLabelDiv = document.createElement("div");
      const savingsDirectionStatus = document.createElement("p");
      const labelSecond = document.createElement("label");
      const inputSecond = document.createElement("select");
      secondLabelDiv.classList.add("mb-3");
      savingsDirectionStatus.setAttribute("id", "savingsDirectionStatus");
      savingsDirectionStatus.classList.add("statusText");
      labelSecond.classList.add("form-label");
      labelSecond.classList.add("extra-label");
      labelSecond.setAttribute("for", "savingsDirection");
      labelSecond.textContent = "Savings Direction:";
      inputSecond.classList.add("form-control");
      inputSecond.setAttribute("id", "savingsDirection");
      inputSecond.innerHTML = `
        <option value="">Select direction</option>
        <option value="to">Total → Savings</option>
        <option value="from">Savings → Total</option>
            `;

      renderSavingsCategories(inputFirst, getAllGoals());
      firstLabelDiv.appendChild(labelFirst);
      firstLabelDiv.appendChild(inputFirst);
      firstLabelDiv.appendChild(savingsCategoryStatus);
      extraFieldsContainer.appendChild(firstLabelDiv);
      secondLabelDiv.appendChild(labelSecond);
      secondLabelDiv.appendChild(inputSecond);
      secondLabelDiv.appendChild(savingsDirectionStatus);
      extraFieldsContainer.appendChild(secondLabelDiv);

      // Apply preset data if this is a savings transaction
      if (presetData.type === "Savings" && presetData.savingsGoalName) {
        inputFirst.value = presetData.savingsGoalName;
        if (presetData.disableSavingsGoal) {
          inputFirst.disabled = true;
        }
        // Default to "to" direction for adding money to savings
        inputSecond.value = "to";
      }
    } else {
      // Clear extra fields for other transaction types
      extraFieldsContainer.innerHTML = "";
    }
  });

  // Trigger change event for preset data after event listener is attached
  if (presetData.type) {
    typeInput.dispatchEvent(new Event("change"));

    // Pre-fill savings goal if specified - wait for DOM to update
    if (presetData.type === "Savings" && presetData.savingsGoalName) {
      setTimeout(() => {
        console.log("Applying savings preset data...");
        const savingsCategory = document.querySelector("#savingsCategory");
        const savingsDirection = document.querySelector("#savingsDirection");

        if (savingsCategory) {
          console.log(
            "Setting savings category to:",
            presetData.savingsGoalName,
          );
          savingsCategory.value = presetData.savingsGoalName;
          console.log("Savings category set to:", savingsCategory.value);
          if (presetData.disableSavingsGoal) {
            savingsCategory.disabled = true;
            console.log("Disabled savings category input");
          }
        } else {
          console.log("Savings category field not found");
        }

        if (savingsDirection) {
          console.log("Setting savings direction to: to");
          savingsDirection.value = "to";
        } else {
          console.log("Savings direction field not found");
        }
      }, 300); // Wait for DOM update
    }

    // Pre-fill investment company if specified - wait for DOM to update
    if (presetData.type === "Investment" && presetData.investmentCompanyName) {
      setTimeout(() => {
        console.log("Applying investment preset data...");
        const investmentCategory = document.querySelector(
          "#investmentCategory",
        );
        const investmentDirection = document.querySelector(
          "#investmentDirection",
        );

        if (investmentCategory) {
          console.log(
            "Setting investment category to:",
            presetData.investmentCompanyName,
          );

          // Find the company ID for the company name
          const companies = getAllCompanies();
          const company = companies.find(
            (c) => c.name === presetData.investmentCompanyName,
          );
          if (company) {
            investmentCategory.value = company.id;
            console.log(
              "Investment category set to:",
              investmentCategory.value,
            );
            if (presetData.disableInvestmentCompany) {
              investmentCategory.disabled = true;
              console.log("Disabled investment category input");
            }
          } else {
            console.log("Company not found:", presetData.investmentCompanyName);
          }
        } else {
          console.log("Investment category field not found");
        }

        if (investmentDirection) {
          console.log("Setting investment direction to: to");
          investmentDirection.value = "to"; // Default to adding money to investment
        } else {
          console.log("Investment direction field not found");
        }
      }, 300); // Wait for DOM update
    }
  }
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", initializeTransactionForm);
document.addEventListener("componentsLoaded", initializeTransactionForm);

// Make function globally available for modal usage
window.initializeTransactionForm = initializeTransactionForm;
