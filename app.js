
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var core = require('./core/core');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  core.start();
  setInterval(function() {console.log(core.nowPlaying);}, 1000);
});
