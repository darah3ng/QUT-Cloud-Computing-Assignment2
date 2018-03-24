var Twitter = require('twitter');
var request = require('request');
var config = require('./config.js');
var client = new Twitter({
    consumer_key: config.twitter_consumer_key,
    consumer_secret: config.twitter_consumer_secret,
    access_token_key: config.twitter_access_token_key,
    access_token_secret: config.twitter_access_token_secret
});

var firehose = 'a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z';

// Stream every tweet
client.stream('statuses/filter', {track: firehose},  function(stream) {

    stream.on('data', function(tweet) {
        var cleanTweet = '';

        // If tweet exists, send to processing units
        if(tweet != undefined){
            console.log('tweet = ' + tweet.text);
            cleanTweet = tweet.text;
            console.log('cleantweet = ' + cleanTweet);
        }
        request.post(
            {
                url:'http://cloud-LB-1990344927.us-west-2.elb.amazonaws.com:80/tweet',
                form: { tweet: cleanTweet}
            }, function (err, httpRes, body) {
                if(err) console.log(err);
            }
        );
    });

    stream.on('error', function(error) {
        console.log(error);
    });

});
