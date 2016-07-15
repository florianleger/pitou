var util = require('util');
var teleinfo = require('./teleinfo.js');
var request = require('request');

var _unsentFrames = [];
var trameEvents = teleinfo.teleinfo('/dev/ttyAMA0');

// Handle elec information
trameEvents.on('onDecodedFrame', function (data) {
    sendData(data);
});

/**
 * Sends a frame to the API with buffered ones.
 * @param {Object} data - The frame to send.
 */
function sendData(data) {
    var frames = [{
        peakHours: data.HCHP,
        offPeakHours: data.HCHC,
        instantConsumption: data.PAPP,
        mode: data.HHPHC,
        date: Date.now()
    }];

    if(_unsentFrames.length > 0) {
        frames = frames.concat(_unsentFrames);
        _unsentFrames = [];
    }

    var options = {
        uri: 'http://theyetifield.tk:9841/frames/',
        method: 'POST',
        json: {
            frames: frames
        }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Frames successfully sent.");
        } else {
            console.error('An error occurred when sending frames:', response.statusCode);
            console.log('Retry to send them on the next request.');
            _unsentFrames = frames;
        }
    });
}