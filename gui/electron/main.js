import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'VulnForge Elite',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simplicity in this initial integration
    },
    // Adding autoHideMenuBar to make it look more like a native app without the default menu
    autoHideMenuBar: true,
  });

  if (isDev) {
    // In development mode, load the Vite dev server
    win.loadURL('http://localhost:5173');
    // Open DevTools automatically in dev
    win.webContents.openDevTools();
  } else {
    // In production, load the built static HTML file
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
