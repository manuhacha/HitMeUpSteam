const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    title: String,
    price: String,
    originalprice: String,
    desiredprice: String,
    picture: String
})

const Game = mongoose.model('games',GameSchema);

module.exports.Game = Game;
module.exports.GameSchema = GameSchema;