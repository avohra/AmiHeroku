var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	console.log('access token from redis '+req.session.accesstoken);
	console.log('url from redis '+req.session.sfdcurl);
	    res.render('pages/home', {
	    	accesstoken: req.session.accesstoken,
	    	sfdcurl: req.session.sfdcurl,
	    	orgid: req.session.orgid,
	    	namespace: process.env['SF_NAMESPACE'],
	    	idletime: process.env['IDLE_TIME']
    });
});

module.exports = router;