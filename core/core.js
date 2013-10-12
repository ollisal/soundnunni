var events = require('events');
var emitter = new events.EventEmitter();
var sampler = require('./fpsampler');
var enest = require('./enest');
var _ = require('underscore');
var lastfm = require('./lastfm');

var running = false;

var update = function(done) {
	sampler.sample(function(hash) {
		enest.lookUp(hash, function(songInfo) {
			module.exports.nowPlaying = songInfo;
			emitter.emit("songChange");
			lastfm.updateInfo(songInfo);
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
