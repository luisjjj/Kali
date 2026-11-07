const { app, BrowserWindow, desktopCapturer, session, shell } = require("electron");
const path = require("node:path");

// The desktop app is a thin, locked down shell around the deployed web app.
// Secrets and the LiveKit signing stay on the server, so nothing sensitive
// ships inside the installer.
const APP_URL = process.env.KALI_DESKTOP_URL || "https://kali-one-snowy.vercel.app";
const APP_ORIGIN = new URL(APP_URL).origin;
const OFFLINE_PAGE = path.join(__dirname, "offline.html");

let mainWindow = null;

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

const ALLOWED_PERMISSIONS = new Set([
  "media",
  "display-capture",
  "fullscreen",
  "clipboard-sanitized-write",
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: "#ffa8cd",
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

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.loadURL(APP_URL);

  // Links to other sites belong in the browser, not in the call window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrusted(url)) return { action: "allow" };
    openOutside(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isTrusted(url)) return;
    event.preventDefault();
    openOutside(url);
  });

  // Show a friendly retry screen instead of Chromium's error page.
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, _description, _url, isMainFrame) => {
    if (!isMainFrame || errorCode === -3) return;
    mainWindow?.loadFile(OFFLINE_PAGE, { query: { url: APP_URL } });
  });

  mainWindow.on("closed", () => {
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
