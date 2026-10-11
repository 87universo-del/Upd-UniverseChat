const { app, BrowserWindow, Menu, session, desktopCapturer, ipcMain } = require('electron');
const path = require('path');

let win = null;
let updater = null;

function enviar(d) {
  if (win && !win.isDestroyed()) win.webContents.send('upd', d);
}

function iniciarUpdater() {
  if (!app.isPackaged) return;
  try { updater = require('electron-updater').autoUpdater; } catch (e) { return; }
  updater.autoDownload = false;
  updater.on('update-available', i => enviar({ t: 'disponivel', v: i.version }));
  updater.on('download-progress', p => enviar({ t: 'progresso', p: Math.round(p.percent) }));
  updater.on('update-downloaded', () => enviar({ t: 'pronto' }));
  updater.on('error', () => enviar({ t: 'erro' }));
}

ipcMain.handle('upd:check', () => updater ? updater.checkForUpdates().then(() => null).catch(() => null) : null);
ipcMain.handle('upd:baixar', () => updater ? updater.downloadUpdate().then(() => null).catch(() => enviar({ t: 'erro' })) : null);
ipcMain.handle('upd:instalar', () => { if (updater) updater.quitAndInstall(true, true); });

function criarJanela() {
  // Compartilhar tela: usa a tela principal (a camera nunca e usada pelo app)
  session.defaultSession.setDisplayMediaRequestHandler((req, callback) => {
    desktopCapturer.getSources({ types: ['screen'] })
      .then(fontes => callback({ video: fontes[0] }))
      .catch(() => callback({}));
  });
  win = new BrowserWindow({
    width: 1100, height: 760, minWidth: 380, minHeight: 500,
    title: 'universeChat', backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      autoplayPolicy: 'no-user-gesture-required',
      preload: path.join(__dirname, 'preload.js')
    }
  });
  Menu.setApplicationMenu(null);
  win.loadFile('index.html');
  iniciarUpdater();
}

app.setAppUserModelId('com.universechat.app');
app.whenReady().then(criarJanela);
app.on('window-all-closed', () => app.quit());
