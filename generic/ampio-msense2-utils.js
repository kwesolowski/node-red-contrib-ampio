/*
wilg, cis b, glos, jasn, iaq, cisn wz

hum: 'Humidity [%]',
absp: 'Atmospheric pressure (absolute) [hPa]',
relp: 'Atmospheric pressure (relative) [hPa]',
db: 'Loudness [dB]',
lux: 'Brightness [lux]',
iaq: 'Indoor Air Quality index [IAQ]',

*/
exports.available_msense2_values = function () {
    return [
        'humidity',
        'absolute-pressure',
        'relative-pressure',
        'loudness',
        'brightness',
        'indoor-air-quality',
        'temperature',
    ];
}

exports.setup_for_single_msense2_value = function (node, valtype) {
    switch (valtype) {
        case 'hum':
        case 'humidity':
            node.valtype = 'au16l';
            node.ioid = '1';
            node.field = 'humidity';
            break;

        case 'absp':
        case 'absolute-pressure':
            node.valtype = 'au16l';
            node.ioid = '2';
            node.field = 'absolute-pressure';
            break;

        case 'relp':
        case 'relative-pressure':
            node.valtype = 'au16l';
            node.ioid = '6';
            node.field = 'relative-pressure';
            break;

        case 'db':
        case 'loudness':
            node.valtype = 'au16l';
            node.ioid = '3';
            node.field = 'loudness';
            break;

        case 'lux':
        case 'brightness':
            node.valtype = 'au16l';
            node.ioid = '4';
            node.field = 'brightness';
            break;

        case 'iaq':
        case 'indoor-air-quality':
            node.valtype = 'au16l';
            node.ioid = '5';
            node.field = 'indoor-air-quality';
            break;

        case 'temp':
        case 'temperature':
            node.valtype = 't';
            node.ioid = '1';
            node.field = 'temperature';
            break;
        default:
    }
}
