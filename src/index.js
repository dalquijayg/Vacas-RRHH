const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

log.transports.file.resolvePathFn = () => path.join('C:/Users/Dennis/Desktop/Vacas RRHH', 'logs/main.log');
log.log("Version de la App " + app.getVersion());

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'Logo-Recursos.ico'),
        autoHideMenuBar: true
    });

    mainWindow.maximize();
    mainWindow.loadURL(`file://${__dirname}/Vistas/Autenticacion.html`);

    mainWindow.webContents.once('dom-ready', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
}

app.on('ready', createWindow);

autoUpdater.on('update-available', (info) => {
    log.info("update available");
    mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', (info) => {
    log.info("update-downloaded");
    mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});