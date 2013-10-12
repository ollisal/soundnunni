var sampler = require('./fpsampler');
var enest = require('./enest');

var running = false;

var update = function(done) {
	sampler.sample(function(hash) {
		enest.lookUp(hash, function(songInfo) {
			module.exports.nowPlaying = songInfo;
			done();
		});
	});
};

module.exports = {
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
};