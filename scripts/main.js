function openSidebar() {
  const headerLogo = document.querySelector(".header-logo");
  const backdrop = document.querySelector(".backdrop");
  const btn = document.querySelector(".menu-btn");
  btn.textContent = "✕";
  sidebar.classList.add("is-open");
  btn.classList.add("show-menu");
  headerLogo.classList.add("show-menu");
  backdrop.hidden = false;
  btn.setAttribute("aria-expanded", "true");
  sidebar.setAttribute("aria-hidden", "false");
}

function closeSidebar() {
  const headerLogo = document.querySelector(".header-logo");
  const backdrop = document.querySelector(".backdrop");
  const btn = document.querySelector(".menu-btn");
  btn.textContent = "☰";
  sidebar.classList.remove("is-open");
  btn.classList.remove("show-menu");
  headerLogo.classList.remove("show-menu");
  backdrop.hidden = true;
  btn.setAttribute("aria-expanded", "false");
  sidebar.setAttribute("aria-hidden", "true");
}

function initSidebar() {
  const sidebar = document.querySelector("#sidebar");
  const backdrop = document.querySelector(".backdrop");
  const themeToggle = document.querySelector("#theme-toggle");

  if (themeToggle) {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    )?.matches;

    const startTheme = saved ?? (prefersDark ? "dark" : "light");
    root.classList.toggle("dark", startTheme === "dark");
    themeToggle.checked = startTheme === "dark";

    themeToggle.addEventListener("change", () => {
      const isDark = themeToggle.checked;
      root.classList.toggle("dark", isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  const btn = document.querySelector(".menu-btn");
  backdrop.addEventListener("click", closeSidebar);

  btn.addEventListener("click", () => {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
      closeSidebar();
    }
  });
}

document.addEventListener("componentsLoaded", initSidebar);
