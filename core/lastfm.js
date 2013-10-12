var LastFmNode = require('lastfm').LastFmNode;
var events = require('events');
var _ = require('underscore');

var emitter = new events.EventEmitter();
var lastfm = new LastFmNode({
	api_key: '2e55eb71c0906983feda3a54452f85cf',
	secret: '4381daef6a9f8b64a66d9406c6bb3811'
});

var updatingInfo = false;
var lastFmSession = null;

module.exports = _.extend(emitter, {
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
					emitter.emit('lastFmInfoUpdated');

					module.exports.scrobbleCurrentlyPlaying();
				},
				error: function(err) {
					console.log('error track.getInfo: ', err);
					module.exports.currentSongInfo = null;
					updatingInfo = false;
				}
			}
		});
	},
	scrobbleCurrentlyPlaying: function() {
		if (!lastFmSession ||
			!module.exports.currentSongInfo ||
			!module.exports.currentSongInfo.name ||
			!module.exports.currentSongInfo.artist) {
			return;
		}

		console.log('Scrobbling currently playing track.');

		lastfm.update('scrobble', lastFmSession, {
			track: module.exports.currentSongInfo.name,
			artist: module.exports.currentSongInfo.artist.name,
			timestamp: Math.ceil(new Date().getTime() / 1000),
			handlers: {
				success: function() {
					console.log('Succesfully scrobbled track!');
				},
				retrying: function(retry) {
					console.log('Retrying scrobbling: ', retry);
				},
				error: function(err) {
					console.log('Error scrobblign: ', err);
				}
			}
		});
	},
	getAuthenticationUrl: function(callbackUrl) {
		return 'http://www.last.fm/api/auth/?api_key=' + lastfm.api_key +
			'&cb=' + callbackUrl;
	},
	startSession: function(token) {
		lastfm.session({
			token: token,
			handlers: {
				success: function(session) {
					console.log('Session started!');
					lastFmSession = session;
					emitter.emit('lastFmScrobblingStatusChanged');
				},
				retrying: function(retry) {
					console.log('Retrying session: ', retry);
				},
				error: function(err) {
					console.log('Error starting session: ', err);
				}
			}
		});
	},
	isSessionActive: function() {
		return !!lastFmSession;
	}
});
