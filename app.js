
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var core = require('./core/core');
var lastfm = require('./core/lastfm');
var config = {
	port: 3000
};

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || config.port || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'ui/app')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Serve static index
//app.get('/', routes.index);

io.sockets.on('connection', function(socket) {
  socket.emit('songChange', core.nowPlaying);
  socket.emit('lastFmInfoUpdated');
});

app.get('/api/nowplaying', function(req, res) {
	res.send(core.nowPlaying);
});

app.get('/api/nowplaying/lastfm', function(req, res) {
  res.send(lastfm.currentSongInfo);
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  core.start();
  core.on("songChange", function() {
  	io.sockets.emit('songChange', core.nowPlaying);
  });

  lastfm.on("lastFmInfoUpdated", function() {
    io.sockets.emit('lastFmInfoUpdated');
  });
});
