const express = require('express');
const cors = require('cors');
const app = express();
const game = require('../Back/routes/game');
require('dotenv').config();

//Usamos json y cors
app.use(cors());
app.use(express.json());


//Definimos las rutas de la API
app.use('/api/v1/game',game);

//Ponemos nuestro puerto
const port = 3000
try {
    app.listen(port, ()=> console.log('Listening on port: ' + port));
} catch(error) {
    console.log(error)
}