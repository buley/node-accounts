/* node-accounts */

/* Supports:
 * 	* Twitter
 * 	* Facebook
 * 	* Google
 * 	* Foursquare
 */

/* 
 * Install:
 * 	npm install oauth
 * */

var OAuth = require("oauth").OAuth
, OAuth2 = require("oauth").OAuth2
, OAuthUtils = require('oauth/lib/_utils.js')

var service = {}, Public = {};

var Accounts = function( path ) {

	if( 'undefined' === typeof path || null === path ) {
		path = './oauth.secrets';
	}

	var auth_keys = require( path ); 

	for( var key in auth_keys ) { 
		global[ key ]= auth_keys[ key ]; 
	}

	// Twitter (oAuth 1)
	service.twitter = new OAuth("https://api.twitter.com/oauth/request_token", "https://api.twitter.com/oauth/access_token", twitterId, twitterSecret, "1.0", twitterCallbackAddress || null, "HMAC-SHA1");

	// Facebook (oAuth 2)
	service.facebook = new OAuth2( facebookId, facebookSecret, "https://graph.facebook.com" );

	// Google (oAuth 2)
	service.google = new OAuth2( googleId, googleSecret,  "", "https://accounts.google.com/o/oauth2/auth", "https://accounts.google.com/o/oauth2/token" );

	// Foursquare (oAuth 2)
	service.foursquare = new OAuth2( foursquareId, foursquareSecret, "https://foursquare.com", "/oauth2/authenticate", "/oauth2/access_token", "HMAC-SHA1" );
	service.foursquare.setAccessTokenName("oauth_token");

};

exports.login = function( data ) {
	//handle_account( data );
	if( 'twitter' == data.service ) {
		console.log('service', data.service );
		Accounts.handle_twitter( data, socket );
	} else if( 'google' === data.service ) {
		console.log('service', data.service );
		Accounts.handle_google( data, socket );
	} else if( 'facebook' === data.service ) {
		console.log('service', data.service );
		Accounts.handle_facebook( data, socket );
	} else if( 'foursquare' === data.service ) {
		console.log('service', data.service );
		Accounts.handle_foursquare( data, socket );
	} else if( 'evernote' === data.service ) {
		console.log('service', data.service );
		Accounts.handle_evernote( data, socket );
	}
}

Accounts.handle_evernote = function( params, socket ) {

	if( params && 'logout' == params.command ) {
		socket.emit( 'response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'evernote'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );
		console.log( 'disconnect google' );
	} else if( params && 'connect' == params.command ) {

		service.evernote.get( "https://www.evernote.com/oauth", params.access_token, params.access_token_secret, function (error, data, result ) {
	
			if( error ) { 

				socket.emit( 'response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'evernote'
					, 'account_status': 'unauthorized'
					, 'connect_status': 'disconnected'
					, 'message': params.message
				} );

			} else {

				socket.emit( 'response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'evernote'
					, 'account_status': 'authorized'
					, 'connect_status': 'connected'
					, 'profile_data': JSON.parse( data )
					, 'message': params.message
				} );

				console.log( 'connect evernote' );

			}
		} );
	} else if( params && params.denied ) {

		console.log( 'Denied access' );

		socket.emit( 'response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'evernote'
			, 'account_status': 'unauthorized'
		} );



	} else if( params && params.oauth_token && params.oauth_verifier ) {

		console.log( 'Requesting access token' );

		service.evernote.getOAuthAccessToken(params.oauth_token, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {
			console.log('oauth access stuff', oauth_access_token, oauth_access_token_secret, additionalParameters );
			if( error ) {
				socket.emit( 'response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'evernote'
					, 'account_status': 'unauthorized'
				} );


				console.log( 'Error retrieving the OAuth Access Token: ', error );

			} else {

				//http://api.evernote.com/1/account/verify_credentials.json
				console.log('verifying w/access token and secret', oauth_access_token, oauth_access_token_secret );

				service.evernote.get( "https://www.evernote.com/oauth", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {
					var response = {
						'success': true
						, 'response_type': 'account'
						, 'service': 'evernote'
						, 'account_status': 'authorized'
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
						, 'profile_data': JSON.parse( data )
					};
					console.log('RESPONSE', response );
					socket.emit( 'response', response );

				} );

			}
										
		} );
	} else {

		console.log( 'Retrieving request token' );

		service.evernote.getOAuthRequestToken(function(error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {
			if(error) {
				console.log( 'Error retrieving the OAuth Request Token: ', error );
				var response = { 'success': false, 'response_type': 'account', 'service': 'evernote' };
				socket.emit( 'response', response );
				callback(null); // Ignore the error upstream, treat as validation failure.
			} else {

				console.log( 'Retrieved request token' );
				var response = { 'success': true, 'response_type': 'account', 'service': 'evernote', 'login_url': "http://evernote.com/oauth/authenticate?oauth_token=" + oauth_request_token, 'request_token': oauth_request_token, 'request_token_secret': oauth_request_token_secret };
				console.log( response );
				socket.emit( 'response', response );

			}
		});
	}

//

}


Accounts.handle_twitter = function( params, socket ) {

	if( params && 'logout' == params.command ) {
		socket.emit( 'response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'twitter'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );
		console.log( 'disconnect google' );
	} else if( params && 'connect' == params.command ) {
		service.twitter.get( "https://api.twitter.com/1/account/verify_credentials.json", params.access_token, params.access_token_secret, function (error, data, result ) {
	
			if( error ) { 

				socket.emit( 'response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'twitter'
					, 'account_status': 'unauthorized'
					, 'connect_status': 'disconnected'
					, 'message': params.message
				} );

			} else {

				socket.emit( 'response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'twitter'
					, 'account_status': 'authorized'
					, 'connect_status': 'connected'
					, 'profile_data': JSON.parse( data )
					, 'message': params.message
				} );

				console.log( 'connect twitter' );

				var twitter_api = new twitter( {
					consumer_key: twitterId,
					consumer_secret: twitterSecret,
					access_token_key: params.access_token,
					access_token_secret: params.access_token_secret
				} );

				//twitter_api.stream('search', {'filter': 'Google OR Amazon OR Microsoft'}, function(stream) {
				twitter_api.stream('user', {}, function(stream) {

					stream.on( 'data', function (datum) {
						if( !!datum.friends ) {
							console.log('FRIENDs DEAL', stream);
							//return;
						}
						var tweet = Buleys.stream.map.tweet( datum );
						if( 'undefined' !== typeof datum.text ) {

							var text = tweet.object.summary + " " + tweet.object.content;
							console.log('CLASSY2', text );
							var classified = classifier.classify( text );
							console.log('minimum', text, classified );
							if( null === classified ) {
                                                                classified = [ { 'topic': 'none', 'score': 0 } ];
								
							}


							var words = new pos.Lexer().lex( text );

							var tagged = new pos.Tagger().tag( words );

							var data = {};

							if( null === classified ) {
								classified = [ { 'topic': 'none_none', 'score': 0 } ];					
							} else {

								data.activity = tweet;
								data.type = 'tweet';
								data.tagged = tagged;
								data.entities = classified;
								socket.emit('data', data );

							}
						}
					});

				} );
		




			}
		} );
	} else if( params && params.denied ) {

		console.log( 'Denied access' );

		socket.emit( 'response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'twitter'
			, 'account_status': 'unauthorized'
		} );



	} else if( params && params.oauth_token && params.oauth_verifier ) {

		console.log( 'Requesting access token' );

		service.twitter.getOAuthAccessToken(params.oauth_token, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {
			console.log('oauth access stuff', oauth_access_token, oauth_access_token_secret, additionalParameters );
			if( error ) {
				socket.emit( 'response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'twitter'
					, 'account_status': 'unauthorized'
				} );


				console.log( 'Error retrieving the OAuth Access Token: ', error );

			} else {

				//http://api.twitter.com/1/account/verify_credentials.json
				console.log('verifying w/access token and secret', oauth_access_token, oauth_access_token_secret );

				service.twitter.get( "https://api.twitter.com/1/account/verify_credentials.json", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {
					var response = {
						'success': true
						, 'response_type': 'account'
						, 'service': 'twitter'
						, 'account_status': 'authorized'
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
						, 'profile_data': JSON.parse( data )
					};
					console.log('RESPONSE', response );
					socket.emit( 'response', response );

				} );

			}
										
		} );
	} else {

		console.log( 'Retrieving request token' );

		service.twitter.getOAuthRequestToken(function(error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {
			if(error) {
				console.log( 'Error retrieving the OAuth Request Token: ', error );
				var response = { 'success': false, 'response_type': 'account', 'service': 'twitter' };
				socket.emit( 'response', response );
				callback(null); // Ignore the error upstream, treat as validation failure.
			} else {

				console.log( 'Retrieved request token' );
				var response = { 'success': true, 'response_type': 'account', 'service': 'twitter', 'login_url': "http://twitter.com/oauth/authenticate?oauth_token=" + oauth_request_token, 'request_token': oauth_request_token, 'request_token_secret': oauth_request_token_secret };
				console.log( response );
				socket.emit( 'response', response );

			}
		});
	}

//

}

Accounts.handle_facebook = function( params, socket ) {
	console.log("FACEBOOK REQUEST", params );
	if( params && 'connect' == params.command ) {
		service.facebook.getProtectedResource( "https://graph.facebook.com/me", params.access_token, function ( error, data, response ) {
			if( error ) {

				socket.emit( 'response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'facebook'
					, 'account_status': 'unauthorized'
					, 'connect_status': 'disconnected'
					, 'message': params.message
				} );

				console.log( 'Error retrieving profile' );

			} else {


				//TODO: auth
				socket.emit( 'response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'facebook'
					, 'account_status': 'authorized'
					, 'connect_status': 'connected'
					, 'profile_data': JSON.parse( data )
					, 'message': params.message
				} );

			}
		} );

	} else if( params && 'logout' == params.command ) {
		//https://www.facebook.com/logout.php?next=YOUR_URL&access_token=ACCESS_TOKEN

		var logout_url, account_status;
		if( 'undefined' == typeof params.access_token || null == params.access_token ) {
			logout_url = null;
			account_status = 'unauthorized';
		} else {
			logout_url = 'https://www.facebook.com/logout.php?next=' + encodeURIComponent( 'http://www.reporters.co/?service=facebook&logout=true' ) + '&access_token=' + params.access_token;
			account_status = 'authorized';
		}

		socket.emit( 'response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'facebook'
			, 'account_status': account_status
			, 'logout_url': logout_url
			, 'message': params.message
		} );
		console.log( 'disconnect facebook' );
	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {
		if( params.error_reason == 'user_denied' ) {
	
			socket.emit( 'response', {
				'success': true
				, 'response_type': 'account'
				, 'service': 'facebook'
				, 'account_status': 'unauthorized'
			} );
			console.log( 'Access denied' );
		} else {
			service.facebook.getOAuthAccessToken(params && params.code, { redirect_uri: facebookCallbackAddress }, function( error, access_token ){	
				if( error ) { 
					socket.emit( 'response', {
						'success': false
						, 'response_type': 'account'
						, 'service': 'facebook'
						, 'account_status': 'unauthorized'
						, 'message': 'Error retrieving access token.'
					} );

					console.log( 'Error retrieving access token' );
				} else {
					service.facebook.getProtectedResource( "https://graph.facebook.com/me", access_token, function ( error, data, response ) {
						if( error ) {

							var result = { 'success': false, 'response_type': 'account', 'account_status': 'unauthorized', 'service': 'facebook' };
							socket.emit( 'response', result );
							
							console.log( 'Error retrieving profile' );

						} else {

							console.log( 'Facebook profile', JSON.parse( data ) );
							var result = { 'success': true, 'response_type': 'account', 'account_status': 'authorized', 'service': 'facebook', 'access_token': access_token, 'profile_data': JSON.parse( data ) };
							socket.emit( 'response', result );

						}

					});

				}

			});

		}

	} else {

		var redirect_url= service.facebook.getAuthorizeUrl( {redirect_uri: facebookCallbackAddress, scope: facebookScope } );
		socket.emit( 'response', { 'success': true, 'response_type': 'account', 'service': 'facebook', 'login_url': redirect_url } );

	}

}

Accounts.handle_google = function( params, socket ) {

	if( params && 'connect' == params.command ) {

		service.google.get( "https://www.googleapis.com/plus/v1/people/me", params.access_token, function(error, data){
			if( error ) {

				//TODO: Auth
				socket.emit( 'response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'google'
					, 'account_status': 'unauthorized'
					, 'connect_status': 'disconnected'
					, 'message': params.message
				} );
				console.log("Could not confirm Google", params );				

			} else {


				var profile = JSON.parse( data );
				//TODO: Auth
				socket.emit( 'response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'google'
					, 'account_status': 'authorized'
					, 'connect_status': 'connected'
					, 'profile_data': profile
					, 'message': params.message
				} );
				console.log("confirmed Google", params );
				

			}

		});


	} else if( params && 'logout' == params.command ) {
		socket.emit( 'response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'google'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );
		console.log( 'disconnect google' );
	} else if( params && ( params.code || params.error === 'access_denied' ) ) {

		if( params.error == 'access_denied' ) {
			console.log( 'Access denied' );

			socket.emit( 'response', {
				'success': true
				, 'response_type': 'account'
				, 'service': 'google'
				, 'account_status': 'unauthorized'
			} );

		} else {
			service.google.getOAuthAccessToken( params.code, { redirect_uri: googleCallbackAddress, grant_type: 'authorization_code' }, function( error, access_token, refresh_token ){
				if( error ) {
					socket.emit( 'response', { 'response_type': 'account', 'success': false, 'service': 'google', 'account_status': 'unauthorized' } );
					console.log('error getting access token', error );
				} else {
					console.log('got tokens', access_token, refresh_token,'id', options.appId, "https://www.googleapis.com/plus/v1/people/me?pp=1&access_token=" + access_token );
					console.log(service.google);
					service.google.get( "https://www.googleapis.com/plus/v1/people/me", access_token, function(error, data){
						if( error ) {
							console.log('failed getting Google profile', error );
							socket.emit( 'response', { 'response_type': 'account', 'success': true, 'service': 'google', 'account_status': 'authorized', 'access_token': access_token, 'refresh_token': refresh_token, 'profile_data': null } );
						} else {

							console.log( 'GOOGLE PROFILE', JSON.parse( data ) );
							socket.emit( 'response', { 'response_type': 'account', 'success': true, 'service': 'google', 'account_status': 'authorized', 'access_token': access_token, 'refresh_token': refresh_token, 'profile_data': JSON.parse( data ) } );

						}

					});

				}

			});

		}

	} else {

		var redirect_url= service.google.getAuthorizeUrl( { redirect_uri : googleCallbackAddress, scope: googleScope, response_type: 'code' } )
		socket.emit( 'response', { 'success': true, 'response_type': 'account', 'service': 'google', 'account_status': 'unauthorized', 'login_url': redirect_url } );

	}

}

Accounts.handle_foursquare = function( params, socket ) {
	
	if( params && 'connect' == params.command ) {

		service.foursquare.getProtectedResource( "https://api.foursquare.com/v2/users/self", params.access_token, function ( error, data, response ) {
				if( error ) {

					console.log( 'Error retrieving profile' );
					//TODO: Auth
					socket.emit( 'response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'foursquare'
						, 'account_status': 'unauthorized'
						, 'connect_status': 'disconnected'
						, 'message': params.message
					} );

				} else {

					var response = JSON.parse( data );
					var profile = response.response.user;
					//TODO: Auth
					socket.emit( 'response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'foursquare'
						, 'account_status': 'authorized'
						, 'connect_status': 'connected'
						, 'profile_data': profile
						, 'message': params.message
					} );
				}

				console.log("confirmed Foursquare", params );
			} );

	} else if( params && 'logout' == params.command ) {
		//https://www.facebook.com/logout.php?next=YOUR_URL&access_token=ACCESS_TOKEN
	
		socket.emit( 'response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'foursquare'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );
		console.log( 'disconnect foursquare' );
	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {
		if( params.error_reason == 'user_denied' ) {
			console.log( 'Access denied' );

			socket.emit( 'response', {
				'success': true
				, 'response_type': 'account'
				, 'service': 'foursquare'
				, 'account_status': 'unauthorized'
			} );
		} else if ( params ) {
			console.log('FOURSQUARE params', params.code, foursquareCallbackAddress );
			service.foursquare.getOAuthAccessToken( params.code, { redirect_uri: foursquareCallbackAddress, 'grant_type': 'authorization_code' }, function( error, access_token, refresh_token ){
				if( error ) { 
					console.log( 'Error retrieving access token', error );
					var result = { 'success': false, 'response_type': 'account', 'service': 'foursquare', 'account_status': 'unauthorized' };
					socket.emit( 'response', result );
				} else {
					service.foursquare.getProtectedResource( "https://api.foursquare.com/v2/users/self", access_token, function ( error, data, response ) {
						if( error ) {
							var result = { 'success': false, 'response_type': 'account', 'service': 'foursquare', 'account_status': 'unauthorized' };

							console.log( 'Error retrieving profile' );

						} else {

							var response = JSON.parse( data );
							var profile = response.response.user;
							console.log( 'Foursquare profile', JSON.parse( data ) );
							var result = { 'success': true, 'response_type': 'account', 'service': 'foursquare', 'account_status': 'authorized', 'access_token': access_token, 'refresh_token': refresh_token, 'profile_data': profile };

						}

						socket.emit( 'response', result );
					});

				}

			});

		}

	} else {

		var redirect_url= service.foursquare.getAuthorizeUrl( { redirect_uri: foursquareCallbackAddress, response_type: "code" } );
		socket.emit( 'response', { 'success': true, 'response_type': 'account', 'service': 'foursquare', 'account_status': 'unauthorized', 'login_url': redirect_url } );

	}

}

exports.logout = function( params ) {
	console.log('logging out');
};

Accounts.handle_login = function( params ) {

		console.log( 'params', params );
		if( "logout" == params.command ) {
			console.log('logging out');
			//req.logout();
		}
	
		if( "login" == params.command && params.service ) { 
			console.log( 'logggginging in', params.service ); 
			connect.middleware.authenticate( [ params.service ], function( error, authenticated ) { 
				console.log('whose drinking', error, authenticated );
				if( error ) { 
					console.log( error ); 
					//res.end(); 
				} else { 
					if( authenticated === undefined ) { 
						console.log( 'No Auth', authenticated );
						//res.end( 'Not authenticated' );
					} else { 
						console.log( 'Auth!', authenticated );
						//res.end( 'Authenticated?' );
					} 
				}
			} );
		}

		if( "confirm" == params.command ) {
			console.log( 'confirm', params.command );
			connect.middleware.authenticate( [ urlp.query.service ], function( error, authenticated ) { 
				console.log('whose drinking', error, authenticated );
				if( error ) { 
					console.log( error ); 
					//res.end(); 
				} else { 
					if( authenticated === undefined ) { 
						console.log( 'No Auth', authenticated );
						//res.end( 'Not authenticated' );
					} else { 
						console.log( 'Auth!', authenticated );
						//res.end( 'Authenticated?' );
					} 
				}
			} );console.log( 'signup', urlp.query.service );
			console.log( 'xyz', typeof req.authenticate );
		}

}

