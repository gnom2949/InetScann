// settings.ts — управление темой и настройками
import { TypeLog } from "./api";

/* -----------------------------------------
   ТЕМА
----------------------------------------- */

export function applyTheme(isDark: boolean) {
  document.documentElement.dataset.theme = isDark ? "dark" : "light";

  // визуальное состояние переключателя
  const sw = document.getElementById("theme-switch");
  if (sw) {
    if (isDark) sw.classList.add("active");
    else sw.classList.remove("active");
  }

  // лог
  TypeLog("info", `Theme changed to: ${isDark ? "dark" : "light"}`);

  // сохранение
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

/* -----------------------------------------
   ИНИЦИАЛИЗАЦИЯ НАСТРОЕК
----------------------------------------- */

export function initSettings() {
  // загрузка темы при старте
  loadTheme();

  // переключатель темы
  const sw = document.getElementById("theme-switch");
  if (sw) {
    sw.addEventListener("click", () => {
      const isDark = document.documentElement.dataset.theme !== "dark";
      applyTheme(isDark);
    });
  }

  // кнопка закрытия настроек
  const closeBtn = document.getElementById("settings-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("settings")?.classList.remove("active");
      TypeLog("info", "Settings closed");
    });
  }

  // кнопка открытия настроек
  const openBtn = document.getElementById("settings-btn");
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      document.getElementById("settings")?.classList.add("active");
      TypeLog("info", "Settings opened");
    });
  }
}
