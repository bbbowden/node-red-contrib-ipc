// Test program for Windows Named Pipes

// The name of the pipe must match that in the ipc node - and note the escaped \'s!
var pipename = '\\\\.\\pipe\\test-1';

// Create a client connection and send the program arguments to it, each on a new line
var client = require("net").createConnection(pipename);

process.argv.forEach(function (val, index, array) {
    if (index > 1) {
        client.write(val + '\r\n');
    }
});

// Close the connection (this causes node.js to exit)
client.end();
