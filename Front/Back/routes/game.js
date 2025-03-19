const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const axios = require('axios');

//Declaramos nuestra base de datos 
const sqlitedb = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.log(err.message)
    }
    else {
        console.log('Succesfully connected to Sqlite')
    }
})
//Creamos la tabla games si no existe
sqlitedb.serialize(() => {
    sqlitedb.run("CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, price TEXT, originalprice TEXT, picture TEXT)")
})

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
        res.status(500).json({ e });
    }
});

//Endpoint para obtener la lista de juegos
router.get('/', async(req,res) => {
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
router.post('/', express.json(), (req,res) => {

    //Juego a añadir
    const { title, price, originalprice, picture } = req.body;
    const stmt = sqlitedb.prepare("INSERT INTO games (title, price, originalprice, picture) VALUES (?,?,?,?)");
    stmt.run(title,price,originalprice, picture, (err) => {
        if (err) {
            res.status(400).json('Error adding game')
        }
        else {
            res.status(200).json('Game added succesfully')
        }
    })
    stmt.finalize();
})

router.put('/:id', (req,res) => {
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

router.delete('/:id', (req,res) => {

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

module.exports = router;

