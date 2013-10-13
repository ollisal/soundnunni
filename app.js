
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var url = require('url');
var core = require('./core/core');
var lastfm = require('./core/lastfm');
var fanarttv = require('./core/fanarttv');
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
  socket.emit('songChange');
  socket.emit('lastFmInfoUpdated');
  socket.emit('lastFmScrobblingStatusChanged', lastfm.isSessionActive());
});

app.get('/api/nowplaying', function(req, res) {
	res.send(core.nowPlaying);
});

app.get('/api/nowplaying/lastfm', function(req, res) {
  res.send(lastfm.currentSongInfo);
});

app.get('/api/nowplaying/fanarttv', function(req, res) {
  res.send(fanarttv.currentSongInfo);
});

app.get('/start-scrobbling', function(req, res) {
  var cbUrl = 'http://' + req.headers.host + '/last-fm-authenticated';
  res.redirect(lastfm.getAuthenticationUrl(cbUrl));
});

app.get('/last-fm-authenticated', function(req, res) {
  console.log('Authenticated!');
  var urlParts = url.parse(req.url, true);
  var query = urlParts.query;
  console.log('Token: ' + query.token);
  lastfm.startSession(query.token);
  res.redirect('');
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  core.start();
  core.on("songChange", function() {
    io.sockets.emit('songChange');
  });

  lastfm.on("lastFmInfoUpdated", function() {
    io.sockets.emit('lastFmInfoUpdated');
  });

  lastfm.on("lastFmScrobblingStatusChanged", function() {
    io.sockets.emit('lastFmScrobblingStatusChanged', lastfm.isSessionActive());
  });

  fanarttv.on("fanarttvInfoUpdated", function() {
    io.sockets.emit('fanarttvInfoUpdated');
  });
});
