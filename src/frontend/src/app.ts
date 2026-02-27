// app.ts — логика UI и рендеринга
import { api, TypeLog } from "./api";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

export type PageID =
  | "dashboard"
  | "scan-page"
  | "audit-page"
  | "audit-result"
  | "mac-page"
  | "profile-page"
  | "profile-create"
  | "profile-view"
  | "saved-devices"
  | "user-command"
  | "ping-page";

/* Types */
export interface Device {
  id: string;
  name: string;
  ip: string;
  mac?: string;
  status: "online" | "offline" | "warning" | "unknown";
  icon: string;
  vendor?: string;
  os?: string;
  onClick?: () => void;
}

export interface Profile {
  id: string;
  name: string;
  active: boolean;
  db: string;
  table: string;
  devices: Device[];
  created: number;
}

export interface AuditResult {
  grade: number;
  device: Device;
  vulnerabilities: Vulnerability[];
}

export interface Vulnerability {
  id: string;
  name: string;
  risk: "high" | "medium" | "low";
  description: string;
  cve?: string;
}

export interface ScanResult {
  network: string;
  devices: Device[];
  timestamp: number;
}

export interface MACResult {
  address: string;
  device: string;
  vendor: string;
  vendorIcon?: string;
  status: "online" | "offline" | "warning" | "unknown";
}

type RawDevice = Partial<Device> & {
  id: string;
  name: string;
  ip: string;
};


function normalizeStatus(status?: string): Device["status"] {
  if (!status) return "unknown";
  const s = status.toLowerCase();
  if (s === "online" || s === "up") return "online";
  if (s === "offline" || s === "down") return "offline";
  if (s === "warning" || s === "unstable") return "warning";
  return "unknown";
}

function pickDeviceIcon(os?: string, vendor?: string): string {
  const v = (vendor || "").toLowerCase();
  const o = (os || "").toLowerCase();

  if (v.includes("apple") || v.includes("iphone") || v.includes("ipad")) {
    return "/frontend/public/icons/smartphone-symbolic.svg";
  }
  if (v.includes("android") || o.includes("android")) {
    return "/frontend/public/icons/smartphone2-symbolic.svg";
  }
  if (v.includes("microsoft") || o.includes("windows")) {
    return "/frontend/public/icons/computer-symbolic.svg";
  }
  if (v.includes("cisco") || v.includes("router")) {
    return "/frontend/public/icons/RouterGREEN.svg";
  }

  // Default device icon
  return "/frontend/public/icons/external-devices-symbolic.svg";
}

function pickVendorIcon(vendor?: string): string | undefined {
  if (!vendor) return undefined;
  const v = vendor.toLowerCase();

  if (v.includes("apple")) return "/frontend/public/icons/apple.svg";
  if (v.includes("google")) return "/frontend/public/icons/goa-account-google-symbolic.svg";
  if (v.includes("microsoft")) return "/frontend/public/icons/microsoft.svg";
  if (v.includes("cisco")) return "/frontend/public/icons/CiscoGREEN.svg";

  return "/frontend/public/icons/Group-Unknown-GREEN.svg";
}

function normalizeDevice(raw: RawDevice): Device {
  const status = normalizeStatus(raw.status);
  const icon = raw.icon || pickDeviceIcon(raw.os, raw.vendor);

  return {
    id: raw.id,
    name: raw.name,
    ip: raw.ip,
    mac: raw.mac,
    status,
    icon,
    vendor: raw.vendor,
    os: raw.os,
  };
}

function normalizeMACEntry(raw: any): MACResult {
  const status = normalizeStatus(raw.status);
  const vendor: string = raw.vendor || "Unknown";

  return {
    address: raw.address,
    device: raw.device || "Unknown Device",
    vendor,
    vendorIcon: pickVendorIcon(vendor),
    status,
  };
}

// -----------------------------
// TERMINAL
// -----------------------------
const term = new Terminal({
  theme: { background: "#241f31", foreground: "#2ec27e" },
  cursorBlink: true,
  fontFamily: "CaskaydiaCoveNF",
  fontSize: 14,
});

const fit = new FitAddon();
term.loadAddon(fit);

export async function initTerminal() {
  document.fonts.ready.then(() => {
    const box = document.getElementById("consoleCommandBox");
    if (box) {
      term.open(box);
      fit.fit();
    }
  });
  await TypeLog("info", "User open terminal");
  window.addEventListener("resize", () => fit.fit());
}

// -----------------------------
// PAGE SYSTEM
// -----------------------------
export function showPage(id: PageID) {
  document.querySelectorAll(".page").forEach((p) => {
    (p as HTMLElement).style.display = "none";
    p.classList.remove("active");
  });
  const el = document.getElementById(id);
  if (el) {
    el.style.display = "block";
    el.classList.add("active");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -----------------------------
// SETTINGS
// -----------------------------
export function openSettings() {
  document.getElementById("settings")?.classList.add("active");
}

export function closeSettings() {
  document.getElementById("settings")?.classList.remove("active");
}

// -----------------------------
// RENDER HELPERS
// -----------------------------
export function renderDeviceList(
  containerId: string,
  devices: Device[],
  clickable: boolean = true
) {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = "";

  if (devices.length === 0) {
    box.innerHTML = `<div class="empty-state">
      <div class="empty-state-text">No devices found</div>
    </div>`;
    return;
  }

  devices.forEach((dev) => {
    const el = document.createElement("div");
    el.className = "device-item";
    el.innerHTML = `
      <div class="device-status-indicator ${dev.status}"></div>
      <div class="device-icon">
        <img src="${dev.icon}" alt="">
      </div>
      <div class="device-info">
        <div class="device-name">${dev.name}</div>
        <div class="device-subtitle">${dev.ip}${dev.mac ? ` • ${dev.mac}` : ""}</div>
      </div>
      ${dev.vendor ? `<div class="device-vendor">${dev.vendor}</div>` : ""}
    `;

    if (clickable && dev.onClick) {
      el.addEventListener("click", dev.onClick);
    }

    box.appendChild(el);
  });
}

export function renderMACList(containerId: string, macs: MACResult[]) {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = "";

  if (macs.length === 0) {
    box.innerHTML = `<div class="empty-state">
      <div class="empty-state-text">No MAC addresses found</div>
    </div>`;
    return;
  }

  macs.forEach((mac) => {
    const el = document.createElement("div");
    el.className = "mac-item";
    el.innerHTML = `
      <div class="device-status-indicator ${mac.status}"></div>
      <div class="device-icon">
        <img src="/frontend/public/icons/device-symbolic.svg" alt="">
      </div>
      <div class="mac-address">${mac.address}</div>
      <div class="mac-separator">→</div>
      <div class="mac-device-name">${mac.device}</div>
      <div class="mac-separator">→</div>
      <div class="mac-vendor">
        ${mac.vendorIcon ? `<img src="${mac.vendorIcon}" alt="">` : ""}
        <span>${mac.vendor}</span>
      </div>
    `;
    box.appendChild(el);
  });
}

export function renderProfileList(profiles: Profile[]) {
  const box = document.getElementById("profile-list");
  if (!box) return;
  box.innerHTML = "";

  if (profiles.length === 0) {
    box.innerHTML = `<div class="empty-state">
      <div class="empty-state-text">No saved profiles</div>
    </div>`;
    return;
  }

  profiles.forEach((p) => {
    const row = document.createElement("div");
    row.className = "profile-item";
    row.innerHTML = `
      <div class="profile-icon">
        <img src="/frontend/public/icons/person-symbolic.svg" alt="">
      </div>
      <div class="profile-info">
        <div class="profile-name">${p.name}</div>
        <div class="profile-meta">
          <div class="profile-meta-item">
            <span class="profile-meta-label">PiD:</span>
            <span>${p.id}</span>
          </div>
          <div class="profile-meta-item">
            <span class="profile-meta-label">DB:</span>
            <span class="profile-status ${p.active ? "active" : "inactive"}">
              ${p.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
      <div class="profile-actions">
        <button class="profile-action-btn" data-id="${p.id}">View</button>
      </div>
    `;

    row.querySelector("button")?.addEventListener("click", () => {
      showPage("profile-view");
      loadProfile(p.id);
    });

    box.appendChild(row);
  });
}

export function renderProfileInfo(data: Profile) {
  const box = document.getElementById("profile-info");
  if (!box) return;
  box.innerHTML = `
    <div class="profile-block">
      <div class="profile-label">Name:</div>
      <div class="profile-value">${data.name}</div>
    </div>
    <div class="profile-block">
      <div class="profile-label">Database:</div>
      <div class="profile-value">${data.db}</div>
    </div>
    <div class="profile-block">
      <div class="profile-label">Status:</div>
      <div class="profile-value ${data.active ? "green" : "red"}">
        ${data.active ? "Active" : "Inactive"}
      </div>
    </div>
    <div class="profile-block">
      <div class="profile-label">DB Table:</div>
      <div class="profile-value">${data.table}</div>
    </div>
    <div class="profile-block">
      <div class="profile-label">Created:</div>
      <div class="profile-value">${new Date(data.created).toLocaleString()}</div>
    </div>
  `;
}

export function renderAuditResult(result: AuditResult) {
  const gradeEl = document.getElementById("audit-grade");
  const nameEl = document.getElementById("audit-name");
  const ipEl = document.getElementById("audit-ip");
  const vulnList = document.getElementById("audit-vuln-list");

  if (!gradeEl || !nameEl || !ipEl || !vulnList) return;

  gradeEl.textContent = String(result.grade);

  gradeEl.classList.remove("excellent", "good", "warning", "critical");
  if (result.grade >= 8) gradeEl.classList.add("excellent");
  else if (result.grade >= 6) gradeEl.classList.add("good");
  else if (result.grade >= 4) gradeEl.classList.add("warning");
  else gradeEl.classList.add("critical");

  nameEl.textContent = result.device.name;
  ipEl.textContent = result.device.ip;

  vulnList.innerHTML = "";
  if (!result.vulnerabilities.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state-text";
    empty.textContent = "No known vulnerabilities";
    vulnList.appendChild(empty);
    return;
  }

  result.vulnerabilities.forEach((v) => {
    const item = document.createElement("div");
    item.className = `vuln-item ${v.risk}`;
    item.innerHTML = `
      <div class="vuln-name">${v.name}</div>
      <div class="vuln-danger-level">
        Danger: ${v.risk.charAt(0).toUpperCase() + v.risk.slice(1)}
        ${v.cve ? ` • ${v.cve}` : ""}
      </div>
    `;
    vulnList.appendChild(item);
  });
}

// -----------------------------
// PAGE LOGIC
// -----------------------------

// NETWORK SCAN
export async function performNetworkScan() {
  try {
    const scanOutput = document.getElementById("scan-output");
    const deviceList = document.getElementById("scan-device-list");

    if (scanOutput) {
      scanOutput.textContent = "Scanning…";
    }
    if (deviceList) {
      deviceList.innerHTML = "";
    }

    await TypeLog("info", "Starting network scan...");

    const raw = await api<any>("scan");

    if (raw.error) {
      await TypeLog("error", "Scan failed", { error: raw.error });
      showPage("scan-error");
      return;
    }

    const devices: Device[] = (raw.devices || []).map((d: any) =>
      normalizeDevice(d),
    );

    if (devices.length > 0) {
      await TypeLog("info", `Scan completed. Found ${devices.length} devices`);
      if (scanOutput) {
        scanOutput.textContent = raw.network || "Scan completed";
      }
      renderDeviceList("scan-device-list", devices, false);
    } else {
      await TypeLog("warning", "No devices found");
      showPage("scan-error");
    }
  } catch (err) {
    await TypeLog("error", "Scan exception", { error: err });
    showPage("scan-error");
  }
}

// PING
export async function Pingify() {
  const ip = (document.getElementById("ping-ip") as HTMLInputElement)?.value;
  const out = document.getElementById("ping-output");
  if (!ip || !out) return;

  out.textContent = `Pinging ${ip}...`;
  const res = await api("ping", { ip });
  out.textContent = res.error ? `Error: ${res.error}` : JSON.stringify(res, null, 2);
}

// MAC SCAN
export async function performMACScan() {
  const list = document.getElementById("mac-list");
  if (!list) return;

  list.innerHTML = `<div class="scanning-state">
    <div class="scanning-title">Scanning MAC Addresses...</div>
    <div class="scanning-spinner"></div>
  </div>`;

  try {
    const res = await api<any[]>("mac");
    if (res.error) {
      list.innerHTML = `<div class="empty-state"><div class="empty-state-text">Error: ${res.error}</div></div>`;
      return;
    }
    const normalized = (Array.isArray(res) ? res : []).map((m) =>
      normalizeMACEntry(m),
    );
    renderMACList("mac-list", normalized);
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state-text">Scan failed</div></div>`;
  }
}

// SECURITY AUDIT
export async function performAudit(deviceId?: string) {
  try {
    const data = await api<AuditResult>("audit", deviceId ? { device_id: deviceId } : {});

    if (data.error) {
      await TypeLog("error", "Audit failed", { error: data.error });
      return;
    }

    renderAuditResult(data);
    showPage("audit-result");
  } catch (err) {
    await TypeLog("error", "Audit exception", { error: err });
  }
}

export async function showAuditDeviceChoice() {
  try {
    const data = await api<{ devices: any[] }>("device-inf");
    if (data.error) return;

    const container = document.getElementById("audit-device-list");
    if (!container) return;

    const devices: Device[] = (data.devices || []).map((d) =>
      normalizeDevice(d as RawDevice),
    );

    container.innerHTML = "";
    renderDeviceList("audit-device-list", devices, true);

    // Add click handlers
    container.querySelectorAll(".device-item").forEach((item, index) => {
      item.addEventListener("click", () => {
        performAudit(devices[index].id);
      });
    });
  } catch (err) {
    await TypeLog("error", "Failed to load devices for audit", { error: err });
  }
}

// PROFILE
export async function loadProfile(id: string) {
  const res = await api<Profile>("profile", { id });
  if (res.error) return;
  renderProfileInfo(res);
  renderDeviceList("profile-device-manage", res.devices, false);
}

export async function createProfile(name: string, deviceId: string) {
  try {
    const res = await api("profile_create", { name, device_id: deviceId });
    if (res.error) {
      alert(`Failed to create profile: ${res.error}`);
      return;
    }
    await TypeLog("info", "Profile created", { name });
    showPage("profile-page");
    loadProfiles();
  } catch (err) {
    await TypeLog("error", "Profile creation failed", { error: err });
  }
}

export async function loadProfiles() {
  try {
    const res = await api<Profile[]>("profiles");
    if (res.error) return;
    renderProfileList(res);
  } catch (err) {
    await TypeLog("error", "Failed to load profiles", { error: err });
  }
}

// SAVED DEVICES
export async function loadSavedDevices() {
  try {
    const res = await api<any[]>("device-inf");
    if (res.error) return;

    const container = document.getElementById("saved-devices-list");
    if (!container) return;

    const devices: Device[] = (Array.isArray(res) ? res : []).map((d) =>
      normalizeDevice(d as RawDevice),
    );
    renderDeviceList("saved-devices-list", devices, false);
  } catch (err) {
    await TypeLog("error", "Failed to load saved devices", { error: err });
  }
}

// -----------------------------
// PROFILE ACTIONS
// -----------------------------
export async function profileAdd() {
  await TypeLog("info", "Profile Add");
  showPage("profile-create");
}

export async function profileRemove(id: string) {
  await TypeLog("info", "Profile Remove", { id });
  const res = await api("profile_delete", { id });
  if (res.error) {
    alert(`Failed to remove: ${res.error}`);
    return;
  }
  loadProfiles();
}

export async function profileAbout(id: string) {
  await TypeLog("info", "Profile About", { id });
  loadProfile(id);
}

export async function profileRename(id: string, newName: string) {
  await TypeLog("info", "Profile Rename", { id, newName });
  const res = await api("profile_rename", { id, name: newName });
  if (res.error) {
    alert(`Failed to rename: ${res.error}`);
    return;
  }
  loadProfiles();
}

// -----------------------------
// CONSOLE HANDLERS
// -----------------------------
export function initConsoleHandlers() {
  const input = document.getElementById("consoleInput") as HTMLInputElement;
  const runBtn = document.getElementById("consoleRun");
  if (!input || !runBtn) return;

  runBtn.addEventListener("click", () => runConsole(input.value));
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") runConsole(input.value);
  });
}

async function runConsole(cmd: string) {
  if (!cmd) return;
  term.write(`\r\n$ ${cmd}\r\n`);
  const res = await api("console", { cmd });
  term.write((res.output || res.error || "No output") + "\r\n");
}

// -----------------------------
// EXPORT REPORT
// -----------------------------
export async function downloadExportReport() {
  try {
    const data = await api<any>("export");

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `inetscann-report-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    await TypeLog("info", "Report exported");
  } catch (err) {
    await TypeLog("error", "Export failed", { error: err });
  }
}

// -----------------------------
// HOTKEYS
// -----------------------------
export function initHotkeys() {
  document.addEventListener("keydown", (ev) => {
    if (ev.ctrlKey && ev.key === "a") profileAdd();
    if (ev.ctrlKey && ev.key === "b") profileAbout("current");
    if (ev.ctrlKey && ev.key === "r") profileRemove("current");
    if (ev.ctrlKey && ev.key === "n") {
      const name = prompt("New profile name:");
      if (name) profileRename("current", name);
    }
  });
}

// -----------------------------
// INITIALIZATION
// -----------------------------
export function initApp() {
  // Scan card (dashboard)
  const scanCard = document.querySelector('[data-page="scan-page"]');
  if (scanCard) {
    scanCard.addEventListener("click", () => {
      performNetworkScan();
    });
  }

  // MAC card (dashboard)
  const macCard = document.querySelector('[data-page="mac-page"]');
  if (macCard) {
    macCard.addEventListener("click", () => {
      performMACScan();
    });
  }

  // Audit page
  const auditBtn = document.querySelector('[data-page="audit-page"]');
  if (auditBtn) {
    auditBtn.addEventListener("click", () => {
      showPage("audit-page");
      showAuditDeviceChoice();
    });
  }

  // Profiles page
  const profilesBtn = document.querySelector('[data-page="profile-page"]');
  if (profilesBtn) {
    profilesBtn.addEventListener("click", () => {
      showPage("profile-page");
      loadProfiles();
    });
  }

  // Saved devices page
  const devicesBtn = document.querySelector('[data-page="saved-devices"]');
  if (devicesBtn) {
    devicesBtn.addEventListener("click", () => {
      showPage("saved-devices");
      loadSavedDevices();
    });
  }

  // Profile create form
  const profileCreateForm = document.getElementById("profile-create-form");
  if (profileCreateForm) {
    profileCreateForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = (document.getElementById("profile-name") as HTMLInputElement)?.value;
      const device = (document.getElementById("profile-device") as HTMLInputElement)?.value;
      if (name && device) {
        await createProfile(name, device);
      }
    });
  }

  // Profile action buttons
  document.getElementById("profile-add-btn")?.addEventListener("click", profileAdd);
  document.getElementById("profile-remove-btn")?.addEventListener("click", () =>
    profileRemove("current")
  );
  document.getElementById("profile-about-btn")?.addEventListener("click", () =>
    profileAbout("current")
  );
  document.getElementById("profile-rename-btn")?.addEventListener("click", () => {
    const name = prompt("New profile name:");
    if (name) profileRename("current", name);
  });

  // Ping page
  const pingGo = document.getElementById("ping-go");
  if (pingGo) {
    pingGo.addEventListener("click", () => {
      showPage("ping-page");
      Pingify();
    });
  }

  // Export report button (dashboard card)
  const exportBtn = document.getElementById("export-report-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      downloadExportReport();
    });
  }
}