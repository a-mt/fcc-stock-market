var socket = io(APP_URL);
            
socket.on('connect', function(data) {
    console.log('Connected to web socket');
});
socket.on('error', function(err){
    console.error(err);
});

socket.on('errorMsg', function(err){
    alert(err);
});

socket.on('add', function(data) {
    var html = $('#list_item').html()
                  .replace(/{{label}}/g, data.label)
                  .replace(/{{symbol}}/g, data.symbol);

    $('#list').append(html);
});

socket.on('addline', function(data) {
    if(Chart) {
        Chart.addLine(JSON.parse(data));
    }
});

socket.on('remove', function(symbol){
   $('#list .item[data-symbol="' + symbol + '"]').remove();
   if(Chart) {
        Chart.removeLine(symbol);
    }
});