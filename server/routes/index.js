var express = require('express');
var sequelize = require('sequelize');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  getSentiment().then(function(sentiment) {
      res.render('index', {title: 'Express', words: wordMap, sentiment: sentiment});
  });
});

module.exports = router;

// Configure RDS database
const databaseSchema = '';
const username = '';
const password = '';
const connection = new sequelize(databaseSchema, username, password, {
    host: 'twitter-db.coq2rdeakmlu.us-west-2.rds.amazonaws.com',
    port: 3306,
    dialect: 'mysql',
    dialectOptions: {
        charset: 'utf8mb4'
    },
    pool: {
        max: 20,
        min: 0,
        idle: 20000,
        acquire: 20000,
        handleDisconnects: true
    }
});

let wordMap = {};
let sentiment = '';

// Check the connection
connection.authenticate()
    .then(function () {
        console.log("The database is connected!");
    })
    .catch(function (err) {
        console.log("Opps, database connection error!");
    })
    .done();

// Create connection to Words table
var wordTable = connection.define('words', {
    words: {
        type: sequelize.STRING,
        charset: 'utf8mb4',
        primaryKey: true
    },
    frequencies: {
        type: sequelize.DataTypes.INTEGER
    }
});

// Create connection to Sentiment table
var sentimentTable = connection.define('sentiment', {
    sentiment: {
        type: sequelize.DataTypes.DECIMAL
    }
});

// Create the database above with value added using Promise
wordTable.all({order: [['frequencies', 'DESC']]}).then(words => {
    for (var i = 0; i < words.length; i++) {
        wordMap[words[i].dataValues.words] = words[i].dataValues.frequencies;
    }
});

function getSentiment() {
            return new Promise(function(resolve, reject){
                sentimentTable.all().then(sentiments => {
                    let sentimentValues = 0;
                    for (var i = 0; i < sentiments.length; i++) {
                        sentimentValues += parseInt(sentiments[i].dataValues.sentiment);
                    }
                    index = sentimentValues / sentiments.length;
                    if (index > 0) {
                        sentiment = 'Happy';
                    }
                    else if (index < 0) {
                        sentiment = 'Sad';
                    }
                    else {
                        sentiment = 'Neutral';
                    }
                    resolve(sentiment);
            });
    });
}