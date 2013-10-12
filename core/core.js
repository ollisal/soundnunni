var events = require('events');
var emitter = new events.EventEmitter();
var sampler = require('./fpsampler');
var enest = require('./enest');
var _ = require('underscore');
var lastfm = require('./lastfm');

var running = false;

var update = function(done) {
  sampler.sample(function(hash) {
    enest.lookUp(hash, function(error, songInfo) {
      if (!error) {
        module.exports.nowPlaying = songInfo;
        emitter.emit("songChange");
        lastfm.updateInfo(songInfo);
        console.log('Updated song info');
      } else {
        console.log('Error while looking up song metadata from Echo Nest: ' + error);
      }
      done();
    });
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
