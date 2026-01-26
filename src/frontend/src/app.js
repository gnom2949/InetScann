// src/app.js
// Лёгкий hash‑роутер и визуальные view. Позже заменим на TypeScript.
// Плейсхолдеры API: window.API.* (можно реализовать через InnBridge)

const root = document.getElementById('app-root');

function header() {
  const el = document.createElement('div');
  el.className = 'header';
  el.innerHTML = `
    <div class="title">
      <div class="logo">IS</div>
      <h1>InetScann</h1>
    </div>
    <div class="meta">Light frontend • TS later</div>
  `;
  return el;
}

function container() {
  const c = document.createElement('div');
  c.className = 'container';
  c.id = 'main-container';
  return c;
}

function navTo(hash) {
  location.hash = hash;
}

function renderHome() {
  const root = document.createElement('div');
  const grid = document.createElement('div');
  grid.className = 'grid-opts';
  const opts = [
    ['🔍','Scan Network','#scan'],
    ['📶','Ping Device','#ping'],
    ['🛡️','Security Audit','#audit'],
    ['📤','Export Report','#export'],
    ['💾','Saved Scan Profiles','#profiles'],
    ['🔗','View MAC Addresses','#mac'],
    ['📁','View Saved Devices','#devices'],
    ['⌨️','Enter User Command','#commands'],
  ];
  opts.forEach(o=>{
    const c = document.createElement('div');
    c.className = 'card';
    c.innerHTML = `<div class="icon">${o[0]}</div><div class="label">${o[1]}</div>`;
    c.onclick = ()=> navTo(o[2]);
    grid.appendChild(c);
  });
  root.appendChild(grid);

  const footer = document.createElement('div');
  footer.className = 'footer';
  footer.innerText = 'Project is under GNU GPL v3 LICENSE. Copyright © 2023 InetScann';
  root.appendChild(footer);
  return root;
}

/* Profiles view */
function renderProfiles() {
  const root = document.createElement('div');
  const back = document.createElement('div');
  back.className = 'back';
  back.innerText = '← Back';
  back.onclick = ()=> navTo('#home');
  root.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h2 class="h2">Saved Scan Profiles</h2>
    <div id="profiles-list" style="margin-top:12px"></div>
    <div style="margin-top:12px"><button id="create" class="btn small">Create New Profile</button></div>`;
  root.appendChild(panel);

  const list = panel.querySelector('#profiles-list');

  // MOCK data (visual). Replace with API call later.
  const profiles = [
    {id:'p1', name:"Dave's Profile", dbTable:'InetScann/Users/Daves_Profile', status:'active'},
    {id:'p2', name:"Jack's Profile", dbTable:'InetScann/Users/Jacks_Profile', status:'inactive'}
  ];
  profiles.forEach(p=>{
    const row = document.createElement('div');
    row.className = 'row';
    row.style.justifyContent = 'space-between';
    row.style.padding = '10px 0';
    row.innerHTML = `<div><strong>${p.name}</strong><div class="kv">${p.dbTable}</div></div>
      <div><button class="btn small" data-id="${p.id}">View</button></div>`;
    list.appendChild(row);
    row.querySelector('button').onclick = ()=> navTo(`#profile?id=${p.id}`);
  });

  panel.querySelector('#create').onclick = ()=>{
    const name = prompt('Profile name') || 'New Profile';
    alert('Создан профиль (плейсхолдер): ' + name);
    // TODO: call API.createProfile(name)
  };

  return root;
}

/* Profile detail (manage devices) */
function renderProfileDetail() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const id = params.get('id') || 'p1';
  const root = document.createElement('div');
  const back = document.createElement('div');
  back.className = 'back';
  back.innerText = '← Back';
  back.onclick = ()=> navTo('#profiles');
  root.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h2 class="h2">Profile Details</h2>
    <div style="margin-top:12px" class="card-grid-2">
      <div class="panel">
        <div class="h2">Dave's Profile</div>
        <div class="kv">Password: I**</div>
        <div class="kv">DataBase: MariaDB • Status: <span style="color:var(--success)">Active</span></div>
        <div class="kv">DB Table: InetScann/Users/Daves_Profile</div>
      </div>
      <div class="panel">
        <div class="h2">Manage devices</div>
        <div style="margin-top:8px">
          <div class="row" style="justify-content:space-between; padding:8px 0">
            <div><span class="status-dot status-off"></span>Dave's iPhone</div>
            <div><button class="btn small">About</button></div>
          </div>
          <div style="margin-top:8px;display:flex;gap:8px">
            <button class="btn small">Add</button>
            <button class="btn small btn.ghost">Remove</button>
            <button class="btn small btn.ghost">Rename</button>
          </div>
        </div>
      </div>
    </div>`;
  root.appendChild(panel);
  return root;
}

/* Scan view */
function renderScan() {
  const root = document.createElement('div');
  const back = document.createElement('div');
  back.className = 'back';
  back.innerText = '← Back';
  back.onclick = ()=> navTo('#home');
  root.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h2 class="h2">Network Scan</h2>
    <div style="margin-top:12px" class="row">
      <input id="target" class="input" placeholder="127.0.0.1/25 or 192.168.1.0/24" style="flex:1"/>
      <button id="go" class="btn small">Go!</button>
    </div>
    <div style="margin-top:12px" id="statusArea"></div>
    <div style="margin-top:12px" class="console" id="scanConsole">Ready.</div>`;
  root.appendChild(panel);

  const go = panel.querySelector('#go');
  const target = panel.querySelector('#target');
  const statusArea = panel.querySelector('#statusArea');
  const consoleEl = panel.querySelector('#scanConsole');

  go.onclick = ()=>{
    const t = target.value.trim();
    if(!t){ alert('Enter target'); return; }
    consoleEl.textContent = 'Starting scan (mock)...\nSimulating results...';
    statusArea.textContent = `Scanning on ${t}`;
    setTimeout(()=> {
      consoleEl.textContent += `\nNo devices found (mock).`;
      statusArea.textContent = `Done`;
    }, 1200);
    // TODO: replace with API.startScan / poll getScanStatus via InnBridge
  };

  return root;
}

/* Audit view */
function renderAudit() {
  const root = document.createElement('div');
  const back = document.createElement('div');
  back.className = 'back';
  back.innerText = '← Back';
  back.onclick = ()=> navTo('#home');
  root.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h2 class="h2">Security Audit</h2>
    <div style="margin-top:12px">
      <div class="kv">Choose Device</div>
      <div style="margin-top:8px">
        <div class="row" style="padding:8px 0"><div><span class="status-dot status-off"></span>Dave's iPhone</div><div style="margin-left:auto"><button class="btn small">Audit</button></div></div>
        <div class="row" style="padding:8px 0"><div><span class="status-dot status-online"></span>Alex's Pixel</div><div style="margin-left:auto"><button class="btn small">Audit</button></div></div>
      </div>
    </div>
    <div style="margin-top:12px" id="auditResult"></div>`;
  root.appendChild(panel);

  // mock audit result on click
  panel.querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>{
      const res = document.getElementById('auditResult');
      res.innerHTML = `<div class="panel" style="margin-top:12px">
        <div class="h2">Your Security Grade <span style="background:var(--danger);padding:6px 10px;border-radius:999px;margin-left:8px">2</span></div>
        <div style="margin-top:8px">Device: Google Pixel 7 pro<br>ipv4: 192.168.107.6</div>
        <div style="margin-top:8px"><strong>Potential vulnerabilities</strong><div class="kv">Linus Droidvalds exploit. Danger: Very High!</div></div>
      </div>`;
    };
  });

  return root;
}

/* MAC scan view */
function renderMac() {
  const root = document.createElement('div');
  const back = document.createElement('div');
  back.className = 'back';
  back.innerText = '← Back';
  back.onclick = ()=> navTo('#home');
  root.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h2 class="h2">MAC Addresses Scan</h2>
    <div style="margin-top:12px">
      <div class="panel">
        <div class="h2">Found MAC Addresses</div>
        <div style="margin-top:8px">
          <div class="row" style="padding:8px 0"><div><span class="status-dot status-online"></span>AA:BB:CC:31:59 — Alex's Pixel — Google, Inc.</div></div>
          <div class="row" style="padding:8px 0"><div><span class="status-dot status-off"></span>AA:BB:CC:57:97 — Dave's iPhone — Apple, Inc.</div></div>
        </div>
      </div>
    </div>`;
  root.appendChild(panel);
  return root;
}

/* Devices view */
function renderDevices() {
  const root = document.createElement('div');
  const back = document.createElement('div');
  back.className = 'back';
  back.innerText = '← Back';
  back.onclick = ()=> navTo('#home');
  root.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h2 class="h2">View Saved Devices</h2>
    <div style="margin-top:12px">
      <div class="row" style="padding:8px 0"><div><span class="status-dot status-online"></span>Alex's Pixel</div></div>
      <div class="row" style="padding:8px 0"><div><span class="status-dot status-off"></span>Dave's iPhone</div></div>
      <div class="row" style="padding:8px 0"><div><span class="status-dot status-warn"></span>Daniel's PC</div></div>
      <div class="row" style="padding:8px 0"><div><span class="status-dot status-warn"></span>Unknown Device</div></div>
    </div>`;
  root.appendChild(panel);
  return root;
}

/* Ping view */
function renderPing() {
  const root = document.createElement('div');
  const back = document.createElement('div');
  back.className = 'back';
  back.innerText = '← Back';
  back.onclick = ()=> navTo('#home');
  root.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h2 class="h2">Device Ping</h2>
    <div style="margin-top:12px" class="row">
      <input id="pingAddr" class="input" placeholder="Enter address or choose device" style="flex:1"/>
      <button id="pingGo" class="btn small">Go!</button>
    </div>
    <div style="margin-top:12px" class="console" id="pingConsole">Ready.</div>`;
  root.appendChild(panel);

  panel.querySelector('#pingGo').onclick = ()=>{
    const addr = panel.querySelector('#pingAddr').value.trim();
    if(!addr){ alert('Enter address'); return; }
    const c = panel.querySelector('#pingConsole');
    c.textContent = `PING ${addr} (93.184.216.34): 56 data bytes\n64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=12.3 ms\n--- ${addr} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
    // TODO: call API.pingAddress(addr)
  };

  return root;
}

/* Commands / Console view */
function renderCommands() {
  const root = document.createElement('div');
  const back = document.createElement('div');
  back.className = 'back';
  back.innerText = '← Back';
  back.onclick = ()=> navTo('#home');
  root.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h2 class="h2">User Commands</h2>
    <div style="margin-top:12px" class="row">
      <input id="cmdInput" class="input" placeholder="Enter Command (Network utils only!)" style="flex:1"/>
      <button id="cmdGo" class="btn small">Go!</button>
    </div>
    <div style="margin-top:12px" class="panel">
      <div class="kv">Fast commands</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px">
        <button class="btn small">traceroute</button>
        <button class="btn small">nslookup</button>
        <button class="btn small">arp -a</button>
        <button class="btn small">netstat</button>
      </div>
    </div>
    <div style="margin-top:12px" class="console" id="cmdConsole">Entry Terminal Mode</div>`;
  root.appendChild(panel);

  panel.querySelector('#cmdGo').onclick = ()=>{
    const cmd = panel.querySelector('#cmdInput').value.trim();
    if(!cmd){ alert('Enter command'); return; }
    const c = panel.querySelector('#cmdConsole');
    c.textContent = `jin> ${cmd}\nMock output:\nCommand executed (mock).`;
    // TODO: call API via InnBridge to execute allowed commands (careful with security)
  };

  return root;
}

/* Settings view */
function renderSettings() {
  const root = document.createElement('div');
  const back = document.createElement('div');
  back.className = 'back';
  back.innerText = '← Back';
  back.onclick = ()=> navTo('#home');
  root.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<h2 class="h2">InetScann Settings</h2>
    <div style="margin-top:12px" class="row">
      <div style="flex:1">Theme</div>
      <label style="display:flex;align-items:center;gap:8px"><input id="themeToggle" type="checkbox"/> Dark</label>
    </div>
    <div style="margin-top:12px" class="kv">GitHub: <a href="#" style="color:var(--gnome-blu1)">gnom2949/InetScann</a></div>`;
  root.appendChild(panel);

  const toggle = panel.querySelector('#themeToggle');
  toggle.onchange = (e)=>{
    // placeholder: toggle theme (not implemented)
    alert('Theme toggle (mock).');
  };

  return root;
}

/* Router */
const routes = {
  '#home': renderHome,
  '#profiles': renderProfiles,
  '#profile': renderProfileDetail,
  '#scan': renderScan,
  '#audit': renderAudit,
  '#mac': renderMac,
  '#devices': renderDevices,
  '#ping': renderPing,
  '#commands': renderCommands,
  '#settings': renderSettings,
  '#export': ()=> { alert('Export Report — placeholder'); return renderHome(); }
};

function navigate() {
  const hash = location.hash.split('?')[0] || '#home';
  const viewFn = routes[hash] || renderHome;
  const main = document.getElementById('main-container');
  main.innerHTML = '';
  main.appendChild(viewFn());
}

function init() {
  root.appendChild(header());
  root.appendChild(container());
  if(!location.hash) location.hash = '#home';
  navigate();
  window.addEventListener('hashchange', navigate);
}

init();

/* ===== Integration notes (placeholders) =====
- Implement window.API = { getDevices, getProfiles, startScan, getScanStatus, pingAddress, auditDevice, getMacScan, createProfile }
  Each function should return Promises and call InnBridge or direct PHP endpoints.
- Replace mock arrays in views with real API calls and render results.
- Security: commands execution must be validated server-side; do not send raw shell commands from client.
=========================================== */

