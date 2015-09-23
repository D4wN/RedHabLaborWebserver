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
        console.log(data)
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
    socket.on('ip', function (data) {
        webserverURL = data;
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
        if(confirmDialog('Are you suret to delete the Logfile?')){
            deleteLog()
        }
    });

    //Reset Rules
    $('#del_rules').click(function(){
        if(confirmDialog('Are you suret to reset the Rules?')){
            console.log("SURE RULES");
        }
    });


    // JQuery - Ajax Requests ##########################################################################################
    var deleteLog = function () {
        $.ajax({
            url: '/log',
            type: 'DELETE',
            success: function (result) {
                console.log("Delete Log success: " + result);
                clearList();
            },
            error: function (err) {
                alert("Error in deleteLog! -> " + err);
            }
        });
    }

    var resetRules = function () {
        $.ajax({
            url: '/rules',
            type: 'DELETE',
            success: function (result) {
                console.log("Reset Rules success: " + result)
            },
            error: function (err) {
                alert("Error in resetRules! -> " + err)
            }
        });
    }


});