const { app, BrowserWindow } = require('electron');

if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {});
}

const path = require('path');
const {autoUpdater, AppUpdater} = require('electron-updater')
const log = require('electron-log')
log.transports.file.resolvePathFn =()=> path.join('C:/Users/Dennis/Desktop/Vacas RRHH', 'logs/main.log');
log.log("Version de la App "+ app.getVersion())
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'Logo-Recursos.ico'),
        autoHideMenuBar: true
    });
    autoUpdater.checkForUpdatesAndNotify();
    mainWindow.maximize(); 
    mainWindow.loadURL(`file://${__dirname}/Vistas/Autenticacion.html`);
});

autoUpdater.on("update-available",()=>{
    log.info("update available")
})

autoUpdater.on("checking-for-update",()=>{
    log.info("checking for update")
})
autoUpdater.on("download-progress",(progressTrack)=>{
    log.info("\n\ndownload-progress")
log.info(progressTrack)
})
autoUpdater.on("update-dowloaded",()=>{
    log.info("update-dowloaded")
})