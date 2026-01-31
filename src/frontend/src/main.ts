// Скрыть все страницы
function hideAllPages() {
  document.querySelectorAll<HTMLElement>(".page, #page-main").forEach(p => {
    p.style.display = "none";
  });
}

// Показ страницы
function showPage(id: string) {
  hideAllPages();
  const page = document.getElementById(id) as HTMLElement | null;
  if (page) {
    page.style.display = "block";
  } else {
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
          showPage("page-scan-start");
          break;

        case "ping-device":
          showPage("page-ping-device");
          break;

        case "security-audit":
          showPage("page-security-audit");
          break;

        case "saved-profiles":
          showPage("page-profiles-list");
          break;

        case "mac-addresses":
          showPage("page-mac-addresses");
          break;

        case "saved-devices":
          showPage("page-saved-devices");
          break;

        case "user-command":
          showPage("page-user-command");
          break;

        case "export-report":
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

// Security Audit
async function runSecurityAudit(ip: string) {
  const output = document.getElementById("auditVulnList");
  const gradeCircle = document.getElementById("auditGrade");

  if (gradeCircle) gradeCircle.textContent = "?";
  if (output) output.innerHTML = "<div class='audit-vuln-item'>Running audit...</div>";

  const data = await api("audit", { ip });

  if (data.error) {
    if (output) output.innerHTML = `<div class='audit-vuln-item'>Error: ${data.error}</div>`;
    return;
  }

  // Парсинг оценки
  const grade = parseSecurityGrade(data.setSecGrade);

  // Обновление иконки
  updateSecurityGradeIcon(grade);

  // Вывод grade в текстовом виде
  if (gradeCircle) gradeCircle.setAttribute("data-grade", String(grade));

  // Если API отдаёт список уязвимостей
  if (data.vulns && Array.isArray(data.vulns)) {
    output!.innerHTML = "";
    data.vulns.forEach((v: string) => {
      const item = document.createElement("div");
      item.className = "audit-vuln-item";
      item.textContent = v;
      output!.appendChild(item);
    });
  } else {
    output!.innerHTML = "<div class='audit-vuln-item'>No vulnerabilities found</div>";
  }
}


// Кнопки назад
function initBackButtons() {
  document.querySelectorAll<HTMLElement>("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      showPage("page-main");
    });
  });
}

// MAC Address Page
function renderMacDeviceList(devices: { name: string; icon: string; mac: string }[]) {
  const container = document.getElementById("macDeviceList");
  if (!container) return;

  container.innerHTML = "";

  devices.forEach(d => {
    const card = document.createElement("div");
    card.className = "device-card";

    const img = document.createElement("img");
    img.src = `icons/${d.icon}`;
    img.alt = d.name;

    const name = document.createElement("div");
    name.className = "device-name";
    name.textContent = d.name;

    const mac = document.createElement("div");
    mac.style.fontSize = "16px";
    mac.style.color = "#333";
    mac.textContent = d.mac;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(mac);

    container.appendChild(card);
  });
}

// Scan Network
function updateScanStatus(text: string) {
  const output = document.getElementById("scanStatusOutput");
  if (output) output.textContent = text;
}

function renderDeviceList(devices: { name: string; icon: string }[]) {
  const container = document.getElementById("deviceList");
  if (!container) return;

  container.innerHTML = "";

  devices.forEach(device => {
    const card = document.createElement("div");
    card.className = "device-card";

    const img = document.createElement("img");
    img.src = `icons/${device.icon}`;
    img.alt = device.name;

    const name = document.createElement("div");
    name.className = "device-name";
    name.textContent = device.name;

    card.appendChild(img);
    card.appendChild(name);
    container.appendChild(card);
  });
}

// Ping Device
function renderPingDeviceList(devices: { name: string; icon: string; address: string }[]) {
  const container = document.getElementById("pingDeviceList");
  if (!container) return;
  container.innerHTML = "";

  devices.forEach(d => {
    const card = document.createElement("div");
    card.className = "device-card";

    const img = document.createElement("img");
    img.src = `icons/${d.icon}`;
    img.alt = d.name;

    const name = document.createElement("div");
    name.className = "device-name";
    name.textContent = d.name;

    card.appendChild(img);
    card.appendChild(name);

    card.addEventListener("click", () => {
      const input = document.getElementById("pingAddress") as HTMLInputElement | null;
      if (input) input.value = d.address;
    });

    container.appendChild(card);
  });
}

function setPingOutput(text: string) {
  const el = document.getElementById("pingOutput");
  if (el) el.textContent = text;
}

function initPingPage() {
  const btn = document.getElementById("pingGoBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const input = document.getElementById("pingAddress") as HTMLInputElement;
    if (!input) return;

    setPingOutput(`Pinging ${input.value}...`);

    const result = await api("ping", { ip: input.value });

    if (result.error) {
      setPingOutput("Error: " + result.error);
      return;
    }

    setPingOutput(result.alive ? "Device is online" : "Device is offline");
  });
}

// API
async function api(action: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ action, ...params });
  const res = await fetch(`../../api.php?` + query.toString());
  return res.json();
}

function renderSecurityAudit(data: {
  icon: string;
  name: string;
  ip: string;
  grade: number;
  vulns: string[];
}) {
  const icon = document.getElementById("auditDeviceIcon") as HTMLImageElement;
  const name = document.getElementById("auditDeviceName");
  const ip = document.getElementById("auditDeviceIP");
  const grade = document.getElementById("auditGrade");
  const list = document.getElementById("auditVulnList");

  if (icon) icon.src = `icons/${data.icon}`;
  if (name) name.textContent = data.name;
  if (ip) ip.textContent = data.ip;
  if (grade) grade.textContent = String(data.grade);

  if (list) {
    list.innerHTML = "";
    data.vulns.forEach(v => {
      const item = document.createElement("div");
      item.className = "audit-vuln-item";
      item.textContent = v;
      list.appendChild(item);
    });
  }
}

function initThemeSwitch() {
  const btn = document.getElementById("settings-switch");
  if (!btn) return;

  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  // загрузка темы
  const saved = localStorage.getItem("theme");
  if (saved === "dark") document.body.classList.add("dark");
}

function parseSecurityGrade(code: string): number {
  // Ищет G + цифру
  const match = code.match(/G(\d)/);
  if (!match) return 0;

  const num = Number(match[1]);

  // G0 = 10
  if (num === 0) {
    return 10;
  } else if (num === 1) {
    return 1;
  } else if (num === 2) {
    return 2;
  } else if (num === 3) {
    return 3;
  } else if (num === 4) {
    return 4;
  }

  return num;
}
function updateSecurityGradeIcon(grade: number) {
  const gradeEl = document.getElementById("auditGrade") as HTMLElement | null;
  if (!gradeEl) return;

  gradeEl.style.backgroundImage = `url("icons/grade-num-${grade}.svg")`;
  gradeEl.style.backgroundSize = "cover";
  gradeEl.textContent = ""; 
}


// Инициализация сайта
function init() {
  initCards();
  initSettingsModal();
  initBackButtons();
  initPingPage();
  initThemeSwitch();
  showPage("page-main");
}

document.addEventListener("DOMContentLoaded", init);
