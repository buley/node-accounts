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

				service.yahoo.get( "http://api.yahoo.com/v2/user/info", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {

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
						, 'service': 'yahoo'
						, 'account_status': 'authorized'
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
						, 'profile_data': parsed.response.user
					} );

				} );

			}
										
		} );
	} else {

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

		service.twitter.getOAuthRequestToken(function(error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {

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
				} );

			} else {

				var authentication_url = "http://twitter.com/oauth/authenticate?oauth_token=" + oauth_request_token;

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

		service.facebook.getProtectedResource( "https://graph.facebook.com/me", params.access_token, function ( error, data, response ) {
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
			service.facebook.getOAuthAccessToken(params && params.code, { redirect_uri: facebookCallbackAddress }, function( error, access_token ){	
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
					service.facebook.getProtectedResource( "https://graph.facebook.com/me", access_token, function ( error, data, response ) {
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

		var redirect_url = service.facebook.getAuthorizeUrl( { redirect_uri: facebookCallbackAddress, scope: facebookScope } );

		Private.publish( 'authorizing', { 'data': params, 'socket': socket, 'type': type, 'authorization_url': redirect_url } );

		socket.emit( '_acc_response', { 'success': true, 'response_type': 'account', 'service': 'facebook', 'login_url': redirect_url } );

	}

};

Private.handle_github = function( params, socket, type ) {
	
	if( params && 'connect' == params.command ) {

		service.github.getProtectedResource( "https://api.github.com/user", params.access_token, function ( error, data, response ) {
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

					service.github.getProtectedResource( "https://api.github.com/user", access_token, function ( error, data, response ) {

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
			redirect_uri: githubCallbackAddress
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
				redirect_uri: googleCallbackAddress
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
			redirect_uri : googleCallbackAddress
			, scope: googleScope
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

		service.foursquare.getProtectedResource( "https://api.foursquare.com/v2/users/self", params.access_token, function ( error, data, response ) {
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

			service.foursquare.getOAuthAccessToken( params.code, { redirect_uri: foursquareCallbackAddress, 'grant_type': 'authorization_code' }, function( error, access_token, refresh_token ){

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

					service.foursquare.getProtectedResource( "https://api.foursquare.com/v2/users/self", access_token, function ( error, data, response ) {

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
			redirect_uri: foursquareCallbackAddress
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

Public = function( key_path ) {
};

Public.prototype.subscribe = function( event_name, callback, id ) {
	if( 'undefined' === typeof event_name || null === event_name || 'function' !== typeof callback ) {
		return false;
	}
	if( null === id || 'undefined' === typeof id ) {
		//create random id
		var text = "";
		var set = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var x;
		for( x = 0; x < 5; x++ ) { text += set.charAt( Math.floor( Math.random() * set.length ) ); }

	}
	if( 'undefined' === typeof subscribers[ event_name ] ) {
		subscribers[ event_name ] = {};
	}
	subscribers[ event_name ][ id ] = callback;
	return id;
};

Public.prototype.unsubscribe = function( event_name, id ) {

	if( 'undefined' === typeof event_name || null === event_name ) {
		return false;
	}
	var subs = subscribers[ event_name ];
	if( 'undefined' === typeof subs || null === subs ) {
		return false;
	}
	if( 'undefined' !== typeof subs[ id ] ) { 
		delete subscribers[ event_name ][ id ];
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

	var auth_keys = require( path ); 

	for( var key in auth_keys ) { 
		global[ key ]= auth_keys[ key ]; 
	}

	// Twitter (oAuth 1.0)
	console.log( 'twitter', twitterId, twitterSecret );
	service.twitter = new OAuth("https://api.twitter.com/oauth/request_token", "https://api.twitter.com/oauth/access_token", twitterId, twitterSecret, "1.0", twitterCallbackAddress || null, "HMAC-SHA1");

	// Facebook (oAuth 2)
	service.facebook = new OAuth2( facebookId, facebookSecret, "https://graph.facebook.com" );

	// Google (oAuth 2)
	service.google = new OAuth2( googleId, googleSecret,  "", "https://accounts.google.com/o/oauth2/auth", "https://accounts.google.com/o/oauth2/token" );

	// Foursquare (oAuth 2)
	service.foursquare = new OAuth2( foursquareId, foursquareSecret, "https://foursquare.com", "/oauth2/authenticate", "/oauth2/access_token", "HMAC-SHA1" );
	service.foursquare.setAccessTokenName("oauth_token");

	// Tumblr (oauth 1.0)
	service.tumblr = new OAuth( "http://www.tumblr.com/oauth/request_token", "http://www.tumblr.com/oauth/access_token", tumblrId, tumblrSecret, "1.0", tumblrCallbackAddress || null, "HMAC-SHA1" );

	// Github (oAuth 2)
	service.github = new OAuth2( githubId, githubSecret, "https://github.com", "/login/oauth/authorize", "/login/oauth/access_token", "HMAC-SHA1" );
	service.github.setAccessTokenName("oauth_token");

	// Yahoo (oauth 1.0)
	console.log("YAHOO",yahooId,yahooSecret);
	service.yahoo = new OAuth( "https://api.login.yahoo.com/oauth/v2/get_request_token", "https://api.login.yahoo.com/oauth/v2/get_token", yahooId, yahooSecret, "1.0", yahooCallbackAddress || null, "HMAC-SHA1" );

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
	}

};

module.exports = new Public();
