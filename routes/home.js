var express = require('express');
var router = express.Router();
//var oauth = require('./lib/oAuth/oauth');
/*var redis = require('redis');
var port = process.env.PORT || 3000;
var redisClient = redis.createClient(port, 'localhost');
redisClient.on('connect', function() {
    console.log('Redis connected home ejs');
});*/

router.get('/', function(req, res) {
		/*redisClient.get((req.orgid + req.userid), function(err, reply){
			console.log('reply --> '+reply);
			req.app.locals.oauthtoken = reply;
		});*/
	    res.render('pages/home', {
	    	oauthtoken: req.app.locals.oauthtoken,
	        ouathLightningURL: req.app.locals.lightningEndPointURI
    });
});

module.exports = router;