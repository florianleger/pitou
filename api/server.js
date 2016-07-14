var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var db;

MongoClient.connect('mongodb://localhost:27017/pitou', function(err, database) {
  if (err) {
    throw err;
  }
  db = database;
});

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Welcome to Pitou API ;)\n'
   	+'Frames:\n' + frames.toString());
});

app.post('/frames', function(req, res) {
  console.log('req.body.frames: ', req.body.frames);
  if(req.body && req.body.frames) {
    var frames = req.body.frames;
    db.collection('frames').insert(frames, function(err, result) {
      if (err) {
        throw err;
      }
      console.log(result);
    });
  }
  res.sendStatus(200);
});

app.post('/delete', function(req, res) {
  _removeAllFrames(function(err) {
    if(err) {
      res.sendStatus(500);
    }
    res.sendStatus(200);
  });
});

var _removeAllFrames = function(callback) {
   db.collection('frames').deleteMany(
      { },
      function(err, results) {
         console.log(results);
         callback();
      }
   );
};

app.listen(9841);
