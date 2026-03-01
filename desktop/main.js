const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        title: 'Aether Core',
        autoHideMenuBar: true,
        backgroundColor: '#020202',
        show: false, // Don't show until ready
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            zoomFactor: 1.0
        }
    });

    // Make it feel faster
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    const url = 'http://localhost:3000';
    console.log(`[Aether Desktop] Connecting to kernel at ${url}...`);

    const tryLoad = () => {
        mainWindow.loadURL(url).catch((err) => {
            console.log('[Aether Desktop] Frontend is not ready yet. Retrying in 2 seconds...');
            setTimeout(tryLoad, 2000);
        });
    };

    tryLoad();

    // Wymuś otwieranie linków zewnętrznych w domyślnej przeglądarce
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
