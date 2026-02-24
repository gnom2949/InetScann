// settings.ts
import { TypeLog } from "./api";

export async function applyTheme(isDark: boolean) {
  document.documentElement.dataset.theme = isDark ? "dark" : "light";

  const sw = document.getElementById("theme-switch");
  if (sw) {
    if (isDark) sw.classList.add("active");
    else sw.classList.remove("active");
  }

  await TypeLog("info", `Theme changed to: ${isDark ? "dark" : "light"}`);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

export function loadTheme() {
  const saved = localStorage.getItem("theme");

  if (saved === "dark") {
    document.documentElement.dataset.theme = "dark";
    document.getElementById("theme-switch")?.classList.add("active");
  } else {
    document.documentElement.dataset.theme = "light";
    document.getElementById("theme-switch")?.classList.remove("active");
  }
}

export async function initSettings() 
{
  loadTheme();

  const sw = document.getElementById("theme-switch");
  if (sw) {
    sw.addEventListener("click", async () => {
      const isDark = document.documentElement.dataset.theme !== "dark";
      await applyTheme(isDark);
    });
  }

  const closeBtn = document.getElementById("settings-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", async () => {
      document.getElementById("settings")?.classList.remove("active");
      await TypeLog("info", "Settings closed");
    });
  }

  const openBtn = document.getElementById("settings-btn");
  if (openBtn) {
    openBtn.addEventListener("click", async () => {
      document.getElementById("settings")?.classList.add("active");
      await TypeLog("info", "Settings opened");
    });
  }
}