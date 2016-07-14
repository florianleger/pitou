var serialport = require('serialport');
var events = require('events');
var util = require('util');

/**
 * Starts listening for ERDF teleinfo frames.
 * This function follows the ERDF Teleinfo spec (http://www.magdiblog.fr/wp-content/uploads/2014/09/ERDF-NOI-CPT_02E.pdf).
 * Allows registering to 2 events:
 * - 'onFrame': called every time a frame is got. Provides frame raw data.
 * - 'onDecodedFrame': called every time a frame is decoded. Provides the decoded frame (see lines 69 to 79).
 * @param {string} port - The port to listen teleinfo (e.g.: '/dev/ttyAMA0')
 * @returns {events.EventEmitter} - The events listeners 'onFrame' and 'onDecodedFrame'.
 */
function teleinfo(port) {
    var frameEvents = new events.EventEmitter();

    var serialPort = new serialport.SerialPort(port, {
        baudrate: 1200,
        dataBits: 7,
        parity: 'even',
        stopBits: 1,
        // Separators = end of frame + start of frame
        parser: serialport.parsers.readline(String.fromCharCode(13, 3, 2, 10))
    });

    serialPort.on('data', function (data) {
        frameEvents.emit('onFrame', data);
    });

    frameEvents.on('onFrame', function (data) {
        // Decode frame '9 lignes en tarif bleu'
        var frame = {};
        var arrayOfData = data.split('\r\n');
        for (var i = 0; i < arrayOfData.length; i++) {
            _decodeLine(arrayOfData[i], frame);
        }
        // Incomplete frame if the first line 'ADCO' is missing
        if (!(frame['ADCO'] === undefined)) {
            frameEvents.emit('onDecodedFrame', frame);
        }
        else {
            console.warn("[WARN] (teleinfo.js) - Incomplete frame: \n" + util.inspect(frame));
        }
    });

    return frameEvents;
}

/**
 * Decodes the specified frame.
 * @param rawLine
 * @param frame
 * @returns {boolean}
 * @private
 */
function _decodeLine(rawLine, frame) {
    var elementsLigne = rawLine.split(' ');

    if (elementsLigne.length === 3) {
        var sum = 0;
        for (var j = 0; j < rawLine.length - 2; j++) {
            sum += rawLine.charCodeAt(j);
        }
        sum = (sum & 63) + 32;

        if (sum === rawLine.charCodeAt(j + 1)) {

            switch (elementsLigne[0].substr(0, 4)) {
                case 'BASE': // "Index Tarif bleu"
                case 'HCHC': // "Index Heures creuses"
                case 'HCHP': // "Index Heures pleines"
                case 'EJPH': // "Index EJP (HN et HPM)"
                case 'BBRH': // "Index Tempo (HC/HP en jours Blanc, Bleu et Rouge)"
                case 'ISOU': // "Intensité souscrite"
                case 'IINS': // "Intensité instantannée (1/2/3 pour triphasé)"
                case 'ADPS': // "Avertissement de dépassement"
                case 'IMAX': // "Intensité max appelée (1/2/3 pour triphasé)"
                case 'PAPP': // "Puissance apparente"
                case 'PMAX': // "Puissance max triphasée atteinte"
                    frame[elementsLigne[0]] = Number(elementsLigne[1]);
                    break;
                default:
                    frame[elementsLigne[0]] = elementsLigne[1];
            }
            return true;
        } else {
            // Checksum KO
            return false;
        }
    }
}

exports.teleinfo = teleinfo;
