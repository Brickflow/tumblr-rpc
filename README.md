tumblr-rpc
==========

tumblr-rpc is a drop-in replacement for accessing tumblr.js via amqp-rpc.
It uses ``tumblr-pool.js``, which adds the ``logInfo`` field to the response

On the client (request):
------------------------

    var tumblrRPC = require('tumblr-rpc');
    var client = tumblrRPC.createClient({
      url: 'amqp://guest:guest@localhost:5672',
      
      // usual tumblr.js options: 
      consumer_key: '...', consumer_secret: '...',
      token: '...', token_secret: '...'
    });

On the server (queue consumer):
-------------------------------

    require('tumblr-rpc').listen({
      queueName: 'tumblr-rpc',
      url: 'amqp://guest:guest@localhost:5672
    });