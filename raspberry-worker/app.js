var util = require('util');
var teleinfo = require('./teleinfo.js');
var request = require('request');

var trameEvents = teleinfo.teleinfo('/dev/ttyAMA0');

// Handle elec information
trameEvents.on('onDecodedFrame', function (data) {
    sendData(data);
});

/**
 * Sends the buffered data to the API and empty the buffer
 */
function sendData(data) {
    var options = {
        uri: 'http://theyetifield.tk:9841/frames/',
        method: 'POST',
        json: {
            frames: [data]
        }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Frames successfully sent.");
        } else {
            console.error('An error occurred when sending frames:', response.statusCode, 'error: ', error);
        }
    });
}