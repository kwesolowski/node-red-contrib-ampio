module.exports = function (RED) {
    function ampioin(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const au = require('../generic/ampio-utils');
        const amu = require('../generic/ampio-msense2-utils');
        node.mac = au.sanitize_mac(config.mac);

        node.retainignore = config.retainignore;

        node.client = au.setup_mqtt_client(node, config);
        au.setup_node_status_from_mqtt_client(node);

        node.RisingEdgeDetection = false;
        if (node.valtype == 'raw') {
            node.SubPath = 'ampio/from/' + node.mac + '/raw'
        } else {
            if (node.valtype == "re") {
                node.valtype = "i";
                node.ioid = au.sanitize_ioid(config.ioid);
                node.RisingEdgeDetection = true;
            } else {
                amu.setup_for_single_msense2_value(node, config.valtype)
            }

            node.SubPath = 'ampio/from/' + node.mac + '/state/' + node.valtype + '/' + node.ioid;
        }


        node.client.on('connect', function () {
            node.client.subscribe(node.SubPath, function (err) { // topic to subscribe
                if (!err && node.mac != "" && node.ioid != "" && node.valtype != "") {
                    node.status({fill: "green", shape: "dot", text: "connected"});
                    node.JustConnected = true;
                } else {
                    node.status({fill: "red", shape: "ring", text: "fill properties"});
                }
            })
        });

        node.client.on('message', function (topic, message) {
            const outMsg = {
                payload: message.toString('utf-8'),
            };

            if (node.RisingEdgeDetection == true) {
                if (message == 1) {
                    node.send(outMsg);
                }
            } else {
                if (node.JustConnected == true && node.retainignore == true) {
                    // ignore retained value
                } else {
                    node.send(outMsg);
                }
            }

            node.JustConnected = false;
        });

        this.on('close', function () {
            // tidy up any state
            node.client.end();
        });

    }

    RED.nodes.registerType("Ampio IN", ampioin);
};


