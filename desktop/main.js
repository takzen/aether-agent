const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        title: 'Aether Core',
        autoHideMenuBar: true,
        backgroundColor: '#020202',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    const url = 'http://localhost:3000';
    console.log(`[Aether Desktop] Łączenie z jądrem na ${url}...`);

    const tryLoad = () => {
        mainWindow.loadURL(url).catch((err) => {
            console.log('[Aether Desktop] Frontend jeszcze nie wstał. Ponawiam za 2 sekundy...');
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
