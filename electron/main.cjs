const { app, BrowserWindow, desktopCapturer, session, shell } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

// The desktop app is a thin, locked down shell around the deployed web app.
// Secrets and the LiveKit signing stay on the server, so nothing sensitive
// ships inside the installer.
const APP_URL = process.env.KALI_DESKTOP_URL || "https://kali-one-snowy.vercel.app";
const APP_ORIGIN = new URL(APP_URL).origin;
const DESKTOP_URL = new URL("/desktop", APP_URL).toString();
const OFFLINE_PAGE = path.join(__dirname, "offline.html");
const SPLASH_PAGE = path.join(__dirname, "splash.html");
const MIN_SPLASH_MS = Number(process.env.KALI_SPLASH_MS) || 900;
const LOAD_FALLBACK_MS = 15_000;

let mainWindow = null;
let splashWindow = null;
let splashStartedAt = 0;
let loadFallbackTimer = null;
let mainRevealScheduled = false;

function isTrusted(url) {
  try {
    return new URL(url).origin === APP_ORIGIN;
  } catch {
    return false;
  }
}

function originOf(url) {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

function openOutside(url) {
  if (/^https?:\/\//i.test(url)) shell.openExternal(url);
}

function normalizeAppUrl(url) {
  try {
    const target = new URL(url);
    if (target.origin !== APP_ORIGIN) return url;
    if (target.pathname === "/" || target.pathname === "") {
      target.pathname = "/desktop";
    }
    return target.toString();
  } catch {
    return url;
  }
}

function clearLoadFallback() {
  if (!loadFallbackTimer) return;
  clearTimeout(loadFallbackTimer);
  loadFallbackTimer = null;
}

function closeSplash() {
  if (!splashWindow) return;
  splashWindow.close();
  splashWindow = null;
}

function offlineUrl() {
  const url = new URL(pathToFileURL(OFFLINE_PAGE).toString());
  url.searchParams.set("url", DESKTOP_URL);
  return url.toString();
}

function loadOffline() {
  mainWindow?.loadURL(offlineUrl());
}

function createSplashWindow() {
  splashStartedAt = Date.now();
  splashWindow = new BrowserWindow({
    width: 420,
    height: 280,
    frame: false,
    resizable: false,
    movable: true,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#f4f1ed",
    title: "Kali",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  splashWindow.center();
  splashWindow.once("ready-to-show", () => splashWindow?.show());
  splashWindow.on("closed", () => {
    splashWindow = null;
  });
  splashWindow.loadURL(pathToFileURL(SPLASH_PAGE).toString());
}

function revealMainWindow(immediate = false) {
  if (mainRevealScheduled) return;
  mainRevealScheduled = true;

  const elapsed = Date.now() - splashStartedAt;
  const wait = immediate ? 0 : Math.max(0, MIN_SPLASH_MS - elapsed);

  setTimeout(() => {
    closeSplash();
    mainWindow?.show();
  }, wait);
}

function showOffline() {
  clearLoadFallback();
  mainRevealScheduled = true;
  closeSplash();
  loadOffline();
  mainWindow?.show();
}

const ALLOWED_PERMISSIONS = new Set([
  "media",
  "display-capture",
  "fullscreen",
  "clipboard-sanitized-write",
]);

function createWindow() {
  mainRevealScheduled = false;
  createSplashWindow();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: "#f4f1ed",
    title: "Kali",
    icon: path.join(__dirname, "icon.png"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      // Keep audio and video flowing while the window is minimised.
      backgroundThrottling: false,
    },
  });

  mainWindow.once("ready-to-show", () => revealMainWindow());
  mainWindow.webContents.on("did-finish-load", () => {
    clearLoadFallback();
    revealMainWindow();
  });
  mainWindow.loadURL(DESKTOP_URL);

  // If the remote page never settles, show the friendly offline screen rather
  // than leaving the splash up forever.
  loadFallbackTimer = setTimeout(() => {
    if (!mainWindow) return;
    if (mainWindow.webContents.isLoadingMainFrame()) {
      loadOffline();
    }
    mainRevealScheduled = true;
    closeSplash();
    mainWindow.show();
  }, LOAD_FALLBACK_MS);

  // Links to other sites belong in the browser, not in the call window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrusted(url)) {
      mainWindow?.loadURL(normalizeAppUrl(url));
    } else {
      openOutside(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isTrusted(url)) {
      event.preventDefault();
      openOutside(url);
      return;
    }

    const target = normalizeAppUrl(url);
    if (target !== url) {
      event.preventDefault();
      mainWindow?.loadURL(target);
    }
  });

  // Show a friendly retry screen instead of Chromium's error page.
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, _description, _url, isMainFrame) => {
    if (!isMainFrame || errorCode === -3) return;
    showOffline();
  });

  mainWindow.on("closed", () => {
    clearLoadFallback();
    closeSplash();
    mainWindow = null;
  });
}

function configureSession() {
  const ses = session.defaultSession;

  ses.setPermissionRequestHandler((_contents, permission, callback, details) => {
    const origin = originOf(details?.requestingUrl ?? "");
    callback(origin === APP_ORIGIN && ALLOWED_PERMISSIONS.has(permission));
  });

  ses.setPermissionCheckHandler((_contents, permission, requestingOrigin) => {
    return requestingOrigin === APP_ORIGIN && ALLOWED_PERMISSIONS.has(permission);
  });

  // Screen sharing: hand Chromium the primary display. The OS picker is used
  // where Electron supports it, otherwise the main screen is shared.
  ses.setDisplayMediaRequestHandler(
    async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ["screen"],
          thumbnailSize: { width: 0, height: 0 },
        });
        if (sources.length > 0) callback({ video: sources[0] });
        else callback(null);
      } catch {
        callback(null);
      }
    },
    { useSystemPicker: true }
  );
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (splashWindow) {
      splashWindow.focus();
      return;
    }
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    app.setAppUserModelId("app.kali.desktop");
    configureSession();
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
