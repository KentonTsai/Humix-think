
module.exports = function(RED) {
    "use strict";

    function SenseEvent(n) {
        RED.nodes.createNode(this,n);
        var senseId = n.senseid,
            eventType = n.eventtype,
            eventName = n.eventname,
            node = this;

        RED.comms.subscribe(senseId, function(data) {
            try {
                var event;
                if (typeof data === 'string') {
                    event = JSON.parse(data);
                } else {
                    event = data;
                }
                
                if (event.eventType === eventType && event.eventName === eventName) {
                    node.send({
                        payload: event.message
                    });
                }
            } catch (e) {
                node.error('Error: '+e);
            }
        });
    }
    RED.nodes.registerType("sense event", SenseEvent);

    function SenseCommand(n) {
        RED.nodes.createNode(this,n);
        var senseId = n.senseid,
            commandType = n.commandtype,
            commandName = n.commandname,
            node = this;

        node.on('input', function(msg) {
            if (!msg.payload) {
                node.error('Missing property: msg.payload');
                return;
            }

            var message = {
                header: {
                    type: 'modules'
                },
                payload: {
                    commandType: commandType,
                    commandName: commandName,
                    commandData: msg.payload
                }
            };
            RED.comms.publish(senseId, message, true);
        });
    }
    RED.nodes.registerType("sense command", SenseCommand);
};