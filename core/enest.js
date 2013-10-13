var count = 0;

var credentials = require('./enest-credentials.js');

var http = require('http');
var querystring = require('querystring');

module.exports = {
  lookUp: function(hash, done) {
    var url = 'http://developer.echonest.com/api/v4/song/identify?' +
        'api_key=' + credentials.apiKey + '&version=4.12' + '&code=' + hash;
    var body = '';
    var request = http.get(url, function(response) {
      response.on('data', function(chunk) {
        body += chunk;
      });
      response.on('end', function() {
        try {
          if (response.statusCode == 200) {
            var json = JSON.parse(body);
            var songInfo = {
              artist: '',
              song: ''
            };
            console.log("Echo Nest reports " + json.response.songs.length + " matching songs\n");
            if (json.response.songs.length > 0) {
              var song = json.response.songs[0];
              songInfo.artist = song.artist_name || '';
              songInfo.song = song.title || '';
              songInfo.artistId = song.artist_id;
              songInfo.songId = song.id;
              done(null /* no error */, songInfo);
            } else {
              done(new Error("No songs found"));
            }
          } else {
            done('Received an error HTTP status code: ' + response.statusCode);
          }
        } catch (error) {
          done('Error while processing response from Echo Nest');
        }
      });
    });
    request.on('error', function(error) {
      console.log('Got error while fetching track metadata from Echo Nest: ' + error.message);
    });
  }
};


