$(document).ready(function () {
    // Vars ############################################################################################################
    var webserverURL = "127.0.0.1"

    // Functions #######################################################################################################
    var autoScrolling = function () {
        if ($('#autoscroll').val() == "true") {
            console.log("Auto: " + $('#autoscroll').val())
            $('body,html').animate({
                scrollTop: $('#messages li:last-child').offset().top + 'px'
            }, 1000);
        }
    }

    var confirmDialog = function(msg){
        return confirm(msg);
    }

    var clearList = function(){
        $('#messages').empty();
    }
    // Socket.io #######################################################################################################
    var socket = io();

    //Complete Logfile
    socket.on('completeLog', function (data) {
        console.log(data);
        clearList();
        console.log("Complete Log")
        for (var i = 0; i < data.length; i++) {
            $('#messages').append($('<li>').text(data[i]));
        }
        autoScrolling()
    });

    //One new Log Entry
    socket.on('log', function (data) {
        console.log(data);
        $('#messages').append($('<li>').text(data));
        autoScrolling()
    });

    //Ip of Host
    socket.on('ip', function (data, logfilePath) {
        //console.log("GOT: " + data + ", " + logfilePath)
        webserverURL = data;
        $('#txt_path').val(logfilePath);
    });

    socket.on('changeLogfilePath', function(changed, data){
       console.log("changeLogfilePath: " + changed + ", " + data);
        if(changed){
            clearList();
            $('#txt_path').val(data);
            alert("Logfile Path was changed!");
            //socket.emit('completeLog');
        } else {
            alert("Logfile not found!");
        }

    });

    // JQuery - Events #################################################################################################
    // Get complete Logfile
    $('#btn').click(function () {
        socket.emit('getCompleteLog');
    });

    //Auto Scroll
    $('#autoscroll').val($(this).is(':checked'));
    $('#autoscroll').change(function () {
        $('#autoscroll').val($(this).is(':checked'));
        console.log()
    });

    //Delete Log
    $('#del_log').click(function(){
        if(confirmDialog('Are you sure to delete the Logfile?')){
            deleteLog()
        }
    });

    //Reset Rules
    $('#del_rules').click(function(){
        if(confirmDialog('Are you sure to reset the Rules?')){
            resetRules()
        }
    });

    // Change Logfile Path
    $('#change_path').click(function(){
        data = $('#txt_path').val();
        socket.emit('changeLogfilePath', data);
    });


    // JQuery - Ajax Requests ##########################################################################################
    var deleteLog = function () {
        $.ajax({
            url: '/log',
            type: 'DELETE',
            success: function (result) {
                console.log("Delete Log success: " + result);
                alert(result);
                clearList();
            },
            error: function (err) {
                console.log("Error in deleteLog! -> " + err);
                alert(err);
            }
        });
    }

    var resetRules = function () {
        $.ajax({
            url: '/rules',
            type: 'DELETE',
            success: function (result) {
                console.log("Reset Rules success: " + result);
                alert(result);
            },
            error: function (err) {
                console.log("Error in resetRules! -> " + err);
                alert(err);
            }
        });
    };
});