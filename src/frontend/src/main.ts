// Скрыть все страницы
function hideAllPages() {
  document.querySelectorAll<HTMLElement>(".page, #page-main").forEach(p => {
    p.style.display = "none";
  });
}

// Показать страницу
function showPage(id: string) {
  hideAllPages();
  const page = document.getElementById(id) as HTMLElement | null;
  if (page) {
    page.style.display = "block";
  } else {
    // fallback
    const main = document.getElementById("page-main") as HTMLElement | null;
    if (main) main.style.display = "block";
  }
}

// Инициализация карточек
function initCards() {
  document.querySelectorAll<HTMLElement>(".card").forEach(card => {
    card.addEventListener("click", () => {
      const view = card.dataset.view;
      if (!view) return;

      switch (view) {
        case "scan-network":
          // пока нет страницы
          break;
        case "ping-device":
          showPage("page-ping");
          break;
        case "security-audit":
          showPage("page-security-audit");
          break;
        case "export-report":
          // позже сделаем
          break;
        case "saved-profiles":
          showPage("page-profiles-list");
          break;
        case "mac-addresses":
          showPage("page-mac-scan");
          break;
        case "saved-devices":
          // позже
          break;
        case "user-command":
          showPage("page-user-command");
          break;
      }
    });
  });
}

// Модалка настроек
function initSettingsModal() {
  const settingsBtn = document.querySelector<HTMLElement>(".settings-btn");
  const settingsOverlay = document.getElementById("settings") as HTMLElement | null;

  if (!settingsBtn || !settingsOverlay) return;

  settingsBtn.addEventListener("click", () => {
    settingsOverlay.style.display = "flex";
  });

  settingsOverlay.addEventListener("click", (ev) => {
    if (ev.target === settingsOverlay) {
      settingsOverlay.style.display = "none";
    }
  });
}

// Кнопки назад
function initBackButtons() {
  document.querySelectorAll<HTMLElement>("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      showPage("page-main");
    });
  });
}

// Инициализация сайта
function init() {
  initCards();
  initSettingsModal();
  initBackButtons();
  showPage("page-main");
}

document.addEventListener("DOMContentLoaded", init);
