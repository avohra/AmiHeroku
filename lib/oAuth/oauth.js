"use strict";

var connection = require('./connection'),
	knex = require('../Services/db').knex;
var oauth = {};

oauth.authenticate = function(req, res, app) {
	console.log('before oauth - '+req.query.code);
	connection.getOrg(req.session.env).authenticate({code: req.query.code}, function(err, resp){
		if(!err) {
			console.log('Access Token: ' + resp.access_token);
			req.session.accesstoken = resp.access_token;
			var id = resp.id;
			var idList = id.split('/');
			console.log('idList - '+idList);
			var userId = idList[idList.length-1];
			var orgId = idList[idList.length-2];
			console.log('oAuth val - '+JSON.stringify(resp));
			oauth.updateUserAndOrgIds(orgId, userId, resp.refresh_token, req.session.sfdcurl,req.session.env);
			res.redirect('/home?action=oauth');
		} else {
			console.log('Error: ' + err.message);
		}
	});
};

oauth.updateUserAndOrgIds = function(orgId, userId, refreshToken, orgUrl,orgType) {
	knex('ldlt_sfdc_oauth')
		.where('organisation_id', '<>', orgId)
		.insert({organisation_id: orgId, user_id: userId, refresh_token: refreshToken, organisation_url: orgUrl,organisation_type:orgType}).into('ldlt_sfdc_oauth')
		.catch(function(error) {
		    console.log('ERROR --> '+error);
		 });
	console.log('About to update');
	knex('ldlt_sfdc_oauth')
		.update({user_id: userId, refresh_token: refreshToken})
		.where('organisation_id', '=', orgId)
		.then()
		.catch(function(error) {
		    console.log('updateUserAndOrgIds ERROR --> '+error);
		});
	console.log('Updated');
};

oauth.redirectToHome = function(req, res, app){
	console.log(req.query.orgid);
	req.session.orgid = req.query.orgid;
	knex('ldlt_sfdc_oauth').where({
		organisation_id: req.query.orgid
	}).select('refresh_token', 'organisation_url','organisation_type').then(function(rows){
		console.log('rows[0].refresh_token --> '+rows[0].refresh_token);
		oauth.getATFromRT(req, res, rows[0]);
	})
	.catch(function(error) {
		console.log('redirectToHome ERROR --> '+error);
	});
};

oauth.revokeAccess = function(req, res) {
	knex('ldlt_sfdc_oauth').where({
		  organisation_id: req.query.orgid
		}).select('refresh_token','organisation_type').then(function(rows){
			var rowCount = rows.length;
			for(var i=0;i<rowCount;i++){
				req.session.env = rows[i].organisation_type;
				console.log('rows[0].refresh_token --> '+rows[i].refresh_token+':::'+req.session.env);
				connection.getOrg(req.query.env).revokeToken({token:rows[i].refresh_token},function(){});
			} 
		})
		.catch(function(error) {
			console.log('redirectToHome ERROR --> '+error);
		});
	
	
	knex('ldlt_sfdc_oauth')
		.where('organisation_id', '=', req.query.orgid)
		.del()
		.then()		
		.catch(function(error) {
		    console.log('Delete OAuth ERROR --> '+error);
		});
	console.log('Deleted OAuth');

	res.send({ success: null });
};

oauth.getATFromRT = function(req, res, dbRow){
	var oauth = {
		refresh_token : dbRow.refresh_token
	};
	req.session.env = dbRow.organisation_type;
	console.log('ORG TYPE : '+req.session.env+ ':: '+ dbRow.organisation_type);
	connection.getOrg(req.session.env).refreshToken({oauth: oauth}, function(err, resp){
		console.log('err - '+err);
		if(!err) {
			console.log('Access Token: ' + resp.access_token);
			req.session.accesstoken = resp.access_token;
			req.session.sfdcurl = dbRow.organisation_url;
			console.log('resp with new access token - '+JSON.stringify(resp));
			if(req.query.UNSC && req.query.UNSC == 'true'){
				res.redirect('/home?renId='+req.query.renId+'&UNSC=true');
			}else{
				res.redirect('/home?renId='+req.query.renId);
			}
			//res.redirect('/home?renId='+req.query.renId);
		} else {
			console.log('Within refreshToken - '+err);
			console.log('Error: ' + err.message);
		}
	});
}

oauth.redirectAuthURI = function(res,req) {
	res.redirect(connection.getOrg(req.session.env).getAuthUri());
};

module.exports = oauth;