// main.ts \\ точка входа
import { showPage, openSet, closeSet, Pingify } from "./app";
import { TypeLog } from "./api";

/* Навигация */
document.addEventListener ("DOMContentLoaded", () => {
  showPage ("page-main");

  document.getElementById ("settings-btn")?.addEventListener ("click", () => { openSet(); });
  
  document.getElementById ("back-btn")?.addEventListener ("click", () => { showPage ("page-main")});

  document.getElementById ("settings-btn")?.addEventListener ("click", () => { showPage ("settings-overlay")});
});