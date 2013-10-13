var events = require('events');
var emitter = new events.EventEmitter();
var _ = require('underscore');
var http = require('http');

var apikey = "7d49936a81297dde382b8bdd85d41d5c";

module.exports = _.extend(emitter, {
	currentSongInfo: null,
	updateInfo: function(songInfo) {
		console.log('Updating FanartTV info: ', songInfo);
		var artistId = songInfo.artistId;
		var url = "http://api.fanart.tv/webservice/artist/"+apikey+"/"+artistId+"/json/artistbackground/1/1/";
		var body = '';
		var request = http.get(url, function(response) {
			response.on('data', function(chunk) {
				body += chunk;
			});
			response.on('end', function() {
				try {
					if (response.statusCode == 200) {
						var json = JSON.parse(body);
						module.exports.currentSongInfo = data;
						emitter.emit('fanarttvInfoUpdated');
					} else {
						console.log('Received an error HTTP status code: ', response.statusCode);
					}
				} catch (error) {
					console.log('Error while processing response from FanartTV');
				}
			});
		});
	}
});