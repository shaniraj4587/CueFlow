const { app, BrowserWindow, ipcMain, dialog, powerSaveBlocker } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let overlayWindow = null;
let powerSaveId = null;
let currentOverlayConfig = null;

function getScriptsFilePath() {
  try {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'cueflow_scripts.json');
  } catch {
    return null;
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0F172A',
    icon: path.join(__dirname, '../src/assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableWebSQL: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer Console Level ${level}]: ${message} (${sourceId}:${line})`);
  });

  const indexPath = path.join(__dirname, '../dist/renderer/index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
    }
  });
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC: Scripts Storage Persistence to Disk
ipcMain.handle('app:saveStoredScripts', async (_event, jsonString) => {
  try {
    const file = getScriptsFilePath();
    if (file) {
      await fs.promises.writeFile(file, jsonString, 'utf8');
      return true;
    }
  } catch (err) {
    console.warn('[desktop/main] Failed to save cueflow_scripts.json:', err);
  }
  return false;
});

ipcMain.handle('app:loadStoredScripts', async () => {
  try {
    const file = getScriptsFilePath();
    if (file && fs.existsSync(file)) {
      return await fs.promises.readFile(file, 'utf8');
    }
  } catch (err) {
    console.warn('[desktop/main] Failed to load cueflow_scripts.json:', err);
  }
  return null;
});

// IPC: Keep awake
ipcMain.handle('app:keepAwake', (_event, activate) => {
  if (activate) {
    if (powerSaveId === null || !powerSaveBlocker.isStarted(powerSaveId)) {
      powerSaveId = powerSaveBlocker.start('prevent-display-sleep');
    }
    return true;
  } else {
    if (powerSaveId !== null && powerSaveBlocker.isStarted(powerSaveId)) {
      powerSaveBlocker.stop(powerSaveId);
      powerSaveId = null;
    }
    return false;
  }
});

// IPC: Import text document
ipcMain.handle('app:importTextDocument', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Script',
    filters: [
      { name: 'Text & Markdown Files', extensions: ['txt', 'md', 'text'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const fileName = path.basename(filePath);
  const content = await fs.promises.readFile(filePath, 'utf8');
  return { fileName, content };
});

// IPC: Export text file
ipcMain.handle('app:exportTextFile', async (_event, { title, content }) => {
  if (!mainWindow) return false;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Script',
    defaultPath: `${title || 'script'}.txt`,
    filters: [
      { name: 'Text File', extensions: ['txt'] },
      { name: 'Markdown File', extensions: ['md'] },
    ],
  });

  if (result.canceled || !result.filePath) {
    return false;
  }

  await fs.promises.writeFile(result.filePath, content, 'utf8');
  return true;
});

// IPC: Floating Overlay Window
ipcMain.handle('overlay:launch', (_event, config) => {
  currentOverlayConfig = config || {};

  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('init-overlay', currentOverlayConfig);
    overlayWindow.webContents.executeJavaScript(`
      if (window.initOverlay) {
        window.initOverlay(${JSON.stringify(currentOverlayConfig)});
      }
    `).catch(() => {});
    overlayWindow.show();
    overlayWindow.focus();
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    return true;
  }

  const width = Math.min(800, Math.max(340, config.width || 460));
  const height = Math.min(700, Math.max(220, config.height || 380));

  overlayWindow = new BrowserWindow({
    width,
    height,
    minWidth: 280,
    minHeight: 180,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    hasShadow: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
    },
    skipTaskbar: false,
  });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  try {
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } catch {}

  overlayWindow.loadFile(path.join(__dirname, 'floating.html'));

  overlayWindow.webContents.on('did-finish-load', () => {
    overlayWindow.webContents.send('init-overlay', currentOverlayConfig);
    overlayWindow.webContents.executeJavaScript(`
      if (window.initOverlay) {
        window.initOverlay(${JSON.stringify(currentOverlayConfig)});
      }
    `).catch(() => {});
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('overlay:closed');
    }
  });

  overlayWindow.show();
  overlayWindow.focus();
  return true;
});

ipcMain.handle('overlay:getConfig', () => {
  return currentOverlayConfig;
});

ipcMain.handle('overlay:close', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
    return true;
  }
  return false;
});

ipcMain.handle('overlay:isRunning', () => {
  return !!overlayWindow && !overlayWindow.isDestroyed();
});

// Communication from floating overlay back to main app
ipcMain.on('close-overlay-window', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
  }
});

ipcMain.on('overlay-scrolled', (_event, data) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('overlay:scrollUpdate', data);
  }
});
