import {
  showPage,
  openSettings,
  closeSettings,
  Pingify,
  macify,
  Scanify,
  initTerminal,
  initConsoleHandlers,
  initHotkeys,
} from "./app";
import { initSettings } from "./settings";

document.addEventListener("DOMContentLoaded", () => {
  showPage("dashboard");

  initTerminal();
  initSettings();
  initConsoleHandlers();
  initHotkeys();

  // SETTINGS
  document.getElementById("settings-btn")?.addEventListener("click", openSettings);
  document.getElementById("settings-close")?.addEventListener("click", closeSettings);

  // PAGE NAVIGATION
  document.querySelectorAll("[data-page]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-page") as any;
      showPage(id);
    });
  });

  // BACK BUTTONS
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => showPage("dashboard"));
  });

  // PING
  document.getElementById("ping-go")?.addEventListener("click", Pingify);

  // MAC
  document.getElementById("mac-go")?.addEventListener("click", macify);

  // SCAN
  document.getElementById("scan-go")?.addEventListener("click", Scanify);
});
