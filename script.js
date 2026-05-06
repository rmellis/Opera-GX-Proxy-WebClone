(() => {
  "use strict";

  const PROXIES = [
    { url: "https://api.allorigins.win/get?url=", type: "json" },
    { url: "https://corsproxy.io/?", type: "raw" },
    { url: "https://api.codetabs.com/v1/proxy?quest=", type: "raw" }
  ];

  const $ = s => document.querySelector(s);
  const escape = s => (s||"").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* SPEED DIAL CONFIG (UPDATED) */
  const DEFAULTS = [
    { url: "https://en.uncyclopedia.co/", title: "Uncyclopedia", icon: "https://upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg" },
    
    { url: "https://www.bing.com/", title: "Bing", icon: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Bing_Fluent_Logo.svg" },
    
    { url: "https://www.amazon.com", title: "Amazon", icon: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" },

    { url: "https://kick.com/browse", title: "Kick", icon: "https://emoji.discadia.com/emojis/34d2e9b2-b9bd-4a49-95c0-0f22fb78fc36.PNG" },
    
    { url: "https://discord.com", title: "Discord", icon: "https://freelogopng.com/images/all_img/1691730813discord-icon-png.png" },
    
    { url: "https://www.reddit.com", title: "Reddit", icon: "https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png" },
    
    { url: "https://store.steampowered.com", title: "Steam", icon: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" },
    
    { url: "https://github.com", title: "GitHub", icon: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg", invert: true }
  ];

  let tabs = [];
  let activeTabId = null;
  let soundsEnabled = true;
  let forceDark = false;

  // AUDIO
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playTone(freq, type, duration) {
    if (!soundsEnabled || audioCtx.state === 'suspended') audioCtx.resume();
    if (!soundsEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }
  function soundHover() { playTone(800, 'sine', 0.1); }
  function soundClick() { playTone(1200, 'square', 0.15); }
  function soundType() { playTone(200 + Math.random()*50, 'triangle', 0.05); }

  document.body.addEventListener('mouseover', e => { if(e.target.closest('.sidebar-icon, .nav-btn, .tab, .dial-tile, .toggle-switch')) soundHover(); });
  document.body.addEventListener('click', e => { if(e.target.tagName !== 'INPUT') soundClick(); });
  $('#urlbar-input').addEventListener('input', soundType);

  // PROXY
  async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  }
  async function raceProxies(targetUrl) {
    const promises = PROXIES.map(async (proxy) => {
      try {
        const res = await fetchWithTimeout(proxy.url + encodeURIComponent(targetUrl));
        if (!res.ok) throw new Error("Status " + res.status);
        let text = proxy.type === "json" ? (await res.json()).contents : await res.text();
        if (!text || text.length < 50) throw new Error("Empty content");
        return text; 
      } catch (e) { throw e; }
    });
    return await Promise.any(promises);
  }

  function normalizeUrl(input) {
    let s = String(input || "").trim();
    if (!s) return "about:blank";
    if (s === "about:speeddial") return s;
    if (/^https?:\/\//i.test(s)) return s;
    if (s.includes(".") && !s.includes(" ")) return "https://" + s;
    return `https://www.google.com/search?q=${encodeURIComponent(s)}`;
  }

  function getFavicon(url) {
    if (!url || url.startsWith("about:")) return "";
    const fav = DEFAULTS.find(f => f.url === url);
    if (fav) return fav.icon;
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; } catch { return ""; }
  }

  async function navigate(tab, url) {
    tab.loading = true;
    tab.url = url;
    updateUI();
    const speedDial = $("#speed-dial-view");
    
    if (url === "about:speeddial") {
      speedDial.classList.remove("hidden");
      document.querySelectorAll('.web-frame').forEach(f => f.style.display = 'none');
      renderSpeedDial();
      tab.loading = false;
      updateUI();
      return;
    }

    speedDial.classList.add("hidden");
    let frame = $(`#frame-${tab.id}`);
    if(!frame) {
       frame = document.createElement("iframe");
       frame.className = "web-frame";
       frame.id = "frame-" + tab.id;
       if(forceDark) frame.classList.add('forced-dark');
       $("#web-content").appendChild(frame);
    }
    
    frame.style.display = "block";
    frame.style.background = "#fff";

    if (url.startsWith("data:")) { frame.src = url; tab.loading = false; updateUI(); return; }
    
    try {
       let content = await raceProxies(url);
       const base = new URL(url).origin;
       if (!content.toLowerCase().includes("<base")) content = `<base href="${url}">` + content;
       if (!content.includes("background-color")) content = `<style>body { background-color: white; }</style>` + content;
       frame.srcdoc = content;
       frame.sandbox = "allow-forms allow-scripts allow-popups allow-same-origin allow-modals";
       const m = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
       tab.title = m ? m[1].trim() : new URL(url).hostname;
    } catch (e) {
       frame.srcdoc = `<div style="color:black; padding:50px; text-align:center"><h1>GX ERROR</h1><p>${e.message}</p></div>`;
       tab.title = "Error";
    }
    tab.loading = false;
    updateUI();
  }

  function renderSpeedDial() {
    const view = $("#speed-dial-view");
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const html = DEFAULTS.map(f => `
      <div class="dial-tile" onclick="window.navigateExtern('${f.url}')">
        <img class="dial-icon" src="${f.icon}" style="${f.invert ? 'filter:invert(1)' : ''}">
        <div class="dial-title">${f.title}</div>
      </div>
    `).join('');
    view.innerHTML = `<div class="clock-widget">${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}</div>
      <div class="date-widget">${days[now.getDay()]}, ${now.getDate()}</div><div class="speed-dial-grid">${html}</div>`;
  }

  function createTab(url = "about:speeddial") {
    const id = "t-" + Math.random().toString(36).substr(2, 9);
    const tab = { id, url, title: "New Tab", loading: false, historyStack: [url], historyIdx: 0 };
    tabs.push(tab);
    activateTab(id);
  }
  // Expose to window for inline HTML onclick events
  window.createTab = createTab;

  function activateTab(id) {
    activeTabId = id;
    tabs.forEach(t => {
      const f = $(`#frame-${t.id}`);
      if (t.id === id) {
        t.url === "about:speeddial" ? ($("#speed-dial-view").classList.remove("hidden"), (f && (f.style.display = 'none')), renderSpeedDial()) : ($("#speed-dial-view").classList.add("hidden"), (f && (f.style.display = 'block')));
      } else if(f) f.style.display = 'none';
    });
    updateUI();
  }

  function closeTab(id) {
    if(tabs.length === 1) { navigate(tabs[0], "about:speeddial"); return; }
    const idx = tabs.findIndex(t => t.id === id);
    $(`#frame-${id}`)?.remove();
    tabs.splice(idx, 1);
    activateTab(tabs[Math.max(0, idx - 1)].id);
  }

  function updateUI() {
    const container = $("#tabs-container");
    container.innerHTML = "";
    tabs.forEach(t => {
      const div = document.createElement("div");
      div.className = `tab ${t.id === activeTabId ? 'active' : ''}`;
      div.innerHTML = `<span class="tab-title">${escape(t.title)}</span><button class="tab-close">×</button>`;
      div.onclick = (e) => { e.target.classList.contains('tab-close') ? (e.stopPropagation(), closeTab(t.id)) : activateTab(t.id); }
      container.appendChild(div);
    });
    const t = tabs.find(x => x.id === activeTabId);
    if(t) {
      $("#urlbar-input").value = t.url === "about:speeddial" ? "" : t.url;
      $("#back-btn").disabled = t.historyIdx <= 0;
      $("#forward-btn").disabled = t.historyIdx >= t.historyStack.length - 1;
    }
  }

  window.navigateExtern = (url) => {
    const t = tabs.find(x => x.id === activeTabId);
    const u = normalizeUrl(url);
    t.historyStack.push(u);
    t.historyIdx++;
    navigate(t, u);
  };

  $("#new-tab-btn").onclick = () => createTab();
  $("#urlbar-input").onkeydown = (e) => { if(e.key === "Enter") window.navigateExtern(e.target.value); };
  
  // LOGO MENU LOGIC
  $("#gx-logo").onclick = (e) => { e.stopPropagation(); $("#main-menu").classList.toggle("show"); };
  document.addEventListener("click", (e) => { if(!e.target.closest("#gx-logo") && !e.target.closest("#main-menu")) $("#main-menu").classList.remove("show"); });

  $("#gx-control-btn").onclick = () => $("#gx-control-panel").classList.toggle("open");
  $("#close-gx-control").onclick = () => $("#gx-control-panel").classList.remove("open");
  $("#settings-btn").onclick = () => $("#settings-popup").classList.toggle("show");
  
  window.setTheme = (theme, el) => {
    document.body.className = `theme-${theme}`;
    if(document.body.classList.contains('crt-active')) document.body.classList.add('crt-active');
    document.querySelectorAll('.theme-opt').forEach(x => x.classList.remove('active'));
    el.classList.add('active');
  };
  window.toggleCRT = () => { document.body.classList.toggle('crt-active'); $("#crt-toggle").classList.toggle('active'); };
  window.toggleForceDark = () => { forceDark = !forceDark; $("#dark-toggle").classList.toggle('active'); document.querySelectorAll('.web-frame').forEach(f => f.classList.toggle('forced-dark', forceDark)); };
  window.toggleSound = () => { soundsEnabled = !soundsEnabled; $("#sound-toggle").classList.toggle('active'); };
  
  $("#back-btn").onclick = () => { const t = tabs.find(x => x.id === activeTabId); if(t.historyIdx > 0) { t.historyIdx--; navigate(t, t.historyStack[t.historyIdx]); } };
  $("#reload-btn").onclick = () => { const t = tabs.find(x => x.id === activeTabId); navigate(t, t.url); };

  /* ANIMATE ALL DUMMY METERS (GX CONTROL FIX) */
  setInterval(() => {
      const meters = document.querySelectorAll(".dummy-fill");
      meters.forEach(m => {
          m.style.width = Math.floor(Math.random() * 60 + 10) + "%";
      });
  }, 2000);

  createTab();
})();
/* =========================================================================
   WebApp Protection
   ========================================================================= */
  if (window.top !== window.self) {
    if (document.referrer && document.referrer.includes("typespectrum.com")) {
      try {
        // Try to hijack the entire browser tab and redirect to your site
        window.top.location.href = "https://ywa.app";
      } catch (e) {
        // If the browser blocks the hijack, absolutely nuke the iframe content
        document.documentElement.innerHTML = `
          <head>
            <title>ERROR</title>
          </head>
          <body style="margin: 0; padding: 0; overflow: hidden;">
            <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #e50000; color: white; z-index: 2147483647; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; font-family: system-ui, -apple-system, sans-serif; padding: 20px; box-sizing: border-box;">
              <h1 style="font-size: clamp(24px, 5vw, 48px); margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px;">
                ⚠️ Error ⚠️
              </h1>
              <p style="font-size: clamp(16px, 3vw, 24px); margin: 0 0 10px 0; line-height: 1.5;">
                This WebApp can not be displayed here.
              </p>
              <p style="font-size: clamp(14px, 2.5vw, 20px); margin: 0; line-height: 1.5;">
                Possible Scam site detected</strong>.<br>
                For security, Please visit ywa.app to use it.
              </p>
            </div>
          </body>
        `;
      }
    }
  }