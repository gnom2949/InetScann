import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

let term: Terminal;
let fitAddon: FitAddon;
let eventSrc: EventSource | null = null;

const API_BASE = window.location.origin;

/* -----------------------------------
   API WRAPPER
----------------------------------- */
async function api(action: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ action, ...params });
  const url = `${API_BASE}/api.php?${query.toString()}`;

  try {
    const res = await fetch(url);
    const ct = res.headers.get("Content-Type") || "";

    if (!ct.includes("application/json")) {
      return { error: "Server returned non‑JSON response" };
    }

    return await res.json();
  } catch {
    return { error: "Network error: please check connection" };
  }
}

/* -----------------------------------
   PAGE SWITCHING
----------------------------------- */
function hideAllPages() {
  document.querySelectorAll<HTMLElement>(".page").forEach(p => p.style.display = "none");
}

function showPage(id: string) {
  hideAllPages();
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

/* -----------------------------------
   DEVICE ICON LOGIC
----------------------------------- */
function getDeviceIcon(vendor: string, safety: string): string {
  let color = "YELLOW";
  if (safety === "normal") color = "GREEN";
  else if (safety === "untrusted") color = "RED";
  else if (safety === "doubtful") color = "YELLOW";

  const v = vendor.toLowerCase();
  let vendorName = "Unknown";

  if (v.includes("cisco")) vendorName = "Cisco";
  else if (v.includes("apple")) vendorName = "Apple";
  else if (v.includes("google")) vendorName = "Google";
  else if (
    v.includes("tp-link") ||
    v.includes("d-link") ||
    v.includes("asus") ||
    v.includes("msi") ||
    v.includes("huawei") ||
    v.includes("router")
  ) {
    vendorName = "Routers";
  }
  else if (v.includes("samsung")) vendorName = "Samsung";
  else if (v.includes("microsoft")) vendorName = "Microsoft";

  return `icons/${vendorName}${color}.svg`;
}

/* -----------------------------------
   SECURITY GRADE PARSER
----------------------------------- */
function parseSecurityGrade(code: string): number {
  const m = code.match(/G(\d)/);
  if (!m) return 0;

  const raw = Number(m[1]);
  if (raw === 0) return 10;
  return 10 - raw;
}

function updateSecurityGradeIcon(grade: number) {
  const el = document.getElementById("auditGrade") as HTMLElement | null;
  if (!el) return;

  el.style.backgroundImage = `url("icons/grade-num-${grade}.svg")`;
  el.style.backgroundSize = "cover";
  el.style.backgroundPosition = "center";
  el.textContent = "";
}

/* -----------------------------------
   SECURITY AUDIT PAGE
----------------------------------- */
async function runSecAud(ip: string, vendor: string, safety: string) {
  const list = document.getElementById("auditVulnList");
  const gradeEl = document.getElementById("auditGrade");
  const devIcon = document.getElementById("auditDeviceIcon") as HTMLImageElement;
  const devName = document.getElementById("auditDeviceName");
  const devIP = document.getElementById("auditDeviceIP");

  if (list) list.innerHTML = "<div class='audit-vuln-item'>Running audit...</div>";
  if (gradeEl) gradeEl.textContent = "?";

  devIcon.src = getDeviceIcon(vendor, safety);
  if (devName) devName.textContent = vendor;
  if (devIP) devIP.textContent = ip;

  const data = await api("audit", { ip });

  if (data.error) {
    list!.innerHTML = `<div class='audit-vuln-item'>${data.error}</div>`;
    return;
  }

  const grade = parseSecurityGrade(data.setSecGrade);
  updateSecurityGradeIcon(grade);

  if (list) {
    list.innerHTML = "";
    if (Array.isArray(data.vulns)) {
      data.vulns.forEach((v: string) => {
        const item = document.createElement("div");
        item.className = "audit-vuln-item";
        item.textContent = v;
        list.appendChild(item);
      });
    } else {
      list.innerHTML = "<div class='audit-vuln-item'>No vulnerabilities found</div>";
    }
  }
}

/* -----------------------------------
   PING PAGE
----------------------------------- */
async function runPing(ip: string) {
  const out = document.getElementById("pingOutput");
  if (out) out.textContent = "Pinging...";

  const data = await api("ping", { ip });

  if (data.error) {
    out!.textContent = data.error;
    return;
  }

  out!.textContent = data.output || "No response";
}

/* -----------------------------------
   SCAN PAGE
----------------------------------- */
async function runScan(ipRange: string) {
  showPage("page-scan-start");
  const status = document.getElementById("scanStatusOutput");
  if (status) status.textContent = ipRange;

  const data = await api("scan", { range: ipRange });

  if (data.error) {
    showPage("page-scan-error");
    return;
  }

  const list = document.getElementById("deviceList");
  if (!list) return;

  if (!Array.isArray(data.devices) || data.devices.length === 0) {
    showPage("page-scan-error");
    return;
  }

  list.innerHTML = "";
  data.devices.forEach((dev: any) => {
    const card = document.createElement("div");
    card.className = "device-card";

    const icon = getDeviceIcon(dev.vendor, dev.safety);

    card.innerHTML = `
      <img class="device-icon" src="${icon}">
      <div class="device-name">${dev.vendor}</div>
      <div class="device-ip">${dev.ip}</div>
    `;

    card.addEventListener("click", () => {
      showPage("page-security-audit");
      runSecAud(dev.ip, dev.vendor, dev.safety);
    });

    list.appendChild(card);
  });

  showPage("page-scan-network");
}

/* -----------------------------------
   MAC SCAN PAGE
----------------------------------- */
async function runMACScan(target: string) {
  const out = document.getElementById("macResults");
  if (out) out.textContent = "Scanning...";

  const data = await api("macscan", { target });

  if (data.error) {
    out!.textContent = data.error;
    return;
  }

  const list = document.getElementById("macDeviceList");
  if (!list) return;

  list.innerHTML = "";

  data.devices.forEach((dev: any) => {
    const icon = getDeviceIcon(dev.vendor, dev.safety);

    const card = document.createElement("div");
    card.className = "device-card";

    card.innerHTML = `
      <img class="device-icon" src="${icon}">
      <div class="device-name">${dev.vendor}</div>
      <div class="device-ip">${dev.mac}</div>
    `;

    list.appendChild(card);
  });

  showPage("page-mac-addresses");
}

/* -----------------------------------
   XTERM + SSE CONSOLE
----------------------------------- */
function initConsole() {
  term = new Terminal({
    cursorBlink: true,
    fontFamily: "monospace",
    fontSize: 16,
    theme: {
      background: "#000000",
      foreground: "#00FF00"
    }
  });

  fitAddon = new FitAddon();
  term.loadAddon(fitAddon);

  const box = document.getElementById("consoleBox");
  if (box) {
    term.open(box);
    fitAddon.fit();
  }

  const input = document.getElementById("consoleInput") as HTMLInputElement;
  const btn = document.getElementById("consoleRun");

  if (btn) {
    btn.addEventListener("click", () => {
      if (input) runConsoleCommand(input.value);
    });
  }

  if (input) {
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        runConsoleCommand(input.value);
      }
    });
  }
}

function runConsoleCommand(cmd: string) {
  if (eventSrc) eventSrc.close();
  term.clear();

  eventSrc = new EventSource(`${API_BASE}/console.php?cmd=${encodeURIComponent(cmd)}`);

  eventSrc.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    term.write(data.output);
  };

  eventSrc.onerror = () => {
    term.write("\r\n[Connection closed]\r\n");
    eventSrc?.close();
  };
}

/* -----------------------------------
   INIT
----------------------------------- */
function init() {
  initConsole();

  // Back buttons
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => showPage("page-main"));
  });

  // Main menu cards
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const view = card.getAttribute("data-view");
      if (!view) return;

      if (view === "scan-network") showPage("page-scan-start");
      else if (view === "ping-device") showPage("page-ping-device");
      else if (view === "security-audit") showPage("page-security-audit");
      else if (view === "saved-profiles") showPage("page-profiles-list");
      else if (view === "mac-addresses") showPage("page-mac-addresses");
      else if (view === "saved-devices") showPage("page-saved-devices");
      else if (view === "user-command") showPage("page-user-command");
    });
  });

  // MAC scan button
  document.getElementById("btnMacScan")?.addEventListener("click", () => {
    const target = (document.getElementById("macTarget") as HTMLInputElement).value;
    runMACScan(target);
  });

  // Ping button
  document.getElementById("pingGoBtn")?.addEventListener("click", () => {
    const ip = (document.getElementById("pingAddress") as HTMLInputElement).value;
    runPing(ip);
  });
}

window.addEventListener("DOMContentLoaded", init);
