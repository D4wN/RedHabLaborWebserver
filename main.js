var express = require('express')
var app = express();
var io = require('socket.io')()
var path = require('path');
var fs = require('fs')

var ip = require('ip');
var HOST= ip.address()
var PORT = 3000;

//TODO DEBUG ONLY!
//var logfilePath = 'C:/Programmierung/Repos/Python/TinkerforgeRedHab/eventlogger.log';
var logfilePath = "./test.log"
//var rulesfilePath = '/etc/openhab/configurations/rules/labor.rules'
var rulesfilePath = "./testrules.rules"
var baseRules = "rule \"System Started\" when System started then logDebug(\"Labor\", \"System started! Init Segment7 with 9999\") sendCommand(Segment7, \"9998\") end";

//Static Files
app.use(express.static('public'));

// Logfile
var logData = [];
var Tail = require('always-tail');
var options = {'interval': 1000}

var tail = new Tail(logfilePath, '\n', options);
tail.on('line', function(data) {
    logData.push(data)
    io.emit('log', data)
    //console.log(data);
});
tail.on('error', function(data) {
    console.log("error:", data);
});
tail.watch();

//Routes
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.delete('/log', function (req, res) {
    tail.unwatch();
    // FIXME: Add real path to log-file
    fs.writeFile(logfilePath, '', function(err){
        if (err) {
            return console.log("Can't delete log file" + err);
        }
        // Cleanup log cache
        logData.splice(0,logData.length);

        console.log('Got a DELETE request at /log');
        tail.watch();
        res.send('Got a DELETE request at /log');
    })
});

app.delete('/rules', function (req, res) {
    // FIXME: Add real path to rule file
    fs.writeFile(rulesfilePath, baseRules,  function(err){
        if (err) {
            return console.log("Can't reset rule file" + err);
        }

        console.log('Got a DELETE request at /rules')
        res.send('Got a DELETE request at /rules');
    });
});

//Socket.io
io.on('connection', function(socket){
    console.log('a user connected');
    // Give Client Rest Api Adress
    socket.emit('ip', HOST+":"+PORT);
    //Disconnected
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    // Message
    socket.on('getCompleteLog', function(){
        io.emit('completeLog', logData);
    });
});

var server = app.listen(PORT, function () {
    //var host = server.address().address;
    var port = server.address().port;

    console.log('RedHabLab listening at http://%s:%s', HOST, port);
});
io.listen(server)