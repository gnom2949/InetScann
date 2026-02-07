import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

let term: Terminal;
let fitAddon: FitAddon;
let eventSrc: EventSource | null = null;

const API_BASEC = window.location.origin;

//api wrapper/ оболочка над api
async function api (action: string, params: Record<string, string> = {})  
{
  const query = new URLSearchParams ({ action, ...params });
  const url = `${API_BASEC}/api.php?${query.toString()}`;

  try {
    const res = await fetch(url);

    // если сервер вернул 404.html или другую ошибку
    const ct = res.headers.get ("Content-Type") || "";
    if (!ct.includes ("application/json")) {
      return { error: "Server returned a non-JSON response" };
    }

    return await res.json();
  } catch (error) {
    return { error: "Network error: please check connection"}
  }
}

/* PAGES\\Пагес */
function hideAllPages()
{
  document.querySelectorAll<HTMLElement> (".page").forEach (p => p.style.display = "none");
}

function showPage (id: string) 
{
  hideAllPages();
  const el = document.getElementById (id);
  if (el) el.style.display = "block";
}

/* Error Screens\\ ихраны ошыбочек но через TS для json */
function showErrScr(code: number, title: string, subtitle: string)
{
  hideAllPages();

  const t = document.getElementById ("errorTitle");
  const s = document.getElementById ("errorSubtitle");
  const c = document.getElementById ("errorCode");

  if (t) t.textContent = title;
  if (s) s.textContent = subtitle;
  if (c) c.textContent = String(code);

  const page = document.getElementById ("error-screen");
  if (page) page.style.display = "block";
}

/* Security Grade Parser \\ парсер секурити граде uicoG0 -> uicoG9 */
function parseSecGrade (code: string): number
{
  const m = code.match (/G(\d)/);
  if (!m) return 0;

  const raw = Number(m[1]);

  if (raw === 0) return 10;

  return 10 - raw;
}

function updSecGradeIco (grade: number)
{
  const el = document.getElementById ("auditGrade") as HTMLElement | null;
  if (!el) return;

  el.style.backgroundImage = `url("/src/frontend/public/icons/grade-num-${grade}.svg")`
  el.style.backgroundSize = "cover";
  el.style.backgroundPosition = "center";
  el.textContent = "";
}

/* Security Audit Page \\ секурити аудит паге */
async function runSecAud (ip: string) 
{
  const list = document.getElementById ("auditVulnList");
  const gradeEl = document.getElementById ("auditGrade");

  if (list) list.innerHTML = "<div class='audit-vuln-item'>Running audit...</div>";
  if (gradeEl) gradeEl.textContent = "?";

  const data = await api ("audit", { ip });

  if (data.error) {
    showErrScr (500, "Audit Error", data.error);
    return;
  }

  const grade = parseSecGrade (data.setSecGrade);
  updSecGradeIco (grade);

  if (list) {
    list.innerHTML = "";
    if (Array.isArray (data.vulns)) {
      data.vulns.forEach ((v: string) => {
        const item = document.createElement ("div");
        item.className = "audit-vuln-item";
        item.textContent = v;
        list.appendChild (item);
      });
    } else {
      list.innerHTML = "<div class='audit-vuln-item'>No Vulnerabilities Found</div>";
    }
  }
}

async function runPing (ip: string)
{
  const out = document.getElementById ("pingOutput");
  if (out) out.textContent = "Ping...";

  const data = await api ("ping", { ip });

  if (data.error) out!.textContent = data.error; return;

  out!.textContent = data.output || "No response!";
}

async function runScan (ip: string) 
{
  const out = document.getElementById ("scanOutput");
  if (out) out.textContent = "Scanning on ...";
  
  const data = await api ("scan", { ip });

  if (data.error) out!.textContent = data.error; return;

  out!.textContent = data.output || "No devices found";
}

async function runMacS (mac: string) 
{
  const out = document.getElementById ("macOutput");
  if (out) out.textContent = "Make queries to the Redis...";

  const data = await api ("mac", { mac });

  const icoPath = getIco (data.vendor, data.safery);
  macIco.src = icoPath;

  if (data.error) { 
    out!.textContent = data.error;
    return; 
  }

  out!.textContent = data.vendor || "Unknown vendor";
}

function getIco (vendor: string, safety: string): string
{
  let color = "YELLOW" // дефолтный цвет
  if (safety === "normal") color = "GREEN";
  else if (safety === "untrusted") color = "RED";
  else if (safery === "doubtful") color = "YELLOW";

  const v = vendor.toLowerCase();

  let vendorNm = "Unknown";

  if (v.includes ("cisco")) vendorNm = "Cisco";
  else if (v.includes ("apple")) vendorNm = "Apple";
  else if (v.includes ("google")) vendorNm = "Android";
  else if (
    v.includes ("tp-link") ||
    v.includes ("d-link") ||
    v.includes ("asus") ||
    v.includes ("msi") ||
    v.includes ("huawei") ||
    v.includes ("router")
  ) vendorNm = "Router";
  else if (v.includes ("microsoft")) vendorNm = "Microsoft";

  return `/src/frontend/public/icons/${vendorNm}${color}.svg`;
}

/* SSE Console \\ ССЕ консоль \\ SSE -> Server Sent Events */
function initConsole() 
{
  term = new Terminal ({
    cursorBlink: true,
    fontFamily: "CaskaydiaCoveNF, monospace",
    fontSize: 16,
    theme: {
      background: "#000000",
      foreground: "#deddda"
    }
  });

  fitAddon = new FitAddon();
  term.loadAddon (fitAddon);

  const box = document.getElementById ("consoleBox");
  if (box) {
    term.open (box);
    fitAddon.fit();
  }

  const input = document.getElementById ("consoleInput") as HTMLInputElement;
  const btn = document.getElementById ("consoleRun");

  if (btn) {
    btn.addEventListener ("click", () => {
      if (input) runConsoleCommand (input.value);
    });
  }

  if (input) {
    input.addEventListener ("keydown", (ev) => {
      if (ev.key === "Enter") {
        runConsoleCommand (input.value);
      } 
    });
  }
}

function runConsoleCommand (cmd: string)
{
  if (eventSrc) eventSrc.close();
  term.clear();

  eventSrc.onmessage = (ev) => {
    const data = JSON.parse (ev.data);
    term.write (data.output);
  };

  eventSrc.onerror = () => {
    term.write ("\r\n[Connection closed]\r\n");
    eventSrc?.close();
  };
}

function init()
{
  initConsole();

  document.querySelectorAll ("[data-back]").forEach (btn => {
    btn.addEventListener ("click", () => showPage("page-main"));
  });

  document.getElementById ("navScan")?.addEventListener("click", () => showPage ("page-scan-start"));
  document.getElementById ("navPing")?.addEventListener("click", () => showPage ("page-scan-start"));
  document.getElementById ("navMAC")?.addEventListener("click", () => showPage ("page-scan-start"));
  document.getElementById ("navAudit")?.addEventListener("click", () => showPage ("page-scan-start"));
  document.getElementById ("navDevices")?.addEventListener("click", () => showPage ("page-scan-start"));
  document.getElementById ("navProfiles")?.addEventListener("click", () => showPage ("page-scan-start"));
  document.getElementById ("navConsole")?.addEventListener("click", () => showPage ("page-scan-start"));
  document.getElementById ("navExport")?.addEventListener("click", () => showPage ("page-export"));
  document.getElementById ("navSettings")?.addEventListener("click", () => showPage ("page-settings"));
}