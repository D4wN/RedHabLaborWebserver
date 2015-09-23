$( document ).ready(function() {
    var socket = io();

    $('#btn').click(function(){
        socket.emit('getCompleteLog');
    });

    //set initial state.
    $('#autoscroll').val($(this).is(':checked'));
    $('#autoscroll').change(function() {
        $('#autoscroll').val($(this).is(':checked'));
        console.log( )
    });
    var autoScrolling = function () {
        if($('#autoscroll').val() == "true"){
            console.log("Auto: " + $('#autoscroll').val())
            $('body,html').animate({
                scrollTop: $('#messages li:last-child').offset().top + 'px'
            }, 1000);
        }
    }

    socket.on('completeLog', function(data){
        console.log(data);
        $('#messages').empty();
        console.log("Complete Log")
        console.log(data)
        for(var i=0; i<data.length; i++){
            $('#messages').append($('<li>').text(data[i]));
        }
        autoScrolling()
    });

    socket.on('log', function(data){
        console.log(data);
        $('#messages').append($('<li>').text(data));
        autoScrolling()
    });
});