const express = require('express');
const router = express.Router();
const { Game } = require('../models/Game');
const axios = require('axios');
const { Mongoose, default: mongoose } = require('mongoose');

//Endpoint get para buscar los juegos
router.get('/steam/search', async (req,res) => {

    try {

        let gamename = req.query.gamename?.trim();

        //Error si no escribe nada
        if (!gamename) {
            return res.status(400).json({ error: 'You have to type a game name' });
        }

        else {
        //Reemplazamos los espacios por _
        gamename = gamename.replace(/ /g,'_');
        }

        const response = await axios.get(`https://store.steampowered.com/api/storesearch/?term=${gamename}&cc=es&l=en&limit=10`);

        res.status(200).json(response.data);

    } catch (e) {
        res.status(500).json({ error: 'Error obtaining steam data' });
    }
});

//Endpoint para guardar un juego en la base de datos
router.post('/', async (req,res) =>{

    let game = new Game({
        title: req.body.title,
        price: req.body.price,
        originalprice: req.body.originalprice,
        picture: req.body.picture
    });

    try {
        const result = await game.save();
        res.status(200).json('Added Succesfully')
    } catch (error) {
        res.status(400).send('Error adding game');
    }
})

//Endpoint para obtener los juegos guardados
router.get('/', async(req,res) => {

    try {
        let games = await Game.find();
        //Si encuentra juegos los envía
        if (games && games.length != 0) {
            res.status(200).send(games);
        }
        else {
            res.status(400).send('There are no games added');
        }
    } catch (error) {
        res.status(400).send('Internal Server Error');
    }

})

//Endpoint para borrar juegos
router.delete('/:id',async(req,res) =>{

    try {
        const  id  = new mongoose.Types.ObjectId(req.params)
        const deletedgame = await Game.findByIdAndDelete(id)    
        return res.status(200).json('Game deleted succesfully' + ' id:' + id)
    } catch(err) {
        return res.status(400).json('Error deleting game')
    }
})

module.exports = router;

