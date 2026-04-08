async function loadComponent(id, path) {
  const container = document.getElementById(id);

  if (!container) return;

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load`);
    }

    container.innerHTML = await response.text();
  } catch (error) {
    console.error(`Error loading ${path}`, error);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadComponent("header-container", "components/header.html"),
    loadComponent("footer-container", "components/footer.html"),
    loadComponent("sidebar-container", "components/aside.html"),
    loadComponent("modalBody", "components/addTransactionForm.html"),
    loadComponent("goalModalBody", "components/addGoalForm.html"),
    loadComponent("companyModalBody", "components/addCompanyForm.html"),
    loadComponent("settingsModalBody", "components/settingsModal.html"),
  ]);

  document.dispatchEvent(new CustomEvent("componentsLoaded"));
});
