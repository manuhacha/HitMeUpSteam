const {app,BrowserWindow,Tray,Menu,ipcMain,Notification,} = require("electron");
const path = require("path");
const AutoLaunch = require("auto-launch");
const fs = require("fs");
const autoLaunchStateFile = path.join(app.getPath("userData"), "auto-launch-state.json");
const enabledNotifications = path.join(app.getPath("userData"), "enable-notifications.json");
const express = require('express');
const cors = require('cors');
const back = express();
const sqlite3 = require('sqlite3')
const axios = require('axios');

let mainWindow;
let tray;
let backendProcess;

//Declaramos nuestra base de datos 
const sqlitedb = new sqlite3.Database(path.join(app.getPath("userData"), 'db.sqlite'), (err) => {
  if (err) {
      console.log(err.message);
  } else {
      console.log('Successfully connected to SQLite');
  }
});
//Creamos la tabla games si no existe
sqlitedb.serialize(() => {
sqlitedb.run("CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, price TEXT, originalprice TEXT, picture TEXT, pricelimit TEXT)")
})

//Usamos json y cors
back.use(cors());
back.use(express.json());

//Endpoint get para buscar los juegos
back.get('/api/v1/game/steam/search', async (req,res) => {

  try {

      let gamename = req.query.gamename?.trim();

      //Error si no escribe nada
      if (!gamename) {
          return res.status(400).json({ error: 'You have to type a game name' });
      }

      //Reemplazamos los espacios por _
      gamename = gamename.replace(/ /g,'_');

      const response = await axios.get(`https://store.steampowered.com/api/storesearch/?term=${gamename}&cc=es&l=en&limit=10`);

      return res.status(200).json(response.data);

  } catch (e) {
      res.status(500).json({ e });
  }
});

//Endpoint para obtener la lista de juegos
back.get('/api/v1/game/', async(req,res) => {
      sqlitedb.all("SELECT * FROM games", (err, data) => {
          if (err) {
              res.status(400).json('Error getting game list');
          }
          if (data.length === 0) {
              res.status(400).json('You have no games in your list')
          }
          else {
              res.json(data)
          }
      })
})

//Endpoint para añadir un juego a la lista de juegos
back.post('/api/v1/game/', express.json(), (req,res) => {

  //Juego a añadir
  const { title, price, originalprice, picture,pricelimit } = req.body;
  const stmt = sqlitedb.prepare("INSERT INTO games (title, price, originalprice, picture, pricelimit) VALUES (?,?,?,?,?)");
  stmt.run(title,price,originalprice, picture,pricelimit, (err) => {
      if (err) {
          res.status(400).json('Error adding game')
      }
      else {
          res.status(200).json('Game added succesfully')
      }
  })
  stmt.finalize();
})

back.put('/api/v1/game/:id', (req,res) => {
  const { id } = req.params;
  const { price,originalprice } = req.body;

  //Validamos que los datos están presentes
  if (!price || !originalprice) {
      return res.status(400).json('Missing fields')
  }

  //Actualizamos el juego en la base de datos
  const stmt = sqlitedb.prepare("UPDATE games SET price = ? ,originalprice = ? WHERE id = ?");

  stmt.run(price, originalprice,id, (err) => {
      if (err) {
          return res.status(400).json('Error updating game')
      }
      res.status(200).json('Game updated succesfully')
  });

  stmt.finalize();
})

//Hacemos put para establecer precio máximo
back.put('/api/v1/game/setprice/:id', (req,res) => {

  const { id } = req.params;
  let {pricelimit} = req.body;
  if (pricelimit !== null) {
    pricelimit = pricelimit + '€'
  }
  else {
    pricelimit = null
  }
  
  //Actualizamos el juego
  const stmt = sqlitedb.prepare("UPDATE games SET pricelimit = ? WHERE id = ?");

  stmt.run(pricelimit,id, (err) => {
    if (err) {
      return res.status(400).json('Error updating game');
    }
    res.status(200).json('Game updated succesfully ' + pricelimit);
  })
})

back.delete('/api/v1/game/:id', (req,res) => {

  const { id } = req.params;

  //Borramos el juego
  const stmt = sqlitedb.prepare("DELETE FROM games WHERE id = ?")

  stmt.run(id, (err) => {
      if (err) {
          return res.status(400).json('Error deleting game')
      }
      return res.status(200).json('Game updated succesfully')
  });

  stmt.finalize();

})

//Ponemos nuestro puerto
const port = 3000
try {
    back.listen(port, ()=> console.log('Listening on port: ' + port));
} catch(error) {
    console.log(error)
}


//Creamos instancia de Auto Launch
const autoLauncher = new AutoLaunch({
  name: "HitMeUpSteam",
  isHidden: true,
});

app.whenReady().then(() => {  
  //Creamos nuestra pantalla de carga
    splash = new BrowserWindow({
      width: 400,
      height: 450,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      show: false,
      icon: path.join(__dirname, "public", "logo.ico"),
    });

  splash.loadURL(path.join(__dirname, "views", "loading.html"));

  splash.once("ready-to-show", () => splash.show());

  //Simulamos carga
  setTimeout(() => {
    // Crear la ventana de Electron, pero no la mostramos aún
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.join(__dirname, "public", "logo.ico"),
      webPreferences: {
        nodeIntegration: false, // Seguridad: evita que Angular acceda a Node.js directamente
        contextIsolation: true, // Aislamiento del contexto de ejecución
        preload: path.join(__dirname, "preload.js"),
      },
      show: false,
    });

    // Cargar la aplicación Angular
    mainWindow.loadURL(
      path.join(__dirname, "dist/hit-me-up-steam/browser/index.html")
    );

    // mainWindow.webContents.openDevTools();

    mainWindow.once("ready-to-show", () => {
      splash.destroy();
      mainWindow.show();
    });

    // Ocultar el menú
    mainWindow.setMenu(null);
    // Maximizar la ventana
    mainWindow.maximize();

    // Ocultamos app en la bandeja cuando se cierra
    mainWindow.on("close", (event) => {
      if (!app.isQuiting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });

    // Crear el icono en la bandeja solo después de que `app.whenReady()` haya terminado
    const iconPath = path.join(__dirname, "public", "logo.ico");
    tray = new Tray(iconPath);

    // Crear el menú contextual para la bandeja
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Restore",
        click: () => {
          mainWindow.show();
        },
      },
      {
        label: "Quit",
        click: () => {
          app.isQuiting = true;
          app.quit();
        },
      },
    ]);

    // Agregar el menú contextual y el tooltip al icono de la bandeja
    tray.setToolTip("HitMeUpSteam");
    tray.setContextMenu(contextMenu);

    //Activar o desactivar inicio automático
    ipcMain.handle("set-auto-launch", (event, enable) => {
      fs.writeFileSync(
        autoLaunchStateFile,
        JSON.stringify({ autoLaunch: enable }),
        "utf-8"
      );

      if (enable) {
        autoLauncher.enable();
      } else {
        autoLauncher.disable();
      }
    });

    // Recupera el estado del archivo JSON
    ipcMain.handle("get-auto-launch", () => {
      if (fs.existsSync(autoLaunchStateFile)) {
        const state = fs.readFileSync(autoLaunchStateFile, "utf-8");
        return JSON.parse(state).autoLaunch;
      }
      return false; // Retorna false si no se ha configurado previamente
    });

    ipcMain.handle("set-enabled-notifications", (event, enable) => {
      fs.writeFileSync(
        enabledNotifications,
        JSON.stringify({ notifications: enable })
      );
    });

    ipcMain.handle("get-notifications", () => {
      if (fs.existsSync(enabledNotifications)) {
        const state = fs.readFileSync(enabledNotifications, "utf-8");
        return JSON.parse(state).notifications;
      }
      return true;
    });

    // Comunicación para las notificaciones
    ipcMain.handle("show-notification", (event, title, message, picture) => {
      const notification = new Notification({
        title: title,
        body: message
      });
      if (checkNotificationStatus()) {
        notification.show();
      }
    });
  }, 1500);

  //Definimos un AppUserModelId para las notificaciones
  app.setAppUserModelId("HitMeUpSteam");

  function checkNotificationStatus() {
    if (fs.existsSync(enabledNotifications)) {
      const state = fs.readFileSync(enabledNotifications, "utf-8");
      return JSON.parse(state).notifications;
    }
    return true;
  }
});

// Asegurarse de que la aplicación se cierre correctamente en plataformas no Mac
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (backendProcess) {
      backendProcess.kill()
    }
    app.quit();
  }
});