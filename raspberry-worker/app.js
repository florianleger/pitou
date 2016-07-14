var util = require('util');
var teleinfo = require('./teleinfo.js');

var trameEvents = teleinfo.teleinfo('/dev/ttyAMA0');
var dataBuffer = [];
var TIMEOUT_EMPTY_BUFFER = 3600 * 24;
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
});

_startTimeout();

/**
 * Sends the buffered data to the API and empty the buffer
 */
function sendData() {
    // TODO: Send to the API

    _emptyDataBuffer();
    _resetTimeout();
}

/**
 * Start a timeout that will empty the buffer
 */
function _startTimeout() {
    _timeoutHandle = setTimeout(function () {
        _emptyDataBuffer();
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
