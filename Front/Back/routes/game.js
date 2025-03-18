const express = require('express');
const router = express.Router();
const { Game } = require('../models/Game');
const axios = require('axios');
const DataStore = require('nedb');

//Declaramos nuestra base de datos local
const db = new DataStore({filename: 'database.db',autoload: true})

//Endpoint get para buscar los juegos
router.get('/steam/search', async (req,res) => {

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
        res.status(500).json({ error: 'Error obtaining steam data' });
    }
});

//Endpoint para guardar un juego en la base de datos
router.post('/', async (req,res) =>{
    //Juego a añadir
    const game = new Game(req.body.title,req.body.price,req.body.originalprice,req.body.picture)

    db.insert(game, (err,doc) => {
        if (err) {
           return res.status(400).json('Error adding game')
        }
          return res.status(200).json('Game added succesfully')
    })

})

//Endpoint para obtener los juegos guardados
router.get('/', async(req,res) => {

    try {
        db.find({},(err,games) => {
            if (err) {
              return  res.status(400).json('Error obtaining games')
            }
            if (games.length == 0) {
              return  res.status(400).json('You have no games in your list')
            }
              return res.json(games)
        })
    } catch (error) {
        return res.status(400).send('Internal Server Error');
    }

})

// //Endpoint para actualizar un juego de la lista
router.put('/:id', async(req,res) =>{
    
    const gameId = req.params.id
    const updatedGame = {
        price: req.body.price,
        originalprice: req.body.originalprice,
    }

    db.update({_id:gameId},{$set: updatedGame},{},(err,numReplaced) => {
        if (err) {
          return  res.status(400).json('Could not update games data')
        }
        if (numReplaced === 0) {
            return res.status(400).json('Game not found')
        }
        return res.status(200).json('Game updated succesfully')
    })

})


// //Endpoint para borrar juegos
router.delete('/:id',async(req,res) =>{

    const gameId = req.params.id;

    db.remove({_id:gameId},{},(err,numRemoved) => {
        if (err) {
            return res.status(400).json('Error removing game')
        }
        if (numRemoved === 0) {
            return res.status(400).json('Game not found')
        }
        return res.status(200).json('Game removed successfully')
    })

})

module.exports = router;

