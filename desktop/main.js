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
            zoomFactor: 1.0,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Handle Manual Zoom Signals from Preload
    const { ipcMain } = require('electron');
    ipcMain.on('zoom-in', () => {
        let currentZoom = mainWindow.webContents.getZoomFactor();
        mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
    });
    ipcMain.on('zoom-out', () => {
        let currentZoom = mainWindow.webContents.getZoomFactor();
        mainWindow.webContents.setZoomFactor(Math.max(0.2, currentZoom - 0.1));
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

    // Enable Manual Zoom Controls (Keyboard)
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.control && input.type === 'keyDown') {
            if (input.code === 'Equal' || input.code === 'NumpadAdd') {
                let currentZoom = mainWindow.webContents.getZoomFactor();
                mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
                event.preventDefault();
            }
            if (input.code === 'Minus' || input.code === 'NumpadSubtract') {
                let currentZoom = mainWindow.webContents.getZoomFactor();
                mainWindow.webContents.setZoomFactor(Math.max(0.2, currentZoom - 0.1));
                event.preventDefault();
            }
            if (input.code === 'Digit0' || input.code === 'Numpad0') {
                mainWindow.webContents.setZoomFactor(1.0);
                event.preventDefault();
            }
        }
    });

    // Force external links to open in default browser
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
