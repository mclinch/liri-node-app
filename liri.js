var inquirer = require('inquirer');

var args = (function () {
	var argument = process.argv.splice(2)

    var logging = argument.indexOf('--nolog') === -1 ? true : false;
    var printing = argument.indexOf('--noprint') === -1 ? true : false;
    var logArg = argument.indexOf('--logfile');
    var logFile = logArg === -1 ? 'log.txt' : argument[logArg + 1];

    return {
        logging,
        printing,
        logFile
    }
})()

var commands = (function(){
    var fs = require('fs');
    var keys = require('./keys.js');
    var logger = args.logging ? fs.createWriteStream(args.logFile, {flags: 'a'}) : 'no-log';

    var _logData = function (data) {
        if (args.logging) {
            logger.write(data+'\n');  
        }
        if (args.printing){
            console.log(data);
        }
    }

    var clearLog = function () {
        fs.writeFile(args.logFile, '', () => {
            if (args.printing) {
                console.log(`${args.logFile} cleared.`)
            }
        })
    };

    var getTweet = function () {
        var Twitter = require('twitter');
        var client = new Twitter({
            consumer_key: keys.twitter.consumer_key,
            consumer_secret: keys.twitter.consumer_secret,
            access_token_key: keys.twitter.access_token_key,
            access_token_secret:  keys.twitter.access_token_secret
        });

        client.get('/statuses/user_timeline.json', { count: 20 }, function(err, tweets, response) {
            if (err) {
                console.log('Error occurred: ' + err);
                return;
            }
            _logData('__My tweets__')
            tweets.forEach( function(element) {
                var tweet = element.text;
                var d = new Date(element.created_at).toDateString();
                _logData(`${d}: ${tweet}`)
            });
            _logData('\r')
        });
    };

    var getSong = function (option) {
        var song = option || 'Jungle Love';
        var Spotify = require('node-spotify-api');
        var client = new Spotify({
          id: keys.spotify.clientID,
          secret: keys.spotify.clientSecret
        });
         
        client.search({ type: 'track', query: song }, function(err, data) {
            if (err) {
                console.log('Error occurred: ' + err);
                return;
            }
            var songData = data.tracks.items[0];
            _logData('__spotify-this-song__')
            _logData(`Artist: ${songData.artists[0].name}`)
            _logData(`Song Title: ${songData.name}`)
            _logData(`Album: ${songData.album.name}`)
            _logData(`Link: ${songData.preview_url}`)
            _logData('\r')
        });
    };

    var getMovie = function (option) {
        var request = require('request');
        var movie = option || 'Mr. Nobody';
        var movieAtt = ['Title', 'Year', 'imdbRating', 'Country', 'Language', 'Plot', 'Actors', 'Website'];
        request({
            method: 'GET',
            uri: `http://www.omdbapi.com/?apikey=${keys.OMDB}&t=${movie}`,
            json: true
        }, function (err, res, body){
            if (err) {
                console.log('Error occurred: ' + err);
                return;
            }
            _logData('__movie-this__')
            movieAtt.forEach( function(element, index) {
                _logData(`${element}: ${body[element]}`);
            });
            _logData('\r')
        });



    };

    var getRandom = function () {
        fs.readFile('random.txt', 'utf8', function (err, data) {
            let lines = data.toString().replace('\r','').split('\n');
            let [command, option] = lines[Math.floor(Math.random() * lines.length)].split(',');
            _logData('__do-what-it-says__')
            commands[command](option)
        })
    };

    return {
        'clear-log': clearLog,
        'my-tweets': getTweet,
        'spotify-this-song': getSong,
        'movie-this': getMovie,
        'do-what-it-says': getRandom
    }
})()

inquirer.prompt(
    {
      type: 'list',
      message: 'Hi, I am LIRI, what can I do for you?',
      choices: ['my-tweets','movie-this', 'spotify-this-song', 'do-what-it-says', 'clear-log'],
      name: 'command'
    }).then(function (res) {
        if (res.command === 'movie-this' || res.command === 'spotify-this-song'){
            var thing = res.command === 'movie-this' ? 'movie' : 'song';
            inquirer.prompt(
                {
                    type: 'input',
                    message: `Which ${thing} would you like info for?`,
                    name: 'option'
                }).then(function (res2) {
                    commands[res.command](res2.option)
                })
            } else {
                commands[res.command]()
            }
});
// var params = {screen_name: 'nodejs'};
// client.get('statuses/user_timeline', params, function(error, tweets, response) {
//   if (!error) {
//     console.log(tweets);
//   }
// });


 
// spotify.search({ type: 'track', query: 'All the Small Things' }, function(err, data) {
//   if (err) {
//     return console.log('Error occurred: ' + err);
//   }
 
// console.log(data); 
// });

