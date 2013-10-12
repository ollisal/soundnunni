var native = require('../sampler/sampler');

module.exports = {
	sample: function(cb) {
        return native.sample(cb);
	}
};