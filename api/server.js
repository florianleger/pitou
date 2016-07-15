var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var db;
var _lastFrame = {};

MongoClient.connect('mongodb://localhost:27017/pitou', function (err, database) {
    if (err) {
        throw err;
    }
    db = database;
});

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send(
        '<h2>Pitou API</h2><br><br>' +
        '<ul><li>Instant consumption: <strong>' + _lastFrame.instantConsumption + ' W</strong></li>' +
        '<li>Peak hours index: <strong>' + _lastFrame.peakHours + ' Wh</strong></li>' +
        '<li>Off-peak hours index: <strong>' + _lastFrame.offPeakHours + ' Wh</strong></li>' +
        '<li>Current mode: <strong>' + _lastFrame.mode + '</strong></li></ul>'
    );
});

app.get('/frames/last', function (req, res) {
    res.json(_lastFrame);
});

app.get('/frames', function (req, res) {
    db.collection('frames').find({}).toArray(function(err, result) {
        if(err) {
            res.sendStatus(500);
            throw err;
        } else {
            res.json(result);
        }
    });
});

app.post('/frames', function (req, res) {
    if (req.body && req.body.frames) {
        var frames = req.body.frames;

        // Store frames
        db.collection('frames').insert(frames, function (err, result) {
            if (err) {
                res.sendStatus(500);
                throw err;
            } else {
                res.sendStatus(200);
                console.log("New stored frame(s).");
            }
        });

        // Keep the last frame in memory
        _lastFrame = frames[frames.length - 1];
    }
});

/*app.post('/delete', function(req, res) {
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
 */

app.listen(9841);
