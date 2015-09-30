var express = require('express')
var app = express();
var io = require('socket.io')()
var path = require('path');
var fs = require('fs')

var ip = require('ip');
var HOST= ip.address()
var PORT = 3000;

// var logfilePath = '/home/tf/programs/RedHab_-_Labor/bin/eventlogger.log';
var logfilePath = "./testlog.log"
var rulesfilePath = '/etc/openhab/configurations/rules/labor.rules';
//var rulesfilePath = "./testrules.rules"
var baseRules = "rule \"System Started\" when System started then logDebug(\"Labor\", \"System started! Init Segment7 with 9999\") sendCommand(Segment7, \"9998\") end\n";

//Static Files
app.use(express.static('public'));

// Logfile
var logData = [];
var Tail = require('always-tail');
var options = {'interval': 1000}


var tail;
var watchFuncTail = function(data){
    console.log("watched: " + data);
    logData.push(data);
    io.emit('log', data);
}
var errorFuncTail = function(data) {
    console.log("tail-error:", data);
}
var initTail = function(){
    tail = new Tail(logfilePath, '\n', options);
    tail.on('line', watchFuncTail);
    tail.on('error', errorFuncTail);
    tail.watch();
}

var changeLog = function(path){
    console.log('Path:' + path);
    if(path === undefined || path == null){
        return false;
    }
    if(path == logfilePath) {
        return false;
    }
    try{
        stats = fs.lstatSync(path);
        if(stats != null && stats.isFile){
            console.log("plo")
            tail.unwatch();
            logData.splice(0,logData.length);
            logfilePath = path;
            initTail();
            return true;
        }
    }catch (e) {
        //DO nothing, File does not exists
    }
    return false;
};

initTail();
//tail.watch();

//Routes
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.delete('/log', function (req, res) {
    tail.unwatch();
    fs.writeFile(logfilePath, '', function(err){
        if (err) {
            initTail();
            res.send('Could not delete the Logfile! ' + err);
            return;
        }
        // Cleanup log cache
        logData.splice(0,logData.length);
        initTail();
        console.log("DELETED----------------------------------------------------------------------")
        console.log(logData)
        res.send('Successfully deleted the Logfile!');
    })
});

app.delete('/rules', function (req, res) {
    fs.writeFile(rulesfilePath, baseRules,  function(err){
        if (err) {
            res.send('Could not reset the Rules! ' + err);
            return;
        }
        res.send('Successfully resetted the Rules!');
    });
});

//Socket.io
io.on('connection', function(socket){
    console.log('a user connected');
    // Give Client Rest Api Adress
    socket.emit('ip', HOST+":"+PORT, logfilePath);
    //Disconnected
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    // Message
    socket.on('getCompleteLog', function(){
        socket.emit('completeLog', logData);
    });
    // change Logfile Path
    socket.on('changeLogfilePath', function(data){
        console.log("on:changeLogfilePath: " + data);
        changed = changeLog(data);
        console.log("changelog: " + changeLog(data));
        console.log("path: " + logfilePath);
        io.emit('changeLogfilePath', changed, logfilePath);
    });
});

var server = app.listen(PORT, function () {
    //var host = server.address().address;
    var port = server.address().port;

    console.log('RedHabLab listening at http://%s:%s', HOST, port);
});
io.listen(server)