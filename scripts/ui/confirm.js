export function confirmAction() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <div class="confirm">
        <div class="confirm__content">
          <h2 class="confirm__title">Are you sure?</h2>
          <p class="confirm__message">This action cannot be undone.</p>
          <div class="confirm__buttons">
            <button class="confirm__button confirm__button--cancel">Cancel</button>
            <button class="confirm__button confirm__button--confirm">Confirm</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay
      .querySelector(".confirm__button--confirm")
      .addEventListener("click", () => {
        overlay.remove();
        resolve(true);
      });
    overlay
      .querySelector(".confirm__button--cancel")
      .addEventListener("click", () => {
        overlay.remove();
        resolve(false);
      });
  });
}
