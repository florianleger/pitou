var util = require('util');
var teleinfo = require('./teleinfo.js');
var request = require('request');

var trameEvents = teleinfo.teleinfo('/dev/ttyAMA0');
var dataBuffer = [];
var TIMEOUT_EMPTY_BUFFER = 60 * 30; // Send a request every 30 minutes.
var _timeoutHandle = function(){};

// Handle elec information
trameEvents.on('tramedecodee', function (data) {
    console.log("HP: ", data.HCHP);
    console.log("HC: ", data.HCHC);
    console.log("Instant: ", data.PAPP);
    dataBuffer.push({
        indexHP: data.HCHP,
        indexHC: data.HCHC,
        power: data.PAPP
    });
    sendData(data);
});

_startTimeout();

/**
 * Sends the buffered data to the API and empty the buffer
 */
function sendData() {
    var options = {
        uri: 'http://theyetifield.tk/frames/',
        method: 'POST',
        json: {
            frames: dataBuffer
        }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Frames successfully sent.");
            _emptyDataBuffer();
        } else {
            console.error('An error occurred when sending frames:', error);
        }
        _resetTimeout();
    });
}

/**
 * Start a timeout that will empty the buffer
 */
function _startTimeout() {
    _timeoutHandle = setTimeout(function () {
        //sendData();
    }, TIMEOUT_EMPTY_BUFFER);
}

/**
 * Reset the timeout
 */
function _resetTimeout() {
    _timeoutHandle();
    _startTimeout();
}

/**
 * Empties the buffer
 */
function _emptyDataBuffer() {
    dataBuffer = [];
}
