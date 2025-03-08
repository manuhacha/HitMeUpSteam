const express = require('express');
const mongoose = require('mongoose');
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
const port = process.env.APIPORT 
app.listen(port, ()=> console.log('Listening on port: ' + port));

//Nos conectamos a la base de datos
mongoose.connect('mongodb://localhost/HitMeUpSteam', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'),)
    .catch(error => console.log(error));