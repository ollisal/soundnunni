var count = 0;

var credentials = require('./enest-credentials.js');

var http = require('http');
var querystring = require('querystring');

module.exports = {
  lookUp: function(hash, done) {
    var url = 'http://developer.echonest.com/api/v4/song/identify?' +
      querystring.stringify({
        code: hash,
        api_key: credentials.apiKey
      });
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
            if (json.response.songs.length > 0) {
              var song = json.response.songs[0];
              songInfo.artist = song.artist_name || '';
              songInfo.song = song.title || '';
              songInfo.artistId = song.artist_id;
              songInfo.songId = song.id;
            }
            done(null /* no error */, songInfo);
            return; // success
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


