# 🔴 Opera GX Web Clone

A vanilla HTML/CSS/JS web-based clone of the Opera GX browser. This project minics opera GX directly in your browser, complete with interactive sound effects, customizable themes, a functional tab system, and a proxy-based browsing engine to load external sites.
<img width="1046" height="589" alt="image" src="https://github.com/user-attachments/assets/20d8f68f-c54a-4a43-8c75-a84918400c5f" />


---

## ✨ Features

* **Fully Functional Tab System:** Open, switch, and close tabs. Each tab maintains its own independent history for back/forward navigation.
* **Built-in Web Proxy:** Bypasses CORS restrictions using a racing network of public proxies (`allorigins`, `corsproxy.io`, `codetabs`), allowing you to browse the web inside the built-in iframes.
* **Speed Dial:** A customizable home screen featuring a live digital clock, date, and quick-access tiles to your favorite sites.
* **Interactive Audio:** Synthesized UI sounds generated via the Web Audio API (sine, square, and triangle waves) for hovering, clicking, and typing.
* **"GX Mods" Settings:**
    * **Themes:** Swap accent colors on the fly (Red, Cyan, Purple, Green, Yellow, Orange).
    * **CRT Shader:** Toggle a retro, animated scanline overlay.
    * **Force Dark Page:** Inverts the colors of the loaded web pages to simulate a dark mode.
    * **UI Sounds:** Toggle the interface sound effects on or off.
* **GX Control Panel (Mockup):** A visual recreation of the CPU and RAM limiters with animated data meters.
* **Smart Omnibox:** Type a URL to navigate directly, or type a query to automatically search via Google.

---

## 🖥️ UI Breakdown

<img align="left" width="54" height="589" src="https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/0cqVMTQ.png" alt="Sidebar UI Screenshot">

### The Sidebar
The persistent left-hand sidebar houses quick-access tools and menus:
* **GX Logo:** Opens the main dropdown menu (New Tab, New Window, History, About).
* **GX Control:** Opens the slide-out panel for the (simulated) resource limiters.
* **Twitch/Music Icons:** Quick shortcut buttons to popular media hubs.
* **Settings (Gear):** Opens the popup menu to customize themes, CRT shaders, and audio.

### The Top Bar
* **Tab Strip:** Features Opera GX's signature angled tabs. Highlights the active tab with your chosen accent color.
* **Navigation:** Back, Forward, and Reload buttons linked dynamically to the current tab's history state.
* **Address Bar:** A stylized omnibox that accepts both standard URLs and search queries.

<img width="650" alt="Top Bar Screenshot" src="https://github.com/user-attachments/assets/aed07767-cc39-4221-b268-1d9035fb3163" />

### The Viewport
* **Speed Dial:** The default `about:speeddial` view.
* **Web Frame:** Dynamically generated `<iframe>` elements that inject HTML fetched via proxy, allowing standard web browsing while stripping out restrictive background colors.
<img width="512" alt="image" src="https://github.com/user-attachments/assets/803bbdad-7dab-4624-a430-3fd910c2b12c" />

<br clear="left"/>

## 🚀 Getting Started

Since this project uses entirely vanilla frontend technologies, no build tools or package managers are required!

1.  **Download the repository:**
2.  **Open the project:**
    Simply open the `index.html` file in any modern web browser.
    *Alternatively, you can host it using GitHub Pages, Vercel, or Netlify.*

---

## 🛠️ Configuration & Customization

### Adding Speed Dial Links
You can easily change the default Speed Dial shortcuts by editing the `DEFAULTS` array at the top of `script.js`:

```javascript
const DEFAULTS = [
  { url: "[https://your-site.com](https://your-site.com)", title: "Site Name", icon: "link-to-icon.png" },
  // Add invert: true if the icon needs to be inverted in dark mode (like GitHub)
];
```

### Proxy Limitations
Because this browser operates within a browser, it relies on public proxy APIs to fetch webpage contents and inject them into an iframe. 
* Heavy websites with complex dynamic JavaScript or strict security headers (like `X-Frame-Options`) might break or fail to load perfectly.
* The script races three proxies simultaneously and uses the first successful response to ensure the fastest load times possible.

---

## 📜 License

This project is licensed under the [GNU General Public License v2.0](LICENSE). 
*Note: This is a clone and is not affiliated with, Opera Norway AS.*
