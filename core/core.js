var events = require('events');
var emitter = new events.EventEmitter();
var sampler = require('./fpsampler');
var enest = require('./enest');
var _ = require('underscore');
var lastfm = require('./lastfm');
var fanarttv = require('./fanarttv');

var running = false;

var update = function(done) {
  sampler.sample(function(hash) {
    try {
      hash = JSON.parse(hash)[0].code;
      enest.lookUp(hash, function(error, songInfo) {
        if (!error && module.exports.nowPlaying.songId !== songInfo.songId) {
          module.exports.nowPlaying = songInfo;
          emitter.emit("songChange");
          lastfm.updateInfo(songInfo);
          fanarttv.updateInfo(songInfo);
          console.log('Updated song info');
        } else {
          console.log('Error while looking up song metadata from Echo Nest: ' + error);
        }
        done();
      });
    } catch (error) {
      console.log('Parsing track info failed: ' + error);
    }
  });
};

module.exports = _.extend(emitter, {
	nowPlaying: {},
	start: function() {
		running = true;

		function doNextUpdate() {
			if (running) {
				update(doNextUpdate);
			}
		}

		doNextUpdate();
	},
	stop: function() {
		running = false;
	}
});
