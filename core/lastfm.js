var LastFmNode = require('lastfm').LastFmNode;

var lastfm = new LastFmNode({
	api_key: '2e55eb71c0906983feda3a54452f85cf',
	secret: '4381daef6a9f8b64a66d9406c6bb3811'
});

var updatingInfo = false;

module.exports = {
	currentSongInfo:  null,
	updateInfo: function(songInfo) {
		if (updatingInfo || (module.exports.currentSongInfo &&
			songInfo.artist === module.exports.currentSongInfo.artist.name &&
			songInfo.song === module.exports.currentSongInfo.name)) {
			return;
		}

		updatingInfo = true;
		console.log('Updating LastFM info: ', songInfo);
		lastfm.request('track.getInfo', {
			artist: songInfo.artist,
			track: songInfo.song,
			handlers: {
				success: function(json) {
					module.exports.currentSongInfo = json.track;

					var duration = {};
					duration.minutes = Math.floor(json.track.duration / 60000);
					duration.seconds = Math.floor(json.track.duration / 1000) - duration.minutes * 60;
					module.exports.currentSongInfo.duration = duration;

					updatingInfo = false;
					console.log('Current song info updated!');
				},
				error: function(err) {
					console.log('error track.getInfo: ', err);
					module.exports.currentSongInfo = null;
					updatingInfo = false;
				}
			}
		});
	}
};
