'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./const.js');

var express = require('express');
var app = express();
var request = require('request');
var rp = require('request-promise');

var r;
var resultArray;
// function getData(term){
//   var urlbase = "https://calm-sierra-94596.herokuapp.com/movies/";
//   var urlappend = term;
//     // app.get('/', function (req, res) {
//     // do something with apps
//     // request({
//     //     url: urlbase + urlappend,
//     //     json: true
//     // }, function (error, response, body) {
//     //     resultArray = response.body;
//     //     // console.log(resultArray);
//     //     // res.send(response.body);
//     //     if (!error && response.statusCode === 200) { //goes in here if success
//     //       resultArray = response.body;
//     //       r = resultArray;
//     //       // console.log(resultArray[0]);
//     //       // console.log(resultArray[0].title);
//     //       return resultArray;
//     //     }
//     // }).then(function(json){
//     //   return resusltArray;
//     // });
//     // return resultArray;
//   // });
//   var options = {
//     uri: urlbase + urlappend,
//     qs: {
//       access_token: ''
//     },
//     headers:{
//       'User-Agent': 'Request- Promise'
//     },
//     json:true
//   };
//   rp(options)
//     .then(function(repos){
//       // console.log(repos.length);
//       // console.log(repos);
//       return repos;
//     }).catch(function(err){

//     });
// }


const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};


const secondEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][1].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};







// Wit.ai Bot actions
const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);

    // Bot testing mode, run cb() and return
    if (require.main === module) {
      cb();
      return;
    }

    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to from context
    // TODO: need to get Facebook user name
    const recipientId = context._fbid_;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      FB.fbMessage(recipientId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user in context:', context);
      // Giving the wheel back to our bot
      cb();
    }
  },


  merge(sessionId, context, entities, message, cb) {
    // Retrieve the location entity and store it into a context field
    // console.log('entities in merge ' + entities);
    // console.log('context in merge ' + context);
    const movies = firstEntityValue(entities, 'movies');
    if (movies) {
      context.movies = movies; // store it in context
    }

    cb(context);
  },

  error(sessionId, context, error) {
    console.log(error.message);
  },

  // fetch-weather bot executes
 
['getSimilar'](sessionId, context, cb){
    // var x = getData('leon the professional', r);
    //const movies = firstEntityValue(entities, 'movies')
    // const movie_title = firstEntityValue(entities, 'movies');
    // if(movie_title){
    //   context.movies = movie_title;
    // }
    // console.log(context.movies);
    var urlbase = "https://calm-sierra-94596.herokuapp.com/movies/";
    var urlappend = context.movies;

    var options = {
      uri: urlbase + urlappend,
      qs: {
        access_token: ''
      },
      headers:{
        'User-Agent': 'Request- Promise'
      },
      json:true
    };
    rp(options)
      .then(function(repos){
        // console.log(repos.length);
        // console.log(repos);
        var x = "";
        var size = repos.length;
        if(size >= 5) size = 5;
        for(var i = 0 ; i < size; i++){
          x += repos[i].title;
          x += '\n';
        }
        context.similarMovies = '\n'+ '\n'+ x;
        cb(context)
        //return repos;
      }).catch(function(err){

      });
      // context.similarMovies = suggestions; //add database here
     //cb(context)
    }
};


const getWit = () => {
  return new Wit(Config.WIT_TOKEN, actions);
};

exports.getWit = getWit;

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
  console.log("Bot testing mode.");
  const client = getWit();
  client.interactive();
}