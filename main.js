const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "renderer.js"),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.setMenu(null);
    win.loadFile("index.html");
}

app.whenReady().then(createWindow);