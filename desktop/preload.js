const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('wheel', (event) => {
    if (event.ctrlKey) {
        // Prevent default browser zoom to handle it manually through Electron API
        event.preventDefault();
        const delta = event.deltaY;
        if (delta < 0) {
            ipcRenderer.send('zoom-in');
        } else {
            ipcRenderer.send('zoom-out');
        }
    }
}, { passive: false });

// You can add more bridge functions here if needed
contextBridge.exposeInMainWorld('electronAPI', {
    // any needed bridge functions
});
