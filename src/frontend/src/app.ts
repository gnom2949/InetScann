// app.ts — логика UI и рендеринга
import { api, TypeLog } from "./api";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

export type PageID =
  | "dashboard"
  | "scan-page"
  | "scan-error"
  | "audit-page"
  | "audit-result"
  | "mac-page"
  | "profile-page"
  | "profile-create"
  | "profile-view"
  | "saved-devices"
  | "user-command";

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

export function initTerminal() {
  document.fonts.ready.then(() => {
    const box = document.getElementById("consoleBox");
    if (box) {
      term.open(box);
      fit.fit();
    }
  });

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
export function renderDeviceList(containerId: string, devices: any[]) {
  const box = document.getElementById(containerId);
  if (!box) return;

  box.innerHTML = "";

  devices.forEach((dev) => {
    const el = document.createElement("div");
    el.className = "device-item";

    el.innerHTML = `
      <div class="device-icon"><img src="${dev.icon}"></div>
      <div class="device-info">
        <div class="device-name">${dev.name}</div>
        <div class="device-sub">${dev.sub || ""}</div>
      </div>
      <div class="device-status ${dev.status}"></div>
    `;

    if (dev.onClick) el.addEventListener("click", dev.onClick);

    box.appendChild(el);
  });
}

export function renderProfileList(profiles: any[]) {
  const box = document.getElementById("profile-list");
  if (!box) return;

  box.innerHTML = "";

  profiles.forEach((p) => {
    const row = document.createElement("div");
    row.className = "profile-row";

    row.innerHTML = `
      <div class="profile-name">${p.name}</div>
      <div class="profile-status ${p.active ? "green" : "red"}">
        ${p.active ? "Active" : "Inactive"}
      </div>
      <button class="button small" data-id="${p.id}">View</button>
    `;

    row.querySelector("button")?.addEventListener("click", () => {
      showPage("profile-view");
      loadProfile(p.id);
    });

    box.appendChild(row);
  });
}

export function renderProfileInfo(data: any) {
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
  `;
}

// -----------------------------
// PAGE LOGIC
// -----------------------------

// PING
export async function Pingify() {
  const ip = (document.getElementById("ping-ip") as HTMLInputElement)?.value;
  const out = document.getElementById("ping-output");
  if (!ip || !out) return;

  out.textContent = `Pinging ${ip}...`;

  const res = await api("ping", { ip });

  out.textContent = res.error
    ? `Error: ${res.error}`
    : JSON.stringify(res, null, 2);
}

// MAC SCAN
export async function macify() {
  const out = document.getElementById("mac-output");
  if (!out) return;

  out.textContent = "Scanning MAC addresses...";

  const res = await api("mac");

  out.textContent = res.error
    ? `Error: ${res.error}`
    : JSON.stringify(res, null, 2);
}

// NETWORK SCAN
export async function Scanify() {
  const out = document.getElementById("scan-output");
  if (!out) return;

  out.textContent = "Scanning network...";

  const res = await api("scan");

  out.textContent = res.error
    ? `Error: ${res.error}`
    : JSON.stringify(res, null, 2);
}

// LOAD PROFILE
export async function loadProfile(id: string) {
  const res = await api("profile", { id });

  if (res.error) return;

  renderProfileInfo(res.info);
  renderDeviceList("profile-device-manage", res.devices);
}

// -----------------------------
// PROFILE ACTIONS
// -----------------------------
export async function profileAdd() {
  await TypeLog("info", "Profile Add");
  alert("Add device (TS will implement logic)");
}

export async function profileRemove() {
  await TypeLog("info", "Profile Remove");
  alert("Remove device");
}

export async function profileAbout() {
  await TypeLog("info", "Profile About");
  alert("About profile");
}

export async function profileRename() {
  await TypeLog("info", "Profile Rename");
  alert("Rename profile");
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
// HOTKEYS
// -----------------------------
export function initHotkeys() {
  document.addEventListener("keydown", (ev) => {
    if (ev.ctrlKey && ev.key === "a") profileAdd();
    if (ev.ctrlKey && ev.key === "b") profileAbout();
    if (ev.ctrlKey && ev.key === "r") profileRemove();
    if (ev.ctrlKey && ev.key === "n") profileRename();
  });
}
