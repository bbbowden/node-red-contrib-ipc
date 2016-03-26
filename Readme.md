node-red-contrib-ipc
========================

A <a href="http://nodered.org" target="_new">Node-RED</a> node for receiving Inter-Process Communication messages using
UNIX-domain sockets where available, and using Named Pipes on Windows


Install
-------

Run the install command in Node-RED installation directory

	npm install node-red-contrib-ipc

The node may also be installed globally using the -g switch. There are no external dependencies.

Usage
-----

The node creates a server at the specified Path. This may be anywhere in the filesystem for UNIX-like operating systems
(provided the node-RED process has adequate file permissons), or on Windows a Named Pipe psuedo-file, e.g.
`\\.\Pipe\test-1`. The Path must not exist when the flow is deployed. The node attempts to clean up after itself
when node-RED exits or the flow is redployed, releasing the Path for re-use.

Processes may connect to this Path and should send text data (in UTF-8 encoding). Each line of text will generate an
output message, where the message Payload is the received text line (minus any line terminating characters), and the
message Topic is set by the node. The line ending characters are `\n` on UNIX-like operating systems, and `\r\n` on Windows.

On Unix-like operating systems, the netcat-BSD tool can be used to send output from a shell script to a UNIX-domain
socket at the specified Path, for example:

    ls | nc -U /Users/max/tst.socket
    
Example node.js code to send text to a Windows Named Pipe is provided in the Windows directory.

Example Node-RED flow:

	[{"id":"36333a8e.c9ccc6","type":"IPC-in","z":"6e8b42ee.9174bc","path":"/Users/max/tst.socket","topic":"Test/data",
	"name":"","x":126,"y":265,"wires":[["64063cc4.9bf9c4"]]}]
	