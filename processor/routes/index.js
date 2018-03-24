var express = require('express');
var sequelize = require('sequelize');
var natural = require('natural');
var sw = require('stopword');
var sentiment = require('sentiment');
var router = express.Router();

var tokenizer = new natural.WordTokenizer();

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

// Check the connection
connection.authenticate()
    .then(function () {
        console.log("The database is connected!");
    })
    .catch(function (err) {
        console.log(err);
    })
    .done();

// Create a connection to table called Word in RDS
var wordTable = connection.define('word', {
    words: {
        type: sequelize.STRING,
        charset: 'utf8mb4',
        primaryKey: true
    },
    frequencies: {
        type: sequelize.DataTypes.INTEGER
    }
});

// Create a connection to table called sentiment RDS
var sentimentTable = connection.define('sentiment', {
    sentiment: {
        type: sequelize.DataTypes.DECIMAL
    }
});

// Push each word and frequency into RDS
function pushWord(word){
    connection.sync().then(function() {
        wordTable.findOrCreate({where: {words: word}, defaults: {frequencies: 0}})
            .spread((word, created) => {
                wordTable.increment('frequencies', {where: {words: word.get({
                    plain: true
                }).words
                }});
            });
    });
};

// Push sentiment result of each tweet into RDS
function pushSentiment(tweet, sentiment){
    connection.sync().then(function() {
            sentimentTable.create({
                'sentiment': sentiment
            });
    });
}

// Regex for filtering tweet
var re = /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g;

// The main function that does the filtering process and store tweet into
function parse(tweet){
    var cleanTweet = tweet.replace(re, '').toLowerCase();
    var tokens = tokenizer.tokenize(tweet);
    var words = sw.removeStopwords(tokens);
    var feelings = analysis(cleanTweet);
    pushSentiment(cleanTweet, feelings);
    var longWords = words.filter(function(word){
        return (word.length > 3 && word.length < 7 && word != "http" && word != "https")
    });

    for (var i = 0; i < longWords.length; i++) {
        pushWord(longWords[i]);
    }
}

function analysis(text) {
    return sentiment(text).score;
}

// receive tweets when hitting the processor, filter them and store into RDS.
router.post('/tweet', function(req, res) {
    var receivedTweet = req.body.tweet;
    console.log(receivedTweet);
    parse(receivedTweet);
    res.end();
});

// Health check
router.get('/', function(req, res){
    res.writeHead(200, {
        'Content-Type': 'text-plain',
        'Content-Length': 2
    });
    res.write('OK');
    res.end();
});


module.exports = router;



