import { getStatusColor } from "./transactionForm.js";
import { addGoal, updateGoal } from "../core/savingsGoalsStore.js";

function initializeAddGoalForm(presetData = {}) {
  const form = document.querySelector("#addGoalForm");
  if (!form) {
    return;
  }

  const goalNameInput = form.querySelector("#goalName");
  const desiredAmountInput = form.querySelector("#targetAmount");
  const startingAmountInput = form.querySelector("#startingAmount");
  const goalNameStatus = form.querySelector("#goalNameStatus");
  const desiredAmountStatus = form.querySelector("#targetAmountStatus");

  // Handle preset data for editing
  if (presetData.isEdit) {
    console.log("Initializing goal form for edit mode", presetData);
    
    // Pre-fill form fields
    goalNameInput.value = presetData.name || "";
    desiredAmountInput.value = presetData.targetAmount || "";
    startingAmountInput.value = presetData.currentAmount || "";
    
    // Update labels and button text for edit mode
    const startingAmountLabel = form.querySelector('label[for="startingAmount"]');
    if (startingAmountLabel) {
      startingAmountLabel.textContent = "Current Amount:";
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Update Goal";
    }
    
    // Store the goal name for updating
    form.setAttribute("data-edit-name", presetData.name);
  } else {
    // Clear any previous edit state
    form.removeAttribute("data-edit-name");
    const startingAmountLabel = form.querySelector('label[for="startingAmount"]');
    if (startingAmountLabel) {
      startingAmountLabel.textContent = "Starting Amount (Optional):";
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Add Goal";
    }
  }

  // Clear any existing listeners
  form.onsubmit = null;

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const goalName = goalNameInput.value.trim();
    const desiredAmount = parseFloat(desiredAmountInput.value);
    const startingAmount = parseFloat(startingAmountInput.value);
    let isValid = true;

    // Validate goal name
    if (!goalName) {
      goalNameStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
            <g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
            </svg> Goal name cannot be empty.`;
      isValid = false;
    } else {
      goalNameStatus.innerHTML = "";
    }

    // Validate desired amount
    if (isNaN(desiredAmount) || desiredAmount <= 0) {
      desiredAmountStatus.innerHTML = `<svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
            <g fill="${getStatusColor()}" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path></g></g>
            </svg> Desired amount must be a positive number.`;
      isValid = false;
    } else {
      desiredAmountStatus.innerHTML = "";
    }

    if (isValid) {
      try {
        const editName = form.getAttribute("data-edit-name");
        
        if (editName) {
          // We're editing an existing goal
          const goalData = {
            name: goalName,
            targetAmount: desiredAmount,
            currentAmount: isNaN(startingAmount) || startingAmount < 0 ? 0 : startingAmount,
          };
          
          console.log("Updating goal with name:", editName, goalData);
          updateGoal(editName, goalData);
          
          console.log("Goal updated successfully");
        } else {
          // We're adding a new goal
          addGoal({
            name: goalName,
            desiredAmount: desiredAmount,
            startingAmount: isNaN(startingAmount) || startingAmount < 0 ? 0 : startingAmount,
          });
          
          console.log("Goal added successfully");
        }

        // Clear the form
        form.reset();

        // Clear status messages
        goalNameStatus.innerHTML = "";
        desiredAmountStatus.innerHTML = "";

        // Clear edit state
        form.removeAttribute("data-edit-name");

        // Close the modal - ensure this happens
        setTimeout(() => {
          if (window.closeModal) {
            window.closeModal();
          }
        }, 100);
      } catch (error) {
        console.error("Error saving goal:", error);
        // Still try to close modal even if there was an error
        if (window.closeModal) {
          window.closeModal();
        }
      }
    }

    return false;
  };
  // handle edit 

  function handleEdit(goalName) {
    const goal = getAllGoals().find((g) => g.name === goalName);
    if (!goal) {
      console.error("Goal not found for editing:", goalName);
      return;
    }

    goalNameInput.value = goal.name;
    desiredAmountInput.value = goal.desiredAmount;
    startingAmountInput.value = goal.startingAmount;
    if (window.openModal) {
      window.openModal();
    }

      // Logic to update the existing goal based on form inputs








  }

  // Set the submit handler directly
  form.onsubmit = handleSubmit;

}



// Initialize when the page loads
document.addEventListener("DOMContentLoaded", initializeAddGoalForm);
document.addEventListener("componentsLoaded", initializeAddGoalForm);

// Make available globally and as export
window.initializeAddGoalForm = initializeAddGoalForm;
export { initializeAddGoalForm };
