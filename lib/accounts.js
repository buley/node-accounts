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
var subscribers = {};

var Private = function() {};

/* Yahoo */

Private.handle_yahoo = function( params, socket, type ) {

	if( params && 'logout' == params.command ) {

		//TODO: Destroy token
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'socket': socket
			, 'type': type
		} );
		
		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'yahoo'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && 'connect' == params.command ) {

		service.yahoo.get( "https://www.yahoo.com/oauth/authorize", params.access_token, params.access_token_secret, function (error, data, result ) {
	
			if( error ) { 
			
				//TODO: Destroy access token

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );

				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'yahoo'
					, 'account_status': 'unauthorized'
					, 'connect_status': 'disconnected'
					, 'message': params.message
				} );

			} else {

				var parsed = JSON.parsed( data );

				Private.publish( 'authorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'response': parsed } );
				
				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'yahoo'
					, 'account_status': 'authorized'
					, 'connect_status': 'connected'
					, 'profile_data': JSON.parse( data )
					, 'message': params.message
				} );

			}

		} );

	} else if( params && params.denied ) {

		//TODO: Destroy tokens

		Private.publish( 'unauthorized', { 'data': params, 'socket': socket, 'type': type } );

		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'yahoo'
			, 'account_status': 'unauthorized'
		} );

	} else if( params && params.oauth_token && params.oauth_verifier ) {

		service.yahoo.getOAuthAccessToken( params.oauth_token, params.oauth_token_secret, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {

			if( error ) {

				//TODO: Destroy tokens

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );

				socket.emit( '_acc_response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'yahoo'
					, 'account_status': 'unauthorized'
					, 'error': error
				} );

			} else {
	
				service.yahoo.get( "http://social.yahooapis.com/v1/me/guid?format=json", oauth_access_token, oauth_access_token_secret, function ( error1, data1, result1 ) {
					
					var parsed1 = JSON.parse( data1 );
					var guid = parsed1.guid.value;

					service.yahoo.get( "http://social.yahooapis.com/v1/user/" + guid + "/profile?format=json", oauth_access_token, oauth_access_token_secret, function ( error, data, result ) {

						var parsed = JSON.parse( data );

						Private.publish( 'authorized', {
							'data': params
							, 'socket': socket
							, 'type': type
							, 'response': parsed.profile
							, 'access_token': oauth_access_token
							, 'access_token_secret': oauth_access_token_secret
						} );

						socket.emit( '_acc_response', {
							'success': true
							, 'response_type': 'account'
							, 'service': 'yahoo'
							, 'account_status': 'authorized'
							, 'access_token': oauth_access_token
							, 'access_token_secret': oauth_access_token_secret
							, 'profile_data': parsed.profile
						} );
					} );
				} );

			}
										
		} );
	} else {
		console.log("service.yahoo.getOAuthRequestToken");
		service.yahoo.getOAuthRequestToken( function( error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {

			if(error) {
				
				//TODO: Destroy tokens

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );
				
				socket.emit( '_acc_response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'yahoo'
				} );

			} else {

				var authentication_url = "https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=" + oauth_request_token;

				Private.publish( 'authorizing', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'authorization_url': authentication_url
				} );

				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'yahoo'
					, 'login_url': authentication_url
					, 'request_token': oauth_request_token
					, 'request_token_secret': oauth_request_token_secret
				} );

			}
		});
	}

};


/* Linkedin */
Private.handle_linkedin = function( params, socket, type ) {

	if( params && 'logout' == params.command ) {

		//TODO: Destroy token
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'socket': socket
			, 'type': type
		} );
		
		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'linkedin'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && 'connect' == params.command ) {

		service.linkedin.get( "https://www.linkedin.com/uas/oauth/authenticate", params.access_token, params.access_token_secret, function (error, data, result ) {
	
			if( error ) { 
			
				//TODO: Destroy access token

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );

				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'linkedin'
					, 'account_status': 'unauthorized'
					, 'connect_status': 'disconnected'
					, 'message': params.message
				} );

			} else {

				var parsed = JSON.parsed( data );

				Private.publish( 'authorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'response': parsed } );
				
				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'linkedin'
					, 'account_status': 'authorized'
					, 'connect_status': 'connected'
					, 'profile_data': JSON.parse( data )
					, 'message': params.message
				} );

			}

		} );

	} else if( params && params.denied ) {

		//TODO: Destroy tokens

		Private.publish( 'unauthorized', { 'data': params, 'socket': socket, 'type': type } );

		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'linkedin'
			, 'account_status': 'unauthorized'
		} );

	} else if( params && params.oauth_token && params.oauth_verifier ) {

		service.linkedin.getOAuthAccessToken( params.oauth_token, params.oauth_token_secret, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {

			if( error ) {

				//TODO: Destroy tokens

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );

				socket.emit( '_acc_response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'linkedin'
					, 'account_status': 'unauthorized'
					, 'error': error
				} );

			} else {

				var profile_params = [ '.id', 'first-name', 'last-name', 'ma.iden-name', 'formatted-name', 'phonetic-first-name', 'phonetic-last-name', 'formatted-phonetic-name', 'headline', 'location', 'industry', 'distance', 'relation-to-viewer', 'last-modified-timestamp', 'current-share', 'network', 'connections', 'num-connections', 'num-connections-capped', 'summary', 'specialties', 'proposal-comments', 'associations', 'honors', 'interests', 'positions', 'publications', 'patents', 'languages', 'skills', 'certifications', 'educations', 'courses', 'volunteer', 'three-current-positions', 'three-past-positions', 'num-recommenders', 'recommendations-received', 'phone-numbers', 'im-accounts', 'twitter-accounts', 'primary-twitter-account', 'bound-account-types', 'mfeed-rss-url', 'following', 'job-bookmarks', 'group-memberships', 'suggestions', 'date-of-birth', 'main-address', 'member-url-resources', 'picture-url', 'site-standard-profile-request', 'api-standard-profile-request', 'public-profile-url', 'related-profile-views' ];
				service.linkedin.get( "http://api.linkedin.com/v1/people/~:(" + profile_params.join( ',' ) + ")", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {
					console.log( "LINKED IN DATA", data )
					var parsed = JSON.parse( data );
					Private.publish( 'authorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, 'response': parsed
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
					} );

					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'linkedin'
						, 'account_status': 'authorized'
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
						, 'profile_data': parsed
					} );

				}, { 'x-li-format': 'json' } );

			}
										
		} );
	} else {

		service.linkedin.getOAuthRequestToken( function( error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {

			if( error ) {
				
				//TODO: Destroy tokens

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );
				
				socket.emit( '_acc_response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'linkedin'
				} );

			} else {

				var authentication_url = "https://www.linkedin.com/uas/oauth/authenticate?oauth_token=" + oauth_request_token;

				Private.publish( 'authorizing', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'authorization_url': authentication_url
				} );

				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'linkedin'
					, 'login_url': authentication_url
					, 'request_token': oauth_request_token
					, 'request_token_secret': oauth_request_token_secret
				} );

			}
		});
	}

};




/* Tumblr */
Private.handle_tumblr = function( params, socket, type ) {

	if( params && 'logout' == params.command ) {

		//TODO: Destroy token
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'socket': socket
			, 'type': type
		} );
		
		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'tumblr'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && 'connect' == params.command ) {

		service.tumblr.get( "https://www.tumblr.com/oauth/authorize", params.access_token, params.access_token_secret, function (error, data, result ) {
	
			if( error ) { 

			
				//TODO: Destroy access token

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );

				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'tumblr'
					, 'account_status': 'unauthorized'
					, 'connect_status': 'disconnected'
					, 'message': params.message
				} );

			} else {

				var parsed = JSON.parsed( data );

				Private.publish( 'authorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'response': parsed } );
				
				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'tumblr'
					, 'account_status': 'authorized'
					, 'connect_status': 'connected'
					, 'profile_data': JSON.parse( data )
					, 'message': params.message
				} );

			}

		} );

	} else if( params && params.denied ) {

		//TODO: Destroy tokens

		Private.publish( 'unauthorized', { 'data': params, 'socket': socket, 'type': type } );

		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'tumblr'
			, 'account_status': 'unauthorized'
		} );

	} else if( params && params.oauth_token && params.oauth_verifier ) {

		service.tumblr.getOAuthAccessToken( params.oauth_token, params.oauth_token_secret, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {

			if( error ) {

				//TODO: Destroy tokens

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );

				socket.emit( '_acc_response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'tumblr'
					, 'account_status': 'unauthorized'
					, 'error': error
				} );

			} else {

				service.tumblr.get( "http://api.tumblr.com/v2/user/info", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {

					var parsed = JSON.parse( data );
					console.log("TUMBLR PARSED",parsed);
					Private.publish( 'authorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, 'response': parsed.response.user
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
					} );

					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'tumblr'
						, 'account_status': 'authorized'
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
						, 'profile_data': parsed.response.user
					} );

				} );

			}
										
		} );
	} else {

		service.tumblr.getOAuthRequestToken( function( error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {

			if(error) {
				
				//TODO: Destroy tokens

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );
				
				socket.emit( '_acc_response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'tumblr'
				} );

			} else {

				var authentication_url = "http://tumblr.com/oauth/authorize/?oauth_token=" + oauth_request_token;

				Private.publish( 'authorizing', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'authorization_url': authentication_url
				} );

				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'tumblr'
					, 'login_url': authentication_url
					, 'request_token': oauth_request_token
					, 'request_token_secret': oauth_request_token_secret
				} );

			}
		});
	}

};


Private.handle_twitter = function( params, socket, type ) {

	if( params && 'logout' == params.command ) {

		//TODO: Destroy token
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'socket': socket
			, 'type': type
		} );
		
		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'twitter'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && 'connect' == params.command ) {

		service.twitter.get( "https://api.twitter.com/1/account/verify_credentials.json", params.access_token, params.access_token_secret, function (error, data, result ) {
	
			// Check to see if profile request was successful, if it was
			// then the access token and access token secret are correct
	
			if( error ) { 

				Private.publish( 'unauthorized', { 'data': params, 'socket': socket, 'type': type } );

				if( 'socket' === type ) {
					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'twitter'
						, 'account_status': 'unauthorized'
						, 'connect_status': 'disconnected'
						, 'message': params.message
					} );
				}

			} else {

				var parsed = JSON.parse( data );
				Private.publish( 'authorized', { 'data': params, 'response': parsed, 'socket': socket, 'type': type } );
				
				if( 'socket' === type ) {
					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'twitter'
						, 'account_status': 'authorized'
						, 'connect_status': 'connected'
						, 'profile_data': parsed
						, 'message': params.message
					} );
				}

			}

		} );

	} else if( params && params.denied ) {

		Private.publish( 'unauthorized', { 'data': params, 'socket': socket, 'type': type } );
		
		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'twitter'
			, 'account_status': 'unauthorized'
		} );

	} else if( params && params.oauth_token && params.oauth_verifier ) {

		service.twitter.getOAuthAccessToken(params.oauth_token, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {

			console.log('oauth access stuff', oauth_access_token, oauth_access_token_secret, additionalParameters );

			if( error ) {

				//TODO: Destroy tokens

				Private.publish( 'unauthorized', { 'data': params, 'socket': socket, 'type': type, 'error': error } );

				socket.emit( '_acc_response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'twitter'
					, 'account_status': 'unauthorized'
				} );

			} else {

				service.twitter.get( "https://api.twitter.com/1/account/verify_credentials.json", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {

					var parsed = JSON.parse( data );

					Private.publish( 'authorized', { 'data': params, 'socket': socket, 'type': type, 'response': parsed, 'access_token': oauth_access_token, 'access_token_secret': oauth_access_token_secret } );

					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'twitter'
						, 'account_status': 'authorized'
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
						, 'profile_data': parsed
					} );

				} );

			}

		} );

	} else {

		console.log( "service.twitter.getOAuthRequestToken()", oauth_request_token, oauth_request_token_secret, oauth_authorize_url )
		service.twitter.getOAuthRequestToken(function(error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {
			console.log( "service.twitter.getOAuthRequestToken()", error )
			if( error ) {

				//TODO: Destroy tokens

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );
				
				socket.emit( '_acc_response', {
					'success': false
					, 'response_type': 'account'
					, 'service': 'twitter'
					, 'error': error
				} );

			} else {

				var authentication_url = "http://twitter.com/oauth/authenticate?oauth_token=" + oauth_request_token;
			console.log( "service.twitter.getOAuthRequestToken() > authentication_url", authentication_url )
				Private.publish( 'authorizing', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'authorization_url': authentication_url
					, 'request_token': oauth_request_token
					, 'request_token_secret': oauth_request_token_secret
				} );	

				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'twitter'
					, 'login_url': authentication_url
					, 'request_token': oauth_request_token
					, 'request_token_secret': oauth_request_token_secret
				} );

			}

		});

	}

};

Private.handle_facebook = function( params, socket, type ) {

	if( params && 'connect' == params.command ) {

		service.facebook.get( "https://graph.facebook.com/me", params.access_token, function ( error, data, response ) {
			if( error ) {

				//TODO: Destroy token
				
				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );
	
				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'facebook'
					, 'account_status': 'unauthorized'
					, 'connect_status': 'disconnected'
					, 'message': params.message
				} );

			} else {

				//TODO: Destroy token
				
				var parsed = JSON.parse( data );

				Private.publish( 'authorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'response': parsed
				} );
			

				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'facebook'
					, 'account_status': 'authorized'
					, 'connect_status': 'connected'
					, 'profile_data': parsed
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

		//TODO: Destroy token
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'socket': socket
			, 'type': type
		} );
		
		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'facebook'
			, 'account_status': account_status
			, 'logout_url': logout_url
			, 'message': params.message
		} );

		//TODO: Destroy token
	
	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {
		if( params.error_reason == 'user_denied' ) {
	
			Private.publish( 'unauthorized', { 'data': params, 'socket': socket, 'type': type } );
			
			socket.emit( '_acc_response', {
				'success': true
				, 'response_type': 'account'
				, 'service': 'facebook'
				, 'account_status': 'unauthorized'
			} );

		} else {
			service.facebook.getOAuthAccessToken(params && params.code, { redirect_uri: facebook.callback }, function( error, access_token ){	
				if( error ) { 
					socket.emit( '_acc_response', {
						'success': false
						, 'response_type': 'account'
						, 'service': 'facebook'
						, 'account_status': 'unauthorized'
						, 'message': 'Error retrieving access token.'
					} );

					Private.publish( 'unauthorized', { 'data': params, 'socket': socket, 'type': type, 'error': error } );
				
				} else {
					service.facebook.get( "https://graph.facebook.com/me", access_token, function ( error, data, response ) {
						if( error ) {

							var result = { 'success': false, 'response_type': 'account', 'account_status': 'unauthorized', 'service': 'facebook' };
							socket.emit( '_acc_response', result );
							
							console.log( 'Error retrieving profile' );

						} else {

							console.log( 'Facebook profile', JSON.parse( data ) );
							var result = { 'success': true, 'response_type': 'account', 'account_status': 'authorized', 'service': 'facebook', 'access_token': access_token, 'profile_data': JSON.parse( data ) };
							socket.emit( '_acc_response', result );

						}

					});

				}

			});

		}

	} else {

		var redirect_url = service.facebook.getAuthorizeUrl( { redirect_uri: facebook.callback, scope: facebook.scope } );

		Private.publish( 'authorizing', { 'data': params, 'socket': socket, 'type': type, 'authorization_url': redirect_url } );

		socket.emit( '_acc_response', { 'success': true, 'response_type': 'account', 'service': 'facebook', 'login_url': redirect_url } );

	}

};

Private.handle_windows = function( params, socket, type ) {
	console.log( 'windows', params );	
	if( params && 'connect' == params.command ) {

		service.windows.get( "https://apis.live.net/v5.0/me/?access_token=" + params.access_token, null, function ( error, data, response ) {
				if( error ) {

					Private.publish( 'unauthorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, 'error': error
					} );
					
					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'windows'
						, 'account_status': 'unauthorized'
						, 'connect_status': 'disconnected'
						, 'message': params.message
					} );

				} else {

					var response = JSON.parse( data );
					var profile = response.response.user;
			
					Private.publish( 'authorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, '_acc_response': profile
						, 'access_token': params.access_token
						, 'refresh_token': params.refresh_token
					} );

					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'windows'
						, 'account_status': 'authorized'
						, 'connect_status': 'connected'
						, 'profile_data': profile
						, 'message': params.message
					} );
				}

			} );

	} else if( params && 'logout' == params.command ) {
	
		//TODO: Destroy token
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'socket': socket
			, 'type': type
		} );

		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'windows'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {

		if( params.error_reason == 'user_denied' ) {

			Private.publish( 'unauthorized', {
				'data': params
				, 'socket': socket
				, 'type': type
			} );

			socket.emit( '_acc_response', {
				'success': true
				, 'response_type': 'account'
				, 'service': 'windows'
				, 'account_status': 'unauthorized'
			} );

		} else {

			service.windows.getOAuthAccessToken( params.code, { 
				'grant_type': 'authorization_code'
				, redirect_uri: windows.callback
			}, function( error, access_token, refresh_token ){

				if( error ) { 

					Private.publish( 'unauthorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, 'error': error
						, 'access_token': access_token
						, 'refresh_token': refresh_token
					} );

					socket.emit( '_acc_response', {
						'success': false
						, 'response_type': 'account'
						, 'service': 'windows'
						, 'account_status': 'unauthorized'
						, 'error': error
						, 'access_token': access_token
						, 'refresh_token': refresh_token
					} );



				} else {
					service.windows.get( "https://apis.live.net/v5.0/me/?access_token=" + access_token, null, function ( error, data, response ) {

						if( error ) {

							Private.publish( 'unauthorized', {
								'data': params
								, 'socket': socket
								, 'type': type
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							socket.emit( '_acc_response', {
								'success': false
								, 'response_type': 'account'
								, 'service': 'windows'
								, 'account_status': 'unauthorized'
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );


						} else {

							var response = JSON.parse( data );

							Private.publish( 'authorized', {
								'data': params
								, 'socket': socket
								, 'type': type
								, '_acc_response': response
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							socket.emit( '_acc_response', {
								'success': true
								, 'response_type': 'account'
								, 'service': 'windows'
								, 'account_status': 'authorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile_data': response
							} );

						}

					});

				}

			});

		}

	} else {

		var redirect_url = service.windows.getAuthorizeUrl( {
			redirect_uri: windows.callback
			, response_type: "code"
			, scope: windows.scope
		} );

		Private.publish( 'authorizing', {
			'data': params
			, 'socket': socket
			, 'type': type
			, 'authorization_url': redirect_url
		} );

		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'windows'
			, 'account_status': 'unauthorized'
			, 'login_url': redirect_url
		} );

	}

};


Private.handle_github = function( params, socket, type ) {
	
	if( params && 'connect' == params.command ) {

		service.github.get( "https://api.github.com/user", params.access_token, function ( error, data, response ) {
				if( error ) {

					Private.publish( 'unauthorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, 'error': error
					} );
					
					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'github'
						, 'account_status': 'unauthorized'
						, 'connect_status': 'disconnected'
						, 'message': params.message
					} );

				} else {

					var response = JSON.parse( data );
					var profile = response.response.user;
			
					Private.publish( 'authorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, '_acc_response': profile
						, 'access_token': params.access_token
						, 'refresh_token': params.refresh_token
					} );

					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'github'
						, 'account_status': 'authorized'
						, 'connect_status': 'connected'
						, 'profile_data': profile
						, 'message': params.message
					} );
				}

			} );

	} else if( params && 'logout' == params.command ) {
	
		//TODO: Destroy token
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'socket': socket
			, 'type': type
		} );

		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'github'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {

		if( params.error_reason == 'user_denied' ) {

			Private.publish( 'unauthorized', {
				'data': params
				, 'socket': socket
				, 'type': type
			} );

			socket.emit( '_acc_response', {
				'success': true
				, 'response_type': 'account'
				, 'service': 'github'
				, 'account_status': 'unauthorized'
			} );

		} else {

			service.github.getOAuthAccessToken( params.code, { 'grant_type': 'authorization_code' }, function( error, access_token, refresh_token ){

				if( error ) { 

					Private.publish( 'unauthorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, 'error': error
						, 'access_token': access_token
						, 'refresh_token': refresh_token
					} );

					socket.emit( '_acc_response', {
						'success': false
						, 'response_type': 'account'
						, 'service': 'github'
						, 'account_status': 'unauthorized'
						, 'error': error
					} );



				} else {

					service.github.get( "https://api.github.com/user", access_token, function ( error, data, response ) {

						if( error ) {

							Private.publish( 'unauthorized', {
								'data': params
								, 'socket': socket
								, 'type': type
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							socket.emit( '_acc_response', {
								'success': false
								, 'response_type': 'account'
								, 'service': 'github'
								, 'account_status': 'unauthorized'
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );


						} else {

							var response = JSON.parse( data );

							Private.publish( 'authorized', {
								'data': params
								, 'socket': socket
								, 'type': type
								, '_acc_response': response
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							socket.emit( '_acc_response', {
								'success': true
								, 'response_type': 'account'
								, 'service': 'github'
								, 'account_status': 'authorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile_data': response
							} );

						}

					});

				}

			});

		}

	} else {

		var redirect_url = service.github.getAuthorizeUrl( {
			redirect_uri: github.callback
			, scope: github.scope
			, response_type: "code"
		} );

		Private.publish( 'authorizing', {
			'data': params
			, 'socket': socket
			, 'type': type
			, 'authorization_url': redirect_url
		} );

		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'github'
			, 'account_status': 'unauthorized'
			, 'login_url': redirect_url
		} );

	}

};

Private.handle_google = function( params, socket, type ) {

	if( params && 'connect' == params.command ) {

		service.google.get( "https://www.googleapis.com/plus/v1/people/me", params.access_token, function( error, data ) {

			if( error ) {

				//TODO: Destroy tokens

				Private.publish( 'unauthorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, 'error': error
				} );

				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'google'
					, 'account_status': 'unauthorized'
					, 'connect_status': 'disconnected'
					, 'message': params.message
				} );

			} else {

				var profile = JSON.parse( data );
			
				Private.publish( 'authorized', {
					'data': params
					, 'socket': socket
					, 'type': type
					, '_acc_response': profile
					, 'access_token': params.access_token
					, 'refresh_token': params.refresh_token
				} );


				socket.emit( '_acc_response', {
					'success': true
					, 'response_type': 'account'
					, 'service': 'google'
					, 'account_status': 'authorized'
					, 'connect_status': 'connected'
					, 'profile_data': profile
					, 'message': params.message
				} );

			}

		});

	} else if( params && 'logout' == params.command ) {
		
		//TODO: Destroy token
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'socket': socket
			, 'type': type
		} );
		
		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'google'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );
	
	} else if( params && ( params.code || params.error === 'access_denied' ) ) {

		if( params.error == 'access_denied' ) {
			
			Private.publish( 'unauthorized', {
				'data': params
				, 'socket': socket
				, 'type': type
			} );

			socket.emit( '_acc_response', {
				'success': true
				, 'response_type': 'account'
				, 'service': 'google'
				, 'account_status': 'unauthorized'
			} );

		} else {

			service.google.getOAuthAccessToken( params.code, {
				redirect_uri: google.callback
				, grant_type: 'authorization_code'
			}, function( error, access_token, refresh_token ) {

				if( error ) {

					//TODO: Destroy tokens

					Private.publish( 'unauthorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, 'error': error
					} );

					socket.emit( '_acc_response', {
						'response_type': 'account'
						, 'success': false
						, 'service': 'google'
						, 'account_status': 'unauthorized'
					} );

				} else {

					service.google.get( "https://www.googleapis.com/plus/v1/people/me", access_token, function(error, data){
						if( error ) {

							//TODO: Destroy tokens

							Private.publish( 'unauthorized', {
								'data': params
								, 'socket': socket
								, 'type': type
								, 'error': error
							} );

							socket.emit( '_acc_response', {
								'response_type': 'account'
								, 'success': true
								, 'service': 'google'
								, 'account_status': 'unauthorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile_data': null
							} );

						} else {

							var parsed = JSON.parse( data );

							Private.publish( 'authorized', {
								'data': params
								, 'socket': socket
								, 'type': type
								, 'response': parsed
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							socket.emit( '_acc_response', {
								'response_type': 'account'
								, 'success': true
								, 'service': 'google'
								, 'account_status': 'authorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile_data': JSON.parse( data )
							} );

						}

					});

				}
			
			} );
		}

	} else {

		var redirect_url = service.google.getAuthorizeUrl( {
			redirect_uri : google.callback
			, scope: google.scope
			, response_type: 'code'
		} );

		Private.publish( 'authorizing', {
			'data': params
			, 'socket': socket
			, 'type': type
			, 'authorization_url': redirect_url
		} );
		
		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'google'
			, 'account_status': 'unauthorized'
			, 'login_url': redirect_url
		} );

	}

};

Private.handle_foursquare = function( params, socket, type ) {
	
	if( params && 'connect' == params.command ) {

		service.foursquare.get( "https://api.foursquare.com/v2/users/self", params.access_token, function ( error, data, response ) {
				if( error ) {

					Private.publish( 'unauthorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, 'error': error
					} );
					
					socket.emit( '_acc_response', {
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
			
					Private.publish( 'authorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, '_acc_response': profile
						, 'access_token': params.access_token
						, 'refresh_token': params.refresh_token
					} );

					socket.emit( '_acc_response', {
						'success': true
						, 'response_type': 'account'
						, 'service': 'foursquare'
						, 'account_status': 'authorized'
						, 'connect_status': 'connected'
						, 'profile_data': profile
						, 'message': params.message
					} );
				}

			} );

	} else if( params && 'logout' == params.command ) {
	
		//TODO: Destroy token
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'socket': socket
			, 'type': type
		} );

		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'foursquare'
			, 'account_status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {

		if( params.error_reason == 'user_denied' ) {

			Private.publish( 'unauthorized', {
				'data': params
				, 'socket': socket
				, 'type': type
			} );

			socket.emit( '_acc_response', {
				'success': true
				, 'response_type': 'account'
				, 'service': 'foursquare'
				, 'account_status': 'unauthorized'
			} );

		} else if ( params ) {

			service.foursquare.getOAuthAccessToken( params.code, { redirect_uri: foursquare.callback, 'grant_type': 'authorization_code' }, function( error, access_token, refresh_token ){

				if( error ) { 

					Private.publish( 'unauthorized', {
						'data': params
						, 'socket': socket
						, 'type': type
						, 'error': error
						, 'access_token': access_token
						, 'refresh_token': refresh_token
					} );

					socket.emit( '_acc_response', {
						'success': false
						, 'response_type': 'account'
						, 'service': 'foursquare'
						, 'account_status': 'unauthorized'
					} );



				} else {

					service.foursquare.get( "https://api.foursquare.com/v2/users/self", access_token, function ( error, data, response ) {

						if( error ) {

							Private.publish( 'unauthorized', {
								'data': params
								, 'socket': socket
								, 'type': type
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							socket.emit( '_acc_response', {
								'success': false
								, 'response_type': 'account'
								, 'service': 'foursquare'
								, 'account_status': 'unauthorized'
							} );


						} else {

							var response = JSON.parse( data );
							var profile = response.response.user;

							Private.publish( 'authorized', {
								'data': params
								, 'socket': socket
								, 'type': type
								, '_acc_response': profile
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							socket.emit( '_acc_response', {
								'success': true
								, 'response_type': 'account'
								, 'service': 'foursquare'
								, 'account_status': 'authorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile_data': profile
							} );

						}

					});

				}

			});

		}

	} else {

		var redirect_url = service.foursquare.getAuthorizeUrl( {
			redirect_uri: foursquare.callback
			, response_type: "code"
		} );

		Private.publish( 'authorizing', {
			'data': params
			, 'socket': socket
			, 'type': type
			, 'authorization_url': redirect_url
		} );

		socket.emit( '_acc_response', {
			'success': true
			, 'response_type': 'account'
			, 'service': 'foursquare'
			, 'account_status': 'unauthorized'
			, 'login_url': redirect_url
		} );

	}

};

Public = function() {};

Public.prototype.subscribe = function( event_name, callback, id ) {
	if( 'undefined' === typeof event_name || null === event_name || 'function' !== typeof callback ) {
		return false;
	}
	if( null ===id|| 'undefined' === typeof id) {
		//create random id
		var text = "";
		var set = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var x;
		for( x = 0; x < 5; x++ ) { text += set.charAt( Math.floor( Math.random() * set.length ) ); }

	}
	if( 'undefined' === typeof subscribers[ event_name ] ) {
		subscribers[ event_name ] = {};
	}
	subscribers[ event_name ][id] = callback;
	return id;
};

Public.prototype.unsubscribe = function( event_name,id) {

	if( 'undefined' === typeof event_name || null === event_name ) {
		return false;
	}
	var subs = subscribers[ event_name ];
	if( 'undefined' === typeof subs || null === subs ) {
		return false;
	}
	if( 'undefined' !== typeof subs[id] ) { 
		delete subscribers[ event_name ][id];
		return id;
	} else {
		return false;
	}
};

Private.publish = function( event_name, value ) {

	if( 'undefined' === typeof event_name || null === event_name ) {
		return false;
	}
	var subs = subscribers[ event_name ];
	if( 'undefined' === typeof subs || null === subs ) {
		return false;
	}
	var attr, callback;
	for( attr in subs ) {
		callback = subs[ attr ];
		if( 'function' === typeof callback ) {
			callback( value, attr );
		};
	}
};



Public.prototype.secrets = function( path ) {

	if( 'undefined' === typeof path || null === path ) {
		throw new Error( 'Keypath cannot be empty' );
	}

	var auth_keys = ( 'string' === typeof path ) ? require( path ) : path; 

	for( var key in auth_keys ) { 
		global[ key ]= auth_keys[ key ]; 
	}

	// Twitter (oAuth 1.0)
	service.twitter = new OAuth("https://api.twitter.com/oauth/request_token", "https://api.twitter.com/oauth/access_token", twitter.id, twitter.secret, "1.0", twitter.callback || null, "HMAC-SHA1");

	// Facebook (oAuth 2)
	service.facebook = new OAuth2( facebook.id, facebook.secret, "https://graph.facebook.com" );

	// Google (oAuth 2)
	service.google = new OAuth2( google.id, google.secret,  "", "https://accounts.google.com/o/oauth2/auth", "https://accounts.google.com/o/oauth2/token" );

	// Foursquare (oAuth 2)
	service.foursquare = new OAuth2( foursquare.id, foursquare.secret, "https://foursquare.com", "/oauth2/authenticate", "/oauth2/access_token", "HMAC-SHA1" );
	service.foursquare.setAccessTokenName("oauth_token");

	// Tumblr (oauth 1.0)
	service.tumblr = new OAuth( "http://www.tumblr.com/oauth/request_token", "http://www.tumblr.com/oauth/access_token", tumblr.id, tumblr.secret, "1.0", tumblr.callback || null, "HMAC-SHA1" );

	// Github (oAuth 2)
	service.github = new OAuth2( github.id, github.secret, "https://github.com", "/login/oauth/authorize", "/login/oauth/access_token", "HMAC-SHA1" );
	service.github.setAccessTokenName("oauth_token");

	// Yahoo (oauth 1.0)
	service.yahoo = new OAuth( "https://api.login.yahoo.com/oauth/v2/get_request_token", "https://api.login.yahoo.com/oauth/v2/get_token", yahoo.id, yahoo.secret, "1.0", yahoo.callback || null, "HMAC-SHA1" );

	// Linkedin (oauth 1.0)
	service.linkedin = new OAuth( "https://api.linkedin.com/uas/oauth/requestToken", "https://api.linkedin.com/uas/oauth/accessToken", linkedin.id, linkedin.secret, "1.0", linkedin.callback || null, "HMAC-SHA1" );

	// Windows Live (oAuth 2)
	service.windows = new OAuth2( windows.id, windows.secret, "https://oauth.live.com", "/authorize", "/token", "HMAC-SHA1" );
	service.windows.setAccessTokenName("oauth_token");


};

Public.prototype.logout = function( data, socket, type ) {
	Private.publish( 'logging_out', { 'data': data, 'socket': socket, 'type': type } );
};

Public.prototype.login = function( data, socket, type ) {
	
	Private.publish( 'logging_in', { 'data': data, 'socket': socket, 'type': type } );
	
	if( 'twitter' == data.service ) {
		Private.handle_twitter( data, socket, type );
	} else if( 'google' === data.service ) {
		Private.handle_google( data, socket, type );
	} else if( 'facebook' === data.service ) {
		Private.handle_facebook( data, socket, type  );
	} else if( 'foursquare' === data.service ) {
		Private.handle_foursquare( data, socket, type );
	} else if( 'tumblr' === data.service ) {
		Private.handle_tumblr( data, socket, type );
	} else if( 'github' === data.service ) {
		Private.handle_github( data, socket, type );
	} else if( 'yahoo' === data.service ) {
		Private.handle_yahoo( data, socket, type );
	} else if( 'linkedin' === data.service ) {
		Private.handle_linkedin( data, socket, type );
	} else if( 'windows' === data.service ) {
		Private.handle_windows( data, socket, type );
	}

};

module.exports = new Public();
