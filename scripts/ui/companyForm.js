import { getStatusColor } from "./transactionForm.js";
import {
  getAllCompanies,
  addCompany,
  updateCompany,
  returnTicker,
} from "../core/investmentsStore.js";

function initializeAddCompanyForm(presetData = {}) {
  const form = document.querySelector("#addCompanyForm");
  if (!form) {
    return;
  }

  const companyNameInput = form.querySelector("#companyName");
  const startingAmountInput = form.querySelector("#startingAmount");
  const companyNameStatus = form.querySelector("#companyNameStatus");

  // Update form title and button text if editing
  if (presetData.isEdit) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Update Company";
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const companyName = companyNameInput.value.trim();
    const startingAmount = parseFloat(startingAmountInput.value) || 0;
    let hasErrors = false;

    // Clear previous status
    companyNameStatus.innerHTML = "";

    // Validation
    if (companyName === "") {
      companyNameStatus.innerHTML = `
        <svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
          <g fill="${getStatusColor()}" fill-rule="nonzero">
            <g transform="scale(5.12,5.12)">
              <path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path>
            </g>
          </g>
        </svg>Company name cannot be empty.`;
      hasErrors = true;
    }

    // Check if company already exists (but allow same name if editing the same company)
    const existingCompanies = getAllCompanies();
    const existingCompany = existingCompanies.find(
      (c) => c.name.toLowerCase() === companyName.toLowerCase(),
    );
    if (
      existingCompany &&
      (!presetData.isEdit || presetData.originalName !== companyName)
    ) {
      companyNameStatus.innerHTML = `
        <svg class="statusIcon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
          <g fill="${getStatusColor()}" fill-rule="nonzero">
            <g transform="scale(5.12,5.12)">
              <path d="M25,2c-12.6907,0 -23,10.3093 -23,23c0,12.69071 10.3093,23 23,23c12.69071,0 23,-10.30929 23,-23c0,-12.6907 -10.30929,-23 -23,-23zM25,4c11.60982,0 21,9.39018 21,21c0,11.60982 -9.39018,21 -21,21c-11.60982,0 -21,-9.39018 -21,-21c0,-11.60982 9.39018,-21 21,-21zM25,11c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3zM21,21v2h1h1v13h-1h-1v2h1h1h4h1h1v-2h-1h-1v-15h-1h-4z"></path>
            </g>
          </g>
        </svg>Company already exists.`;
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      if (presetData.isEdit) {
        // Update existing company - fetch new ticker
        console.log(`Fetching ticker for updated company: ${companyName}`);
        const ticker =
          (await returnTicker(companyName)) ||
          companyName
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
            .substring(0, 4);

        updateCompany(presetData.originalName, {
          name: companyName,
          ticker: ticker,
        });
        alert(
          `Company "${companyName}" updated successfully with ticker: ${ticker}`,
        );
      } else {
        // Add new company - fetch ticker from API
        console.log(`Fetching ticker for new company: ${companyName}`);
        const ticker =
          (await returnTicker(companyName)) ||
          companyName
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
            .substring(0, 4);

        addCompany({
          name: companyName,
          ticker: ticker,
        });
        alert(
          `Company "${companyName}" added successfully with ticker: ${ticker}`,
        );
      }

      // Clear form
      form.reset();
      companyNameStatus.textContent = "";

      // Close modal
      if (window.closeModal) {
        window.closeModal();
      }
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Error saving company. Please try again.");
    }
  };

  // Remove existing listeners and add new one
  form.removeEventListener("submit", handleSubmit);
  form.addEventListener("submit", handleSubmit);

  // Apply preset data if provided
  if (presetData.name) {
    companyNameInput.value = presetData.name;
  }
  if (presetData.startingAmount) {
    startingAmountInput.value = presetData.startingAmount;
  }
}

// Make function globally available
window.initializeAddCompanyForm = initializeAddCompanyForm;

// Initialize when DOM loads
document.addEventListener("DOMContentLoaded", initializeAddCompanyForm);
document.addEventListener("componentsLoaded", initializeAddCompanyForm);
