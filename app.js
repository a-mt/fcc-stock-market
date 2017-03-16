var express = require('express'),
    app     = express(),
    routes  = require('./app/routes/index.js'),
    fs      = require('fs');

require('dotenv').load();

// Persist stock list in a simple file
global.stocks = {};
try {
    fs.readFile(process.env.DB, 'utf8', function (err, data) {
    	if(!err && data) {
    		global.stocks = JSON.parse(data);
    	}
    });
} catch(e) {}

app.set('view engine', 'pug');
app.use('/public', express.static(process.cwd() + '/public'));
routes(app);

// Set user variable for views
app.use(function(req, res, next){
    res.locals.APP_URL = process.env.APP_URL;
    next();
});

// Start server
var port = process.env.PORT || 8080;
var server = app.listen(port, function(){
   console.log('The server is running on port ' + port); 
});

// Start socket handler
var MarketDataHandler = require(process.cwd() + '/app/controllers/marketData.js');
var io = require('socket.io')(server);

app.use(function(req, res, next) {
  req.io = io;
  next();
});
io.on('connection', function(socket){
    socket.on('add', function(value){
       MarketDataHandler.add(value, {io: io, socket: socket});
    });
    socket.on('remove', function(value){
       MarketDataHandler.remove(value, {io: io, socket: socket});
    });
});