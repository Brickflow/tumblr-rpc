var _ = require('lodash');
var tumblr = require('tumblr-pool.js');

var dummyLogger = {
  info: function() {
    console.log('INFORMATION: ', _.values(arguments));
  },
  error: function() {
    console.log('ERRORKA: ', _.values(arguments));
  }
};


function listen(options) {
  options = _.defaults(options || {}, {
    queueName: 'tumblr-rpc',
    tumblrCredentials: {
      consumer_key: '',
      consumer_secret: '',
      logger: dummyLogger
    }
  });
  var rpc = require('amqp-rpc').factory({
    url: options.url
  });

  rpc.on('tumblr-rpc', function(task, cb) {
    var client = tumblr.createClient(_.assign(task.credentials, {logger: dummyLogger }));
    client[task.action].apply(tumblr, task.params.concat([function(err, res) {
      cb(err, res);
    }]));
  });
}

module.exports = {
//  tumblr: require('./tumblrWrapper'),
  listen: listen
};