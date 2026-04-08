export function createModal({
    rootId = 'appModal',
    titleId = 'modalTitle',
    bodyId = 'modalBody',
} = {}) {
    const root = document.getElementById(rootId);
    if (!root) throw new Error(`Element with id "${rootId}" not found`);

    const titleEl = document.getElementById(titleId);
    const bodyEl = document.getElementById(bodyId);

    console.log("Modal initialized with:", { root, titleEl, bodyEl });
    let lastFocusedEl = null;

    function openModal(title = "", body = "") {
        lastFocusedEl = document.activeElement;

        if (titleEl) titleEl.textContent = title;
        if (bodyEl) {
            bodyEl.innerHTML = "";
            if (typeof body === "string") bodyEl.innerHTML = body;
             else if (body instanceof Node) bodyEl.appendChild(body);
        }

        root.classList.add("is-open");
        root.setAttribute("aria-hidden", "false");

        const focusableElements = root.querySelector('button, input, select, [tabindex]:not([tabindex="-1"])');

        if (focusableElements) focusableElements.focus();
        
        document.addEventListener("keydown", onKeydown);
    }

    function closeModal() {
        root.classList.remove("is-open");
        root.setAttribute("aria-hidden", "true");
        document.removeEventListener("keydown", onKeydown);

        if (lastFocusedEl && lastFocusedEl.focus()) lastFocusedEl.focus();
    }

    function onKeydown(event) {
        if (event.key === "Escape") {
            closeModal();
        }

    }

    root.addEventListener("click", (event) => {
    const closeBtn = event.target.closest("[data-modal-close]");
    if (closeBtn) {
        event.preventDefault();
        closeModal();
    }});

    return { openModal, closeModal, root };
}