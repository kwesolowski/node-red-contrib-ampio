module.exports = function(RED) {
    /*function DiscoverDevices(ip){
        var mqtt = require('mqtt');
        var ip='192.168.77.80';
        var client  = mqtt.connect('mqtt://'+ip);
        var devices = {
            devices: [
              {
                mac: '11',
                user_mac: '11',
                typ: 47,
                pcb: 1,
                soft_ver: 2,
                protocol: 11,
                name: 'UmFkaW8ga29uZmVyZW5jeWpuYSAgICAgICAgICAgICAgICAg'
              },
              {
                mac: '603',
                user_mac: '603',
                typ: 6,
                pcb: 3,
                soft_ver: 10105,
                protocol: 13,
                name: 'UmFkaW8ga29uZmVyZW5jeWpuYSAgICAgICAgICAgICAgICAg'
              }
            ]
          };
        var GotResponse = false;
        
        client.on('connect', function () {
            
            client.subscribe('ampio/from/'+'+'+'/dev/discover', function (err) { //topic to subscribe
                if (!err) {
                    client.publish('ampio/to/all/dev','discover');
                    
                }
            });
        });
        client.on('message', function (topic, message) {
            devices = JSON.parse(message);
            client.end();
            GotResponse = true;
            console.log("got response");
            
        });
        
        setTimeout(function(){ return devices; }, 500);
        
    }*/
    /*function GetDevice(ip,mac){

    }*/


    function ampioout(config) {
        
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;
        this.mac = config.mac;
        this.ioid = config.ioid;
        this.valtype = config.valtype;
        this.srvaddress = config.srvaddress;
        

        var mqtt = require('mqtt');
        const leftPad = require('left-pad');
        var client  = mqtt.connect('mqtt://'+node.srvaddress);
        var n=false;
        var m=false;

        var mac = node.mac;
        var ioid = node.ioid;
        var valtype = node.valtype;



        mac = mac.toUpperCase();
        node.status({fill:"yellow",shape:"dot",text:"not connected"});

        while(m==false){
            if(mac[0]=='0'){
                mac = mac.substring(1);
            }
            else{
                m=true;
            }
        }
        


        while(n==false){
            if(ioid[0]=='0'){
                ioid = ioid.substring(1);
            }
            else{
                n=true;
            }
        }

        client.on('connect', function () {
            node.status({fill:"green",shape:"dot",text:"connected"});
        })

        client.on('error', function () {
            node.status({fill:"red",shape:"dot",text:"unable to connect"});
        })

        client.on('reconnect', function () {
            node.status({fill:"yellow",shape:"dot",text:"reconnecting"});
        })

        client.on('error', function() {
            node.status({fill:"red",shape:"dot",text:"error"});
        })

        client.on('close', function() {
            node.status({fill:"red",shape:"dot",text:"connection closed"});
        })

        client.on('offline', function() {
            node.status({fill:"red",shape:"dot",text:"disconnected"});
        })

        this.on("input", function(msg) {
            if(valtype=='r'){
                client.publish('ampio/to/'+mac+'/raw',msg.payload.toString());
            }
            else if(valtype=='s'){
                client.publish('ampio/to/'+mac+'/o/'+ioid+'/cmd',msg.payload.toString());
            }

        })

        this.on('close', function() {
            // tidy up any state
            client.end();
        });

    }
    RED.nodes.registerType("Ampio OUT",ampioout);

    RED.httpAdmin.get('/ampio/devices/list/:cmd', RED.auth.needsPermission('ampio.read'),function(req,res){
        
        var mqtt = require('mqtt');
        var ip=req.params.cmd;
        var mqttcli  = mqtt.connect('mqtt://'+ip);
        
        function OnConnect(){
            return new Promise((resolve,reject) => {
                mqttcli.on('connect', function () {
                    resolve(true);
                });
                setTimeout(function() {
                    resolve('timeout');
                }, 3000);
            })
        }
        function OnSubscribe(){
            return new Promise((resolve,reject) => {
                mqttcli.subscribe('ampio/from/can/dev/list', function (err) { //topic to subscribe
                    if (!err) {
                        mqttcli.publish('ampio/to/can/dev/list','');
                        resolve(true); 
                    }
                });
                setTimeout(function() {
                    resolve('timeout');
                }, 3000);
            });
        }
        function GetMessage(){
            return new Promise((resolve,reject) => {
                mqttcli.on('message', function (topic, message) {
                    devices = JSON.parse(message);
                    resolve(devices.devices);
                });
                setTimeout(function() {
                    resolve('timeout');
                }, 3000);
            });
        }
        
        Promise.all([
            OnConnect(),
            OnSubscribe(),
            GetMessage()
        ])
        .then(resp => {
            if(resp[2]==='timeout'){
                res.status(504);
                res.json("508 server timeout");
                mqttcli.end();
            }
            else{
                mqttcli.end();
                res.json(resp[2]);
            }
        });
    });  
    RED.httpAdmin.get('/ampio/devices/types', RED.auth.needsPermission('ampio.read'),function(req,res){
        let DevTypes = [
            {
              value: 0,
              type: 'VIRTUAL'
            },
            {
              value: 1,
              type: 'MIN-4p'
            },
            {
              value: 2,
              type: 'MPR-1p'
            },
            {
              value: 3,
              type: 'MROL-4s'
            },
            {
              value: 4,
              type: 'MPR-8s'
            },
            {
              value: 5,
              type: 'MDIM-8s'
            },
            {
              value: 6,
              type: 'MAMP-1s'
            },
            {
              value: 7,
              type: 'ZAR.'
            },
            {
              value: 8,
              type: 'MDOT-4'
            },
            {
              value: 9,
              type: 'MDOT-18'
            },
            {
              value: 10,
              type: 'MSERV-3s'
            },
            {
              value: 11,
              type: 'MDOT-9'
            },
            {
              value: 12,
              type: 'MRGBu-1'
            },
            {
              value: 13,
              type: 'MDIM-4'
            },
            {
              value: 14,
              type: 'MINOC-8'
            },
            {
              value: 15,
              type: 'MIN-8s'
            },
            {
              value: 16,
              type: 'MRTC-1s'
            },
            {
              value: 17,
              type: 'MLED-1'
            },
            {
              value: 18,
              type: 'MDIM-1'
            },
            {
              value: 19,
              type: 'MRT-1s'
            },
            {
              value: 20,
              type: 'MRT-4s'
            },
            {
              value: 21,
              type: 'MRT-8s'
            },
            {
              value: 22,
              type: 'MRT-16s'
            },
            {
              value: 23,
              type: 'MRT-32s'
            },
            {
              value: 24,
              type: 'MPR-2'
            },
            {
              value: 25,
              type: 'MCON'
            },
            {
              value: 26,
              type: 'MOC-4'
            },
            {
              value: 27,
              type: 'MDOT-15LCD'
            },
            {
              value: 28,
              type: 'MINAC-8s'
            },
            {
              value: 29,
              type: 'MINAD-8s'
            },
            {
              value: 30,
              type: 'MNAD-IR'
            },
            {
              value: 31,
              type: 'MROL-1'
            },
            {
              value: 32,
              type: 'MDOT-6LCD'
            },
            {
              value: 33,
              type: 'MDOT-2'
            },
            {
              value: 34,
              type: 'METEO-1s'
            },
            {
              value: 35,
              type: 'MCON-CAN'
            },
            {
              value: 36,
              type: 'MGES-1'
            },
            {
              value: 37,
              type: 'MZWAVE'
            },
            {
              value: 38,
              type: 'MRDN-1s'
            },
            {
              value: 39,
              type: 'MOUT-4s'
            },
            {
              value: 40,
              type: 'MIN-11p'
            },
            {
              value: 41,
              type: 'MOC-32s'
            },
            {
              value: 42,
              type: 'MIN-16s'
            },
            {
              value: 43,
              type: 'MDALI-1s'
            },
            {
              value: 44,
              type: 'MULTISENS'
            },
            {
              value: 45,
              type: 'MSMOG'
            },
            {
              value: 46,
              type: 'MAmpio1WGW'
            },
            {
              value: 47,
              type: 'MKNX'
            },
            {
              value: 48,
              type: 'MEXL'
            },
            {
              value: 49,
              type: 'MWRC'
            },
            {
              value: 50,
              type: 'USBGW'
            },
            {
              value: 51,
              type: 'MDOT-M4'
            },
            {
              value: 52,
              type: 'MDOT-M14'
            },
            {
              value: 53,
              type: 'GPS-ALARM'
            },
            {
              value: 54,
              type: 'MPT'
            },
            {
              value: 55,
              type: 'MIN16OC8'
            },
            {
              value: 56,
              type: 'MMP3PLAY'
            }
          ];
          res.json(DevTypes);
    });


};


