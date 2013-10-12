var count = 0;

module.exports = {
	lookUp: function(hash, done) {
		setTimeout(function() { done({ artist: "Ylvis", song: "The Fox #" + count++ }); }, 200);
	}
};