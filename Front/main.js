const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Seguridad: evita que Angular acceda a Node.js directamente
      contextIsolation: true // Aislamiento del contexto de ejecución
    }
  });

  //Ocultamos el menu
  mainWindow.setMenu(null);
  //Ponemos la ventana maximizada
  mainWindow.maximize();
  mainWindow.loadURL(`file://${path.join(__dirname, 'dist/hit-me-up-steam/browser/index.html')}`);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
