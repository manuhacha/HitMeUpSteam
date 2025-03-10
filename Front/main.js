const { app, BrowserWindow, Tray, Menu, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;
let tray;

app.whenReady().then(() => {
  // Crear la ventana de Electron, pero no la mostramos aún
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'public', 'logo.png'),
    webPreferences: {
      nodeIntegration: false, // Seguridad: evita que Angular acceda a Node.js directamente
      contextIsolation: true, // Aislamiento del contexto de ejecución
      preload: path.join(__dirname,'preload.js')
    },
    show: false // No mostrar la ventana hasta que Angular se haya cargado
  });

  // Cargar la aplicación Angular
  mainWindow.loadURL(`file://${path.join(__dirname, 'dist/hit-me-up-steam/browser/index.html')}`);

  // Esperar a que el contenido se haya cargado antes de mostrar la ventana
  mainWindow.webContents.on('did-finish-load', () => {
    // Mostrar la ventana solo cuando Angular haya terminado de cargarse
    mainWindow.show()
  });

  // Ocultar el menú
  mainWindow.setMenu(null);
  // Maximizar la ventana
  mainWindow.maximize();

  // Ocultamos app en la bandeja cuando se cierra
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Crear el icono en la bandeja solo después de que `app.whenReady()` haya terminado
  const iconPath = path.join(__dirname, 'public', 'logo.png');
  tray = new Tray(iconPath);

  // Crear el menú contextual para la bandeja
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Restore',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  // Agregar el menú contextual y el tooltip al icono de la bandeja
  tray.setToolTip('HitMeUpSteam');
  tray.setContextMenu(contextMenu);
});

// Comunicación para las notificaciones
ipcMain.handle('show-notification', (event,title, message) => {
  const notification = new Notification({
    title: title,
    body: message
  });
  notification.show();
});

// Asegurarse de que la aplicación se cierre correctamente en plataformas no Mac
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


