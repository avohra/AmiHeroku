var express = require('express');
var router = express.Router();


var crypto = require('crypto'),require('crypto-aes-ctr'),
algorithm = 'aes-256-ctr',
password = 'd6F3Efeq';

router.get('/', function(req, res) {
	console.log('access token from redis '+req.session.accesstoken);
	console.log('url from redis '+req.session.sfdcurl);
	    res.render('pages/home', {
	    	accesstoken: encrypt(req.session.accesstoken),
	    	sfdcurl: req.session.sfdcurl,
	    	orgid: req.session.orgid,
	    	namespace: process.env['SF_NAMESPACE'],
	    	idletime: process.env['SESSION_IDLE_TIME']
    });
});



function encrypt(text){
	var cipher = crypto.createCipher(algorithm,password)
	var crypted = cipher.update(text,'utf8','hex')
	crypted += cipher.final('hex');
	return crypted;
}

module.exports = router;