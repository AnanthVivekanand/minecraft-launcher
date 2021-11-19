const { app, BrowserWindow } = require('electron');
const path = require('path');
var mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 500,
        webPreferences: {
            nodeIntegration: true
        },
        center: true,
        maximizable: false
    });

    mainWindow.loadFile('src/html/index.html');
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null
    });

    mainWindow.webContents.on('did-finish-load', () => mainWindow.show());
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});


app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
});

