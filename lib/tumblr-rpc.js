var _ = require('lodash');
var tumblr = require('tumblr-pool.js');

var dummyLogger = {
  info: function() {
    console.log('INFORMATION: ', arguments);
  },
  error: function() {
    console.log('ERRORKA: ', arguments);
  }
};


function listen(options) {
  options = _.defaults(options || {}, {
    queueName: 'tumblr-rpc',
    logger: dummyLogger
  });
  var rpc = require('amqp-rpc').factory({
    url: options.url
  });
  rpc.on(options.queueName, function(task, cb) {
    var client = tumblr.createClient(_.assign(task.credentials, {
      logger: options.logger
    }));
    client[task.action].apply(tumblr, task.params.concat([function(err, res) {
      cb(err, res);
    }]));
  });
}

module.exports = {
//  tumblr: require('./tumblrWrapper'),
  listen: listen
};
