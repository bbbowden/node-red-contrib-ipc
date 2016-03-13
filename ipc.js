/**
 * Copyright 2016 Maxwell Hadley
 *
 * Licensed under the BSD 2-clause license - see accompanying LICENSE file
 **/
 
module.exports = function(RED) {

	var debugOption = false,
        unixy = true,
        lineEnd = "\n",
        net = require("net"),
        fs = require("fs");

// Set the ipc debug option from the environment variable
	if (process.env.hasOwnProperty("RED_DEBUG") && process.env.RED_DEBUG.toLowerCase().indexOf("ipc") >= 0)  {
		debugOption = true;
	}
// Detect platform type and adjust defaults accordingly
    if (require("os").platform() === "win32") {
        unixy = false;
        lineEnd = "\r\n";
        // TODO - insert code here if needed
    }

    function ipcInNode(config) {
        RED.nodes.createNode(this, config);

        // node configuration
		this.path = config.path;
        this.topic = config.topic;
		this.name = config.name;
		var node = this;

        node.status({fill:"yellow", shape:"ring", text:"disconnected"});

        // Process the input buffers assuming they are utf-8 strings. Generate
        // a new message for each line. Handles lines split across multiple data events
        node.stringBuffer = "";
        node.parser = function (data) {
            if (debugOption) {
                console.log("Connection");
            }
            var parts, i, msg;
            node.stringBuffer = node.stringBuffer + data.toString('utf8');
            parts = node.stringBuffer.split(lineEnd);
            for (i = 0; i < parts.length - 1; i += 1) {
                msg = {topic:node.topic, payload:parts[i]};
                node.send(msg);
            }
            node.stringBuffer = parts[parts.length-1];
        };

        node.server = net.createServer(function (connection) {
            if (debugOption) {
                console.log('Connected');
            }
            connection.on("data", node.parser);
            if (debugOption) {
                connection.on("end", function () {
                    console.log("Disconnected")
                });
            }
        });
        node.server.on('error', function (e) {
            // If the path exists, set status and retry at intervals
            if (e.code == 'EADDRINUSE') {
                if (debugOption) {
                    console.log("Path in use, retrying...");
                }
                node.status({fill:"red", shape:"ring", text:"Path in use"});
                setTimeout(function () {
                    node.server.close();
                    node.server.listen(node.path);
                }, 2000);
            }
        });

		node.server.listen(node.path, function () {
                node.status({fill:"green", shape:"dot", text:"listening"})
            });

		node.on("close", function () {
            // Boot off anyone connected to the socket
            node.server.unref();
			if (unixy) {
                // Delete the socket: Windows pipes are unlinked auto-magically
                fs.unlinkSync(node.path);
            }
		});
    }

    // Register the node by name.
    RED.nodes.registerType("IPC-in", ipcInNode);
};
