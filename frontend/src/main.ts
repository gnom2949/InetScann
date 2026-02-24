// main.ts
import {
  showPage,
  openSettings,
  closeSettings,
  initTerminal,
  initConsoleHandlers,
  initHotkeys,
  initApp,
} from "./app";
import { initSettings } from "./settings";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize core systems
  initTerminal();
  initSettings();
  initConsoleHandlers();
  initHotkeys();
  initApp();

  // Show dashboard
  showPage("dashboard");

  // Settings handlers
  document.getElementById("settings-btn")?.addEventListener("click", openSettings);
  document.getElementById("settings-close")?.addEventListener("click", closeSettings);

  // Page navigation
  document.querySelectorAll("[data-page]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-page") as any;
      if (id) showPage(id);
    });
  });

  // Back buttons
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => showPage("dashboard"));
  });
});