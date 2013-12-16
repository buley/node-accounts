/* node-accounts */

/* 
 * Install:
 * 	npm install oauth
 * */

var OAuth = require("oauth").OAuth
    , OAuth2 = require("oauth").OAuth2
    , OAuthUtils = require('oauth/lib/_utils.js')
    , service = {}
    , Public = {}
    , subscribers = {}
    , Private = function() {};


Private.destroySession = function() {
    //TODO: Token destruction
};

/* Yahoo */

Private.handle_yahoo = function( params, callback ) {

	if( params && 'logout' == params.command ) {

		Private.destroySession()
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'callback': callback
		} );
		
		callback( {
			'success': true
			, 'service': 'yahoo'
			, 'status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && 'connect' == params.command ) {

		service.yahoo.get( "https://www.yahoo.com/oauth/authorize", params.access_token, params.access_token_secret, function (error, data, result ) {
	
			if( error ) { 
			
				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );

				callback( {
					'success': true
					, 'service': 'yahoo'
					, 'status': 'unauthorized'
					, 'message': params.message
				} );

			} else {

				var parsed = JSON.parse( data );

				Private.publish( 'authorized', {
					'data': params
					, 'callback': callback
					, 'response': parsed } );

				Private.publish( 'profile', {
					'data': JSON.parse( data )
					, 'callback': callback } );				

				callback( {
					'success': true
					, 'service': 'yahoo'
					, 'status': 'authorized'
					, 'profile': JSON.parse( data )
					, 'message': params.message
				} );

			}

		} );

	} else if( params && params.denied ) {

		Private.destroySession();

		Private.publish( 'unauthorized', { 'data': params, 'callback': callback } );

		callback( {
			'success': true
			, 'service': 'yahoo'
			, 'status': 'unauthorized'
		} );

	} else if( params && params.oauth_token && params.oauth_verifier ) {

		service.yahoo.getOAuthAccessToken( params.oauth_token, params.oauth_token_secret, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {

			if( error ) {

				Private.destroySession();

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );

				callback( {
					'success': false
					
					, 'service': 'yahoo'
					, 'status': 'unauthorized'
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
							, 'callback': callback
							, 'response': parsed.profile
							, 'access_token': oauth_access_token
							, 'access_token_secret': oauth_access_token_secret
						} );

						Private.publish( 'profile', {
							'data': parsed.profile
							, 'callback': callback
						} );

						callback( {
							'success': true
							, 'service': 'yahoo'
							, 'status': 'authorized'
							, 'access_token': oauth_access_token
							, 'access_token_secret': oauth_access_token_secret
							, 'profile': parsed.profile
						} );
					} );
				} );

			}
										
		} );
	} else {
		service.yahoo.getOAuthRequestToken( function( error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {

			if(error) {
				
				Private.destroySession();

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );
				
				callback( {
					'success': false
					, 'service': 'yahoo'
				} );

			} else {

				var authentication_url = "https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=" + oauth_request_token;

				Private.publish( 'authorizing', {
					'data': params
					, 'callback': callback
					, 'authorization_url': authentication_url
				} );

				callback( {
					'success': true
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
Private.handle_linkedin = function( params, callback ) {

	if( params && 'logout' == params.command ) {

		Private.destroySession()
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'callback': callback
		} );
		
		callback( {
			'success': true
			, 'service': 'linkedin'
			, 'status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && 'connect' == params.command ) {

		service.linkedin.get( "https://www.linkedin.com/uas/oauth/authenticate", params.access_token, params.access_token_secret, function (error, data, result ) {
	
			if( error ) { 
			
				Private.destroySession()

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );

				callback( {
					'success': true
					, 'service': 'linkedin'
					, 'status': 'unauthorized'
					, 'message': params.message
				} );

			} else {

				var parsed = JSON.parse( data );

				Private.publish( 'authorized', {
					'data': params
					, 'callback': callback
					, 'response': parsed } );

				Private.publish( 'profile', {
					'data': parsed
					, 'callback': callback
				} );

				callback( {
					'success': true
					, 'service': 'linkedin'
					, 'status': 'authorized'
					, 'profile': parsed
					, 'message': params.message
				} );

			}

		} );

	} else if( params && params.denied ) {

		Private.destroySession();

		Private.publish( 'unauthorized', { 'data': params, 'callback': callback } );

		callback( {
			'success': true
			, 'service': 'linkedin'
			, 'status': 'unauthorized'
			, 'error': 'denied'
		} );

	} else if( params && params.oauth_token && params.oauth_verifier ) {
		service.linkedin.getOAuthAccessToken( params.oauth_token, params.oauth_token_secret, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {

			if( error ) {

				Private.destroySession();

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );

				callback( {
					'success': false
					, 'service': 'linkedin'
					, 'status': 'unauthorized'
					, 'error': error
				} );

			} else {
				var profile_params = [ 'id', 'first-name', 'last-name', 'maiden-name', 'formatted-name', 'phonetic-first-name', 'phonetic-last-name', 'formatted-phonetic-name', 'headline', 'location', 'industry', 'distance', 'relation-to-viewer', 'last-modified-timestamp', 'current-share', 'network', 'connections', 'num-connections', 'num-connections-capped', 'summary', 'specialties', 'proposal-comments', 'associations', 'honors', 'interests', 'positions', 'publications', 'patents', 'languages', 'skills', 'certifications', 'educations', 'courses', 'volunteer', 'three-current-positions', 'three-past-positions', 'num-recommenders', 'recommendations-received', 'phone-numbers', 'im-accounts', 'twitter-accounts', 'primary-twitter-account', 'bound-account-types', 'mfeed-rss-url', 'following', 'job-bookmarks', 'group-memberships', 'suggestions', 'date-of-birth', 'main-address', 'member-url-resources', 'picture-url', 'site-standard-profile-request', 'api-standard-profile-request', 'public-profile-url', 'related-profile-views' ];
				service.linkedin.get( "http://api.linkedin.com/v1/people/~:(" + profile_params.join( ',' ) + ")", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {
					var parsed = JSON.parse( data );
					Private.publish( 'authorized', {
						'data': params
						, 'callback': callback
						, 'response': parsed
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
					} );

					Private.publish( 'profile', {
						'data': parsed
						, 'callback': callback
					} );

					callback( {
						'success': true
						, 'service': 'linkedin'
						, 'status': 'authorized'
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
						, 'profile': parsed
					} );

				}, { 'x-li-format': 'json' } );

			}
										
		} );
	} else {

		service.linkedin.getOAuthRequestToken( function( error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {

			if( error ) {
				
				Private.destroySession();

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );
				
				callback( {
					'success': false
					
					, 'service': 'linkedin'
				} );

			} else {

				var authentication_url = "https://www.linkedin.com/uas/oauth/authenticate?oauth_token=" + oauth_request_token;

				Private.publish( 'authorizing', {
					'data': params
					, 'callback': callback
					, 'authorization_url': authentication_url
				} );

				callback( {
					'success': true
					, 'service': 'linkedin'
					, 'login_url': authentication_url
					, 'request_token': oauth_request_token
					, 'request_token_secret': oauth_request_token_secret
				} );

			}
		});
	}

};


/* Evernote */


Private.handle_evernote = function( params, callback ) {

    if( params && 'logout' == params.command ) {

        Private.destroySession()

        Private.publish( 'deauthorized', {
            'data': params
            , 'callback': callback
        } );

        callback( {
            'success': true
            , 'service': 'evernote'
            , 'status': 'unauthorized'
            , 'logout_url': null
            , 'message': params.message
        } );

    } else if( params && 'connect' == params.command ) {

        service.evernote.get( "http://www.evernote.com/oauth/authorize", params.access_token, params.access_token_secret, function (error, data, result ) {
            if( error ) {

                Private.destroySession();

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': true
                    , 'service': 'evernote'
                    , 'status': 'unauthorized'
                    , 'message': params.message
                    , 'error': error
                } );

            } else {

                var parsed = JSON.parse( data );

                Private.publish( 'authorized', {
                    'data': params
                    , 'callback': callback
                    , 'response': parsed } );

                Private.publish( 'profile', {
                    'data': parsed
                    , 'callback': callback
                } );

                callback( {
                    'success': true
                    , 'service': 'evernote'
                    , 'status': 'authorized'
                    , 'profile': parsed
                    , 'message': params.message
                } );

            }

        } );

    } else if( params && params.denied ) {

        Private.destroySession();

        Private.publish( 'unauthorized', { 'data': params, 'callback': callback } );

        callback( {
            'success': true
            , 'service': 'evernote'
            , 'error': 'denied'
            , 'status': 'unauthorized'
        } );

    } else if( params && params.oauth_token && params.oauth_verifier ) {
        console.log('evernote oauth access get');
        service.evernote.getOAuthAccessToken( params.oauth_token, params.oauth_token_secret, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {

            if( error ) {

                Private.destroySession();

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': false
                    , 'service': 'evernote'
                    , 'status': 'unauthorized'
                    , 'error': error
                } );

            } else {

                service.evernote.get( "http://api.evernote.com/v2/user/info", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {

                    var parsed = JSON.parse( data );

                    Private.publish( 'authorized', {
                        'data': params
                        , 'callback': callback
                        , 'response': parsed.response.user
                        , 'access_token': oauth_access_token
                        , 'access_token_secret': oauth_access_token_secret
                    } );

                    Private.publish( 'profile', {
                        'data': parsed.response.user
                        , 'callback': callback
                    } );

                    callback( {
                        'success': true
                        , 'service': 'evernote'
                        , 'status': 'authorized'
                        , 'access_token': oauth_access_token
                        , 'access_token_secret': oauth_access_token_secret
                        , 'profile': parsed.response.user
                    } );

                } );

            }

        } );
    } else {
        console.log('evernote aouth request token');
        service.evernote.getOAuthRequestToken( function( error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {
            console.log('evernote oauth', error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters);
            if(error) {

                Private.destroySession();

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': false
                    , 'service': 'evernote'
                    , 'error': error
                } );

            } else {

                var authentication_url = "http://evernote.com/oauth/authorize/?oauth_token=" + oauth_request_token;

                Private.publish( 'authorizing', {
                    'data': params
                    , 'callback': callback
                    , 'authorization_url': authentication_url
                } );

                callback( {
                    'success': true
                    , 'service': 'evernote'
                    , 'login_url': authentication_url
                    , 'request_token': oauth_request_token
                    , 'request_token_secret': oauth_request_token_secret
                } );

            }
        });
    }

};


/* Reddit */


Private.handle_reddit = function( params, callback ) {

    if( params && 'connect' == params.command ) {

        service.reddit.get( "https://oauth.reddit.com/api/me.json", params.access_token, function ( error, data, response ) {
            if( error ) {

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': true
                    , 'service': 'reddit'
                    , 'status': 'unauthorized'
                    , 'message': params.message
                } );

            } else {

                var response = JSON.parse( data );
                var profile = response.response.user;

                Private.publish( 'authorized', {
                    'data': params
                    , 'callback': callback
                    , 'data': profile
                    , 'access_token': params.access_token
                    , 'refresh_token': params.refresh_token
                } );

                Private.publish( 'profile', {
                    'data': profile
                    , 'callback': callback
                } );

                callback( {
                    'success': true
                    , 'service': 'reddit'
                    , 'status': 'authorized'
                    , 'profile': profile
                    , 'message': params.message
                } );
            }

        } );

    } else if( params && 'logout' == params.command ) {

        Private.publish( 'deauthorized', {
            'data': params
            , 'callback': callback
        } );

        callback( {
            'success': true
            , 'service': 'reddit'
            , 'status': 'unauthorized'
            , 'logout_url': null
            , 'message': params.message
        } );

    } else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {

        if( params.error_reason == 'user_denied' ) {

            Private.publish( 'unauthorized', {
                'data': params
                , 'callback': callback
                , 'error': 'denied'
            } );

            callback( {
                'success': true
                , 'service': 'reddit'
                , 'status': 'unauthorized'
                , 'error': 'denied'
            } );

        } else {
            service.reddit.getOAuthAccessToken( params.code, {
                'grant_type': 'authorization_code'
                , redirect_uri: reddit.callback
            }, function( error, access_token, refresh_token ){
                if( error ) {

                    Private.publish( 'unauthorized', {
                        'data': params
                        , 'callback': callback
                        , 'error': error
                        , 'access_token': access_token
                        , 'refresh_token': refresh_token
                    } );

                    callback( {
                        'success': false
                        , 'service': 'reddit'
                        , 'status': 'unauthorized'
                        , 'error': error
                    } );
                } else {

                    service.reddit.get( "https://oauth.reddit.com/api/v1/me", access_token, function ( error, data, response ) {
                        if( error ) {

                            Private.publish( 'unauthorized', {
                                'data': params
                                , 'callback': callback
                                , 'error': error
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );

                            callback( {
                                'success': false

                                , 'service': 'reddit'
                                , 'status': 'unauthorized'
                                , 'error': error
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );


                        } else {

                            var response = null;
                            try {
                                response = JSON.parse( data );
                            } catch ( e ) {
                                console.log('node-accounts: Error parsing reddit profile')
                            }

                            Private.publish( 'authorized', {
                                'params': params
                                , 'callback': callback
                                , 'data': response
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );

                            Private.publish( 'profile', {
                                'data': response
                                , 'callback': callback
                            } );

                            callback( {
                                'success': true
                                , 'service': 'reddit'
                                , 'status': 'authorized'
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                                , 'profile': response
                            } );

                        }

                    });

                }

            });

        }

    } else {

        var redirect_url = service.reddit.getAuthorizeUrl( {
            redirect_uri: reddit.callback
            , response_type: "code"
            , scope: reddit.scope
            , duration: 'permanent'
            , state: new Date().getTime()
        } );

        Private.publish( 'authorizing', {
            'data': params
            , 'callback': callback
            , 'authorization_url': redirect_url
        } );

        callback( {
            'success': true
            , 'service': 'reddit'
            , 'status': 'unauthorized'
            , 'login_url': redirect_url
        } );

    }

};

/* Tumblr */

Private.handle_tumblr = function( params, callback ) {

	if( params && 'logout' == params.command ) {

		Private.destroySession()
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'callback': callback
		} );
		
		callback( {
			'success': true	
			, 'service': 'tumblr'
			, 'status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && 'connect' == params.command ) {

		service.tumblr.get( "http://www.tumblr.com/oauth/authorize", params.access_token, params.access_token_secret, function (error, data, result ) {
			if( error ) { 
	
				Private.destroySession();

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );

				callback( {
					'success': true
					, 'service': 'tumblr'
					, 'status': 'unauthorized'
					, 'message': params.message
					, 'error': error
				} );

			} else {

				var parsed = JSON.parse( data );

				Private.publish( 'authorized', {
					'data': params
					, 'callback': callback
					, 'response': parsed } );
	
				Private.publish( 'profile', {
					'data': parsed
					, 'callback': callback
				} );

				callback( {
					'success': true
					, 'service': 'tumblr'
					, 'status': 'authorized'
					, 'profile': parsed
					, 'message': params.message
				} );

			}

		} );

	} else if( params && params.denied ) {

		Private.destroySession();

		Private.publish( 'unauthorized', { 'data': params, 'callback': callback } );

		callback( {
			'success': true
			, 'service': 'tumblr'
			, 'error': 'denied'
			, 'status': 'unauthorized'
		} );

	} else if( params && params.oauth_token && params.oauth_verifier ) {

		service.tumblr.getOAuthAccessToken( params.oauth_token, params.oauth_token_secret, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {

			if( error ) {

				Private.destroySession();

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );

				callback( {
					'success': false
					, 'service': 'tumblr'
					, 'status': 'unauthorized'
					, 'error': error
				} );

			} else {

				service.tumblr.get( "http://api.tumblr.com/v2/user/info", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {

					var parsed = JSON.parse( data );

					Private.publish( 'authorized', {
						'data': params
						, 'callback': callback
						, 'response': parsed.response.user
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
					} );

					Private.publish( 'profile', {
						'data': parsed.response.user
						, 'callback': callback
					} );

					callback( {
						'success': true						
						, 'service': 'tumblr'
						, 'status': 'authorized'
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
						, 'profile': parsed.response.user
					} );

				} );

			}
										
		} );

	} else {

		service.tumblr.getOAuthRequestToken( function( error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {

			if( error ) {
				
				Private.destroySession();

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );
				
				callback( {
					'success': false
					, 'service': 'tumblr'
				} );

			} else {

				var authentication_url = "http://tumblr.com/oauth/authorize/?oauth_token=" + oauth_request_token;

				Private.publish( 'authorizing', {
					'data': params
					, 'callback': callback
					, 'authorization_url': authentication_url
				} );

				callback( {
					'success': true
					, 'service': 'tumblr'
					, 'login_url': authentication_url
					, 'request_token': oauth_request_token
					, 'request_token_secret': oauth_request_token_secret
				} );

			}
		});
	}

};

/* Vimeo */

Private.handle_vimeo = function( params, callback ) {

    if( params && 'logout' == params.command ) {

        Private.destroySession()

        Private.publish( 'deauthorized', {
            'data': params
            , 'callback': callback
        } );

        callback( {
            'success': true
            , 'service': 'vimeo'
            , 'status': 'unauthorized'
            , 'logout_url': null
            , 'message': params.message
        } );

    } else if( params && 'connect' == params.command ) {

        service.vimeo.get( "http://www.vimeo.com/oauth/authorize", params.access_token, params.access_token_secret, function (error, data, result ) {
            if( error ) {

                Private.destroySession()

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': true
                    , 'service': 'vimeo'
                    , 'status': 'unauthorized'
                    , 'message': params.message
                    , 'error': error
                } );

            } else {

                var parsed = JSON.parse( data );

                Private.publish( 'authorized', {
                    'data': params
                    , 'callback': callback
                    , 'response': parsed } );

                Private.publish( 'profile', {
                    'data': parsed
                    , 'callback': callback
                } );

                callback( {
                    'success': true
                    , 'service': 'vimeo'
                    , 'status': 'authorized'
                    , 'profile': parsed
                    , 'message': params.message
                } );

            }

        } );

    } else if( params && params.denied ) {

        Private.destroySession();

        Private.publish( 'unauthorized', { 'data': params, 'callback': callback } );

        callback( {
            'success': true
            , 'service': 'vimeo'
            , 'error': 'denied'
            , 'status': 'unauthorized'
        } );

    } else if( params && params.oauth_token && params.oauth_verifier ) {

        service.vimeo.getOAuthAccessToken( params.oauth_token, params.oauth_token_secret, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {


            if( error ) {

                Private.destroySession();

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': false
                    , 'service': 'vimeo'
                    , 'status': 'unauthorized'
                    , 'error': error
                } );

            } else {

                console.log('VIMEO GET',user.id);

                service.vimeo.get( "http://vimeo.com/api/rest/v2?format=json&method=vimeo.people.getInfo&user_id=" + oauth_access_token, oauth_access_token, oauth_access_token_secret, function (error, data, result ) {

                    var parsed = JSON.parse( data );

                    if( error || 'undefined' === typeof parsed.person ) {

                        Private.destroySession();

                        Private.publish( 'unauthorized', {
                            'data': params
                            , 'callback': callback
                            , 'error': error
                        } );

                        callback( {
                            'success': false
                            , 'service': 'vimeo'
                            , 'status': 'unauthorized'
                            , 'error': error
                        } );

                    } else {

                        response = parsed.person
                        Private.publish( 'authorized', {
                            'data': params
                            , 'callback': callback
                            , 'response': response
                            , 'access_token': oauth_access_token
                            , 'access_token_secret': oauth_access_token_secret
                        } );

                        Private.publish( 'profile', {
                            'data': response
                            , 'callback': callback
                        } );

                        callback( {
                            'success': true
                            , 'service': 'vimeo'
                            , 'status': 'authorized'
                            , 'access_token': oauth_access_token
                            , 'access_token_secret': oauth_access_token_secret
                            , 'profile': response
                        } );
                    }

                } );

            }

        } );
    } else {

        service.vimeo.getOAuthRequestToken( function( error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {

            if(error) {

                Private.destroySession();

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': false
                    , 'service': 'vimeo'
                } );

            } else {

                var authentication_url = "http://vimeo.com/oauth/authorize/?oauth_token=" + oauth_request_token;

                Private.publish( 'authorizing', {
                    'data': params
                    , 'callback': callback
                    , 'authorization_url': authentication_url
                } );

                callback( {
                    'success': true
                    , 'service': 'vimeo'
                    , 'login_url': authentication_url
                    , 'request_token': oauth_request_token
                    , 'request_token_secret': oauth_request_token_secret
                } );

            }
        });
    }

};

/* Twitter */

Private.handle_twitter = function( params, callback ) {

	if( params && 'logout' == params.command ) {

		Private.destroySession();
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'callback': callback
		} );
		
		callback( {
			'success': true
			, 'service': 'twitter'
			, 'status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && 'connect' == params.command ) {

		service.twitter.get( "https://api.twitter.com/1.1/account/verify_credentials.json", params.access_token, params.access_token_secret, function (error, data, result ) {
	
			// Check to see if profile request was successful, if it was
			// then the access token and access token secret are correct
	
			if( error ) { 

				Private.publish( 'unauthorized', { 'data': params, 'callback': callback } );

				callback( {
					'success': true
					, 'service': 'twitter'
					, 'status': 'unauthorized'
					, 'message': params.message
					, 'error': error
				} );

			} else {

				var parsed = JSON.parse( data );
				Private.publish( 'authorized', { 'data': params, 'response': parsed, 'callback': callback } );
				Private.publish( 'profile', {
					'data': parsed
					, 'callback': callback
				} );

				if( 'socket' === type ) {
					callback( {
						'success': true
						, 'service': 'twitter'
						, 'status': 'authorized'
						, 'profile': parsed
						, 'message': params.message
					} );
				}

			}

		} );

	} else if( params && params.denied ) {

		Private.publish( 'unauthorized', { 'data': params, 'callback': callback } );
		
		callback( {
			'success': true
			, 'error': 'denied'
			, 'service': 'twitter'
			, 'status': 'unauthorized'
		} );

	} else if( params && params.oauth_token && params.oauth_verifier ) {

		service.twitter.getOAuthAccessToken(params.oauth_token, params.oauth_token_secret, params.oauth_verifier, function( error, oauth_access_token, oauth_access_token_secret, additionalParameters ) {

			if( error ) {

				Private.destroySession();

				Private.publish( 'unauthorized', { 'data': params, 'callback': callback, 'error': error } );

				callback( {
					'success': true
					, 'service': 'twitter'
					, 'status': 'unauthorized'
					, 'error': error
				} );

			} else {

				service.twitter.get( "https://api.twitter.com/1.1/account/verify_credentials.json", oauth_access_token, oauth_access_token_secret, function (error, data, result ) {

					var parsed = JSON.parse( data );

					Private.publish( 'authorized', { 'data': params, 'callback': callback, 'response': parsed, 'access_token': oauth_access_token, 'access_token_secret': oauth_access_token_secret } );

					Private.publish( 'profile', {
						'data': parsed
						, 'callback': callback
					} );

					callback( {
						'success': true
						, 'service': 'twitter'
						, 'status': 'authorized'
						, 'access_token': oauth_access_token
						, 'access_token_secret': oauth_access_token_secret
						, 'profile': parsed
					} );

				} );

			}

		} );

	} else {

		service.twitter.getOAuthRequestToken(function(error, oauth_request_token, oauth_request_token_secret, oauth_authorize_url, additionalParameters ) {
			if( error ) {

				Private.destroySession();

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );
				
				callback( {
					'success': false
					, 'service': 'twitter'
					, 'status': 'unauthorized'
					, 'error': error
				} );

			} else {

				var authentication_url = "http://twitter.com/oauth/authenticate?oauth_token=" + oauth_request_token;
				Private.publish( 'authorizing', {
					'data': params
					, 'callback': callback
					, 'authorization_url': authentication_url
					, 'request_token': oauth_request_token
					, 'request_token_secret': oauth_request_token_secret
				} );	

				callback( {
					'success': true
					
					, 'service': 'twitter'
					, 'login_url': authentication_url
					, 'request_token': oauth_request_token
					, 'request_token_secret': oauth_request_token_secret
				} );

			}

		});

	}

};

Private.handle_facebook = function( params, callback ) {

	if( params && 'connect' == params.command ) {

		service.facebook.get( "https://graph.facebook.com/me", params.access_token, function ( error, data, response ) {
			if( error ) {

				Private.destroySession()
				
				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );
	
				callback( {
					'success': true
					, 'service': 'facebook'
					, 'status': 'unauthorized'
					, 'message': params.message
					, 'error': error
				} );

			} else {

				Private.destroySession()
				
				var parsed = JSON.parse( data );

				Private.publish( 'authorized', {
					'data': params
					, 'callback': callback
					, 'response': parsed
				} );

				Private.publish( 'profile', {
					'data': parsed
					, 'callback': callback
				} );			

				callback( {
					'success': true
					, 'service': 'facebook'
					, 'status': 'authorized'
					, 'profile': parsed
					, 'message': params.message
				} );

			}
		} );

	} else if( params && 'logout' == params.command ) {
		//https://www.facebook.com/logout.php?next=YOUR_URL&access_token=ACCESS_TOKEN

		var logout_url, status;
		if( 'undefined' == typeof params.access_token || null == params.access_token ) {
			logout_url = null;
			status = 'unauthorized';
		} else {
			logout_url = 'https://www.facebook.com/logout.php?next=' + encodeURIComponent( 'http://www.reporters.co/?service=facebook&logout=true' ) + '&access_token=' + params.access_token;
			status = 'authorized';
		}

		Private.publish( 'deauthorized', {
			'data': params
			, 'callback': callback
		} );
		
		callback( {
			'success': true
			, 'service': 'facebook'
			, 'status': status
			, 'logout_url': logout_url
			, 'message': params.message
		} );

	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {
		if( params.error_reason == 'user_denied' ) {
	
			Private.publish( 'unauthorized', { 'data': params, 'callback': callback } );
			
			callback( {
				'success': true
				, 'service': 'facebook'
				, 'status': 'unauthorized'
				, 'error': 'user_denied'
			} );

		} else {
			service.facebook.getOAuthAccessToken( params.code, { redirect_uri: facebook.callback }, function( error, access_token ){	
				if( error ) { 
					callback( {
						'success': false
						, 'service': 'facebook'
						, 'status': 'unauthorized'
						, 'message': 'Error retrieving access token.'
						, 'error': error
					} );

					Private.publish( 'unauthorized', { 'data': params, 'callback': callback, 'error': error } );
				
				} else {
					service.facebook.get( "https://graph.facebook.com/me", access_token, function ( error, data, response ) {
						if( error ) {

							var result = { 'success': false, 'status': 'unauthorized', 'service': 'facebook', 'error': error };
							callback( result );
							
						} else {

							var parsed = JSON.parse( data );
							var result = { 'success': true, 'status': 'authorized', 'service': 'facebook', 'access_token': access_token, 'profile': parsed };
						
							Private.publish( 'profile', {
								'data': parsed
								, 'callback': callback
							} );

							callback( result );

						}

					});

				}

			});

		}

	} else {

		var redirect_url = service.facebook.getAuthorizeUrl( { redirect_uri: facebook.callback, scope: facebook.scope } );

		Private.publish( 'authorizing', { 'data': params, 'callback': callback, 'authorization_url': redirect_url } );

		callback( { 'success': true, 'service': 'facebook', 'login_url': redirect_url } );

	}

};

Private.handle_windows = function( params, callback ) {
	if( params && 'connect' == params.command ) {

		service.windows.get( "https://apis.live.net/v5.0/me/?access_token=" + params.access_token, null, function ( error, data, response ) {
				if( error ) {

					Private.publish( 'unauthorized', {
						'data': params
						, 'callback': callback
						, 'error': error
					} );
					
					callback( {
						'success': true
						, 'service': 'windows'
						, 'status': 'unauthorized'
						, 'message': params.message
					} );

				} else {

					var response = JSON.parse( data );
					var profile = response.response.user;
			
					Private.publish( 'authorized', {
						'data': params
						, 'callback': callback
						, 'data': profile
						, 'access_token': params.access_token
						, 'refresh_token': params.refresh_token
					} );

					Private.publish( 'profile', {
						'data': profile
						, 'callback': callback
					} );

					callback( {
						'success': true
						, 'service': 'windows'
						, 'status': 'authorized'
						, 'profile': profile
						, 'message': params.message
					} );
				}

			} );

	} else if( params && 'logout' == params.command ) {
	
		Private.publish( 'deauthorized', {
			'data': params
			, 'callback': callback
		} );

		callback( {
			'success': true
			
			, 'service': 'windows'
			, 'status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {

		if( params.error_reason == 'user_denied' ) {

			Private.publish( 'unauthorized', {
				'data': params
				, 'callback': callback
			} );

			callback( {
				'success': true
				
				, 'service': 'windows'
				, 'status': 'unauthorized'
			} );

		} else {

			service.windows.getOAuthAccessToken( params.code, { 
				'grant_type': 'authorization_code'
				, redirect_uri: windows.callback
			}, function( error, access_token, refresh_token ){

				if( error ) { 

					Private.publish( 'unauthorized', {
						'data': params
						, 'callback': callback
						, 'error': error
						, 'access_token': access_token
						, 'refresh_token': refresh_token
					} );

					callback( {
						'success': false
						
						, 'service': 'windows'
						, 'status': 'unauthorized'
						, 'error': error
						, 'access_token': access_token
						, 'refresh_token': refresh_token
					} );



				} else {
					service.windows.get( "https://apis.live.net/v5.0/me/?access_token=" + access_token, null, function ( error, data, response ) {

						if( error ) {

							Private.publish( 'unauthorized', {
								'data': params
								, 'callback': callback
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							callback( {
								'success': false
								
								, 'service': 'windows'
								, 'status': 'unauthorized'
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );


						} else {

							var response = JSON.parse( data );

							Private.publish( 'authorized', {
								'data': params
								, 'callback': callback
								, 'data': response
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							Private.publish( 'profile', {
								'data': response
								, 'callback': callback
							} );

							callback( {
								'success': true
								
								, 'service': 'windows'
								, 'status': 'authorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile': response
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
			, 'callback': callback
			, 'authorization_url': redirect_url
		} );

		callback( {
			'success': true
			, 'service': 'windows'
			, 'status': 'unauthorized'
			, 'login_url': redirect_url
		} );

	}

};


Private.handle_instagram = function( params, callback ) {

    if( params && 'connect' == params.command ) {

        service.instagram.get( "https://api.instagram.com/v1/users/self", params.access_token, function ( error, data, response ) {
            if( error ) {

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': true
                    , 'service': 'instagram'
                    , 'status': 'unauthorized'
                    , 'message': params.message
                } );

            } else {

                var response = JSON.parse( data );
                var profile = response.response.user;

                Private.publish( 'authorized', {
                    'data': params
                    , 'callback': callback
                    , 'data': profile
                    , 'access_token': params.access_token
                    , 'refresh_token': params.refresh_token
                } );

                Private.publish( 'profile', {
                    'data': profile
                    , 'callback': callback
                } );

                callback( {
                    'success': true
                    , 'service': 'instagram'
                    , 'status': 'authorized'
                    , 'profile': profile
                    , 'message': params.message
                } );
            }

        } );

    } else if( params && 'logout' == params.command ) {

        Private.publish( 'deauthorized', {
            'data': params
            , 'callback': callback
        } );

        callback( {
            'success': true
            , 'service': 'instagram'
            , 'status': 'unauthorized'
            , 'logout_url': null
            , 'message': params.message
        } );

    } else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {

        if( params.error_reason == 'user_denied' ) {

            Private.publish( 'unauthorized', {
                'data': params
                , 'callback': callback
                , 'error': 'denied'
            } );

            callback( {
                'success': true
                , 'service': 'instagram'
                , 'status': 'unauthorized'
                , 'error': 'denied'
            } );

        } else {
            service.instagram.getOAuthAccessToken( params.code, {
                'grant_type': 'authorization_code'
                , 'client_id': instagram.id
                , 'client_secret': instagram.secret
                , 'redirect_uri': instagram.callback
            }, function( error, access_token, refresh_token, data ){
                if( error ) {

                    Private.publish( 'unauthorized', {
                        'data': params
                        , 'callback': callback
                        , 'error': error
                        , 'access_token': access_token
                        , 'refresh_token': refresh_token
                    } );

                    callback( {
                        'success': false
                        , 'service': 'instagram'
                        , 'status': 'unauthorized'
                        , 'error': error
                    } );


                } else {
                    service.instagram.get( "https://api.instagram.com/v1/users/self?access_token=" + access_token, access_token, function ( error, data, response ) {
                        if( error ) {
                            Private.publish( 'unauthorized', {
                                'data': params
                                , 'callback': callback
                                , 'error': error
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );

                            callback( {
                                'success': false
                                , 'service': 'instagram'
                                , 'status': 'unauthorized'
                                , 'error': error
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );


                        } else {

                            var response = JSON.parse( data );
                            response = response.data;

                            Private.publish( 'authorized', {
                                'data': params
                                , 'callback': callback
                                , 'data': response
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );

                            Private.publish( 'profile', {
                                'data': response
                                , 'callback': callback
                            } );

                            callback( {
                                'success': true
                                , 'service': 'instagram'
                                , 'status': 'authorized'
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                                , 'profile': response
                            } );

                        }

                    });

                }

            });

        }

    } else {

        var redirect_url = service.instagram.getAuthorizeUrl( {
            redirect_uri: instagram.callback
            , scope: instagram.scope
            , response_type: "code"
        } );

        Private.publish( 'authorizing', {
            'data': params
            , 'callback': callback
            , 'authorization_url': redirect_url
        } );

        callback( {
            'success': true
            , 'service': 'instagram'
            , 'status': 'unauthorized'
            , 'login_url': redirect_url
        } );

    }

};

Private.handle_github = function( params, callback ) {
	
	if( params && 'connect' == params.command ) {

		service.github.get( "https://api.github.com/user", params.access_token, function ( error, data, response ) {
				if( error ) {

					Private.publish( 'unauthorized', {
						'data': params
						, 'callback': callback
						, 'error': error
					} );
					
					callback( {
						'success': true
						, 'service': 'github'
						, 'status': 'unauthorized'
						, 'message': params.message
					} );

				} else {

					var response = JSON.parse( data );
					var profile = response.response.user;
			
					Private.publish( 'authorized', {
						'data': params
						, 'callback': callback
						, 'data': profile
						, 'access_token': params.access_token
						, 'refresh_token': params.refresh_token
					} );

					Private.publish( 'profile', {
						'data': profile
						, 'callback': callback
					} );

					callback( {
						'success': true
						, 'service': 'github'
						, 'status': 'authorized'
						, 'profile': profile
						, 'message': params.message
					} );
				}

			} );

	} else if( params && 'logout' == params.command ) {
	
		Private.publish( 'deauthorized', {
			'data': params
			, 'callback': callback
		} );

		callback( {
			'success': true
			, 'service': 'github'
			, 'status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {

		if( params.error_reason == 'user_denied' ) {

			Private.publish( 'unauthorized', {
				'data': params
				, 'callback': callback
				, 'error': 'denied'
			} );

			callback( {
				'success': true
				, 'service': 'github'
				, 'status': 'unauthorized'
				, 'error': 'denied'
			} );

		} else {

			service.github.getOAuthAccessToken( params.code, { 'grant_type': 'authorization_code' }, function( error, access_token, refresh_token ){

				if( error ) { 

					Private.publish( 'unauthorized', {
						'data': params
						, 'callback': callback
						, 'error': error
						, 'access_token': access_token
						, 'refresh_token': refresh_token
					} );

					callback( {
						'success': false
						, 'service': 'github'
						, 'status': 'unauthorized'
						, 'error': error
					} );


				} else {

					service.github.get( "https://api.github.com/user", access_token, function ( error, data, response ) {

						if( error ) {

							Private.publish( 'unauthorized', {
								'data': params
								, 'callback': callback
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							callback( {
								'success': false
								
								, 'service': 'github'
								, 'status': 'unauthorized'
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );


						} else {

							var response = JSON.parse( data );

							Private.publish( 'authorized', {
								'data': params
								, 'callback': callback
								, 'data': response
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							Private.publish( 'profile', {
								'data': response
								, 'callback': callback
							} );

							callback( {
								'success': true
								
								, 'service': 'github'
								, 'status': 'authorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile': response
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
			, 'callback': callback
			, 'authorization_url': redirect_url
		} );

		callback( {
			'success': true
			, 'service': 'github'
			, 'status': 'unauthorized'
			, 'login_url': redirect_url
		} );

	}

};


Private.handle_wordpress = function( params, callback ) {

    if( params && 'connect' == params.command ) {

        service.wordpress.get( "https://public-api.wordpress.com/rest/v1/me", params.access_token, function ( error, data, response ) {
            if( error ) {

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': true
                    , 'service': 'wordpress'
                    , 'status': 'unauthorized'
                    , 'message': params.message
                } );

            } else {

                var response = JSON.parse( data );
                var profile = response.response.user;

                Private.publish( 'authorized', {
                    'data': params
                    , 'callback': callback
                    , 'data': profile
                    , 'access_token': params.access_token
                    , 'refresh_token': params.refresh_token
                } );

                Private.publish( 'profile', {
                    'data': profile
                    , 'callback': callback
                } );

                callback( {
                    'success': true
                    , 'service': 'wordpress'
                    , 'status': 'authorized'
                    , 'profile': profile
                    , 'message': params.message
                } );
            }

        } );

    } else if( params && 'logout' == params.command ) {

        Private.publish( 'deauthorized', {
            'data': params
            , 'callback': callback
        } );

        callback( {
            'success': true
            , 'service': 'wordpress'
            , 'status': 'unauthorized'
            , 'logout_url': null
            , 'message': params.message
        } );

    } else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {

        if( params.error_reason == 'user_denied' ) {

            Private.publish( 'unauthorized', {
                'data': params
                , 'callback': callback
                , 'error': 'denied'
            } );

            callback( {
                'success': true
                , 'service': 'wordpress'
                , 'status': 'unauthorized'
                , 'error': 'denied'
            } );

        } else {

            service.wordpress.getOAuthAccessToken( params.code, {
                'grant_type': 'authorization_code'
                , redirect_uri: wordpress.callback
            }, function( error, access_token, refresh_token ){

                if( error ) {

                    Private.publish( 'unauthorized', {
                        'data': params
                        , 'callback': callback
                        , 'error': error
                        , 'access_token': access_token
                        , 'refresh_token': refresh_token
                    } );

                    callback( {
                        'success': false
                        , 'service': 'wordpress'
                        , 'status': 'unauthorized'
                        , 'error': error
                    } );


                } else {
                    service.wordpress.get( "https://public-api.wordpress.com/rest/v1/me", access_token, function ( error, data, response ) {

                        if( error ) {

                            Private.publish( 'unauthorized', {
                                'data': params
                                , 'callback': callback
                                , 'error': error
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );

                            callback( {
                                'success': false

                                , 'service': 'wordpress'
                                , 'status': 'unauthorized'
                                , 'error': error
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );


                        } else {

                            var response = JSON.parse( data );

                            Private.publish( 'authorized', {
                                'data': params
                                , 'callback': callback
                                , 'data': response
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );

                            Private.publish( 'profile', {
                                'data': response
                                , 'callback': callback
                            } );

                            callback( {
                                'success': true
                                , 'service': 'wordpress'
                                , 'status': 'authorized'
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                                , 'profile': response
                            } );

                        }

                    });

                }

            });

        }

    } else {

        var redirect_url = service.wordpress.getAuthorizeUrl( {
            redirect_uri: wordpress.callback
            , response_type: "code"
        } );

        Private.publish( 'authorizing', {
            'data': params
            , 'callback': callback
            , 'authorization_url': redirect_url
        } );

        callback( {
            'success': true
            , 'service': 'wordpress'
            , 'status': 'unauthorized'
            , 'login_url': redirect_url
        } );

    }

};

Private.handle_google = function( params, callback ) {

	if( params && 'connect' == params.command ) {

		service.google.get( "https://www.googleapis.com/plus/v1/people/me", params.access_token, function( error, data ) {

			if( error ) {

				Private.publish( 'unauthorized', {
					'data': params
					, 'callback': callback
					, 'error': error
				} );

				callback( {
					'success': true
					, 'service': 'google'
					, 'status': 'unauthorized'
					, 'message': params.message
					, 'error': error
				} );

			} else {

				var profile = JSON.parse( data );
			
				Private.publish( 'authorized', {
					'data': params
					, 'callback': callback
					, 'data': profile
					, 'access_token': params.access_token
					, 'refresh_token': params.refresh_token
				} );

				Private.publish( 'profile', {
					'data': profile
					, 'callback': callback
				} );

				callback( {
					'success': true
					, 'service': 'google'
					, 'status': 'authorized'
					, 'profile': profile
					, 'message': params.message
				} );

			}

		});

	} else if( params && 'logout' == params.command ) {
		
		Private.publish( 'deauthorized', {
			'data': params
			, 'callback': callback
		} );
		
		callback( {
			'success': true
			, 'service': 'google'
			, 'status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );
	
	} else if( params && ( params.code || params.error === 'access_denied' ) ) {

		if( params.error == 'access_denied' ) {
			
			Private.publish( 'unauthorized', {
				'data': params
				, 'callback': callback
			} );

			callback( {
				'success': true
				, 'error': 'denied'
				, 'service': 'google'
				, 'status': 'unauthorized'
			} );

		} else {

			service.google.getOAuthAccessToken( params.code, {
				redirect_uri: google.callback
				, grant_type: 'authorization_code'
			}, function( error, access_token, refresh_token ) {

				if( error ) {

					Private.publish( 'unauthorized', {
						'data': params
						, 'callback': callback
						, 'error': error
					} );

					callback( {
						'response_type': 'account'
						, 'success': false
						, 'service': 'google'
						, 'status': 'unauthorized'
						, 'error': error
					} );

				} else {

					service.google.get( "https://www.googleapis.com/plus/v1/people/me", access_token, function(error, data){
						if( error ) {

							Private.publish( 'unauthorized', {
								'data': params
								, 'callback': callback
								, 'error': error
							} );

							callback( {
								'response_type': 'account'
								, 'success': true
								, 'service': 'google'
								, 'status': 'unauthorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile': null
								, 'error': error
							} );

						} else {

							var parsed = JSON.parse( data );

							Private.publish( 'authorized', {
								'data': params
								, 'callback': callback
								, 'response': parsed
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							Private.publish( 'profile', {
								'data': parsed
								, 'callback': callback
							} );

							callback( {
								'response_type': 'account'
								, 'success': true
								, 'service': 'google'
								, 'status': 'authorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile': parsed
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
			, 'callback': callback
			, 'authorization_url': redirect_url
		} );
		
		callback( {
			'success': true
			, 'service': 'google'
			, 'status': 'unauthorized'
			, 'login_url': redirect_url
		} );

	}

};


Private.handle_youtube = function( params, callback ) {

    if( params && 'connect' == params.command ) {
        console.log('getting channels',params.access_token);
        service.youtube.get( "https://www.googleapis.com/youtube/v3/channels", params.access_token, function( error, data ) {
            console.log('YOUTUBE',error,data);
            if( error ) {

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': true
                    , 'service': 'youtube'
                    , 'status': 'unauthorized'
                    , 'message': params.message
                    , 'error': error
                } );

            } else {

                var profile = JSON.parse( data );

                Private.publish( 'authorized', {
                    'data': params
                    , 'callback': callback
                    , 'data': profile
                    , 'access_token': params.access_token
                    , 'refresh_token': params.refresh_token
                } );

                Private.publish( 'profile', {
                    'data': profile
                    , 'callback': callback
                } );

                callback( {
                    'success': true
                    , 'service': 'youtube'
                    , 'status': 'authorized'
                    , 'profile': profile
                    , 'message': params.message
                } );

            }

        });

    } else if( params && 'logout' == params.command ) {

        Private.publish( 'deauthorized', {
            'data': params
            , 'callback': callback
        } );

        callback( {
            'success': true
            , 'service': 'youtube'
            , 'status': 'unauthorized'
            , 'logout_url': null
            , 'message': params.message
        } );

    } else if( params && ( params.code || params.error === 'access_denied' ) ) {

        if( params.error == 'access_denied' ) {

            Private.publish( 'unauthorized', {
                'data': params
                , 'callback': callback
            } );

            callback( {
                'success': true
                , 'message': 'denied'
                , 'error': error
                , 'service': 'youtube'
                , 'status': 'unauthorized'
            } );

        } else {
            console.log('youtube access token');
            service.youtube.getOAuthAccessToken( params.code, {
                redirect_uri: youtube.callback
                , grant_type: 'authorization_code'
            }, function( error, access_token, refresh_token ) {
                console.log('youtube got access', error, access_token, refresh_token );
                if( error ) {

                    Private.publish( 'unauthorized', {
                        'data': params
                        , 'callback': callback
                        , 'error': error
                    } );

                    callback( {
                        'response_type': 'account'
                        , 'success': false
                        , 'service': 'youtube'
                        , 'status': 'unauthorized'
                        , 'error': error
                    } );

                } else {

                    service.youtube.get( "https://www.googleapis.com/youtube/v3/channels?part=contentDetails,topicDetails,statistics,snippet,id,status&mine=true", access_token, function(error, data){
                        if( error ) {

                            Private.publish( 'unauthorized', {
                                'data': params
                                , 'callback': callback
                                , 'error': error
                            } );

                            callback( {
                                'response_type': 'account'
                                , 'success': true
                                , 'service': 'youtube'
                                , 'status': 'unauthorized'
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                                , 'profile': null
                                , 'error': error
                            } );

                        } else {

                            var parsed = JSON.parse( data );
                            if ( 'undefined' !== typeof parsed.items ) {
                                parsed = parsed.items;
                                if ( 1 === parsed.length ) {
                                    parsed = parsed[ 0 ];
                                }
                            }

                            Private.publish( 'authorized', {
                                'data': params
                                , 'callback': callback
                                , 'response': parsed
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );

                            Private.publish( 'profile', {
                                'data': parsed
                                , 'callback': callback
                            } );

                            callback( {
                                'response_type': 'account'
                                , 'success': true
                                , 'service': 'youtube'
                                , 'status': 'authorized'
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                                , 'profile': parsed
                            } );

                        }

                    });

                }

            } );
        }

    } else {

        var redirect_url = service.youtube.getAuthorizeUrl( {
            redirect_uri : youtube.callback
            , scope: youtube.scope
            , response_type: 'code'
        } );

        Private.publish( 'authorizing', {
            'data': params
            , 'callback': callback
            , 'authorization_url': redirect_url
        } );

        callback( {
            'success': true
            , 'service': 'youtube'
            , 'status': 'unauthorized'
            , 'login_url': redirect_url
        } );

    }

};


Private.handle_blogger = function( params, callback ) {

    if( params && 'connect' == params.command ) {

        service.blogger.get( "https://www.googleapis.com/plus/v1/people/me", params.access_token, function( error, data ) {

            if( error ) {

                Private.publish( 'unauthorized', {
                    'data': params
                    , 'callback': callback
                    , 'error': error
                } );

                callback( {
                    'success': true
                    , 'service': 'blogger'
                    , 'status': 'unauthorized'
                    , 'message': params.message
                    , 'error': error
                } );

            } else {

                var profile = JSON.parse( data );

                Private.publish( 'authorized', {
                    'data': params
                    , 'callback': callback
                    , 'data': profile
                    , 'access_token': params.access_token
                    , 'refresh_token': params.refresh_token
                } );

                Private.publish( 'profile', {
                    'data': profile
                    , 'callback': callback
                } );

                callback( {
                    'success': true
                    , 'service': 'blogger'
                    , 'status': 'authorized'
                    , 'profile': profile
                    , 'message': params.message
                } );

            }

        });

    } else if( params && 'logout' == params.command ) {

        Private.publish( 'deauthorized', {
            'data': params
            , 'callback': callback
        } );

        callback( {
            'success': true
            , 'service': 'blogger'
            , 'status': 'unauthorized'
            , 'logout_url': null
            , 'message': params.message
        } );

    } else if( params && ( params.code || params.error === 'access_denied' ) ) {

        if( params.error == 'access_denied' ) {

            Private.publish( 'unauthorized', {
                'data': params
                , 'callback': callback
            } );

            callback( {
                'success': true
                , 'error': 'denied'
                , 'service': 'blogger'
                , 'status': 'unauthorized'
            } );

        } else {

            service.blogger.getOAuthAccessToken( params.code, {
                redirect_uri: blogger.callback
                , grant_type: 'authorization_code'
            }, function( error, access_token, refresh_token ) {

                if( error ) {

                    Private.publish( 'unauthorized', {
                        'data': params
                        , 'callback': callback
                        , 'error': error
                    } );

                    callback( {
                        'response_type': 'account'
                        , 'success': false
                        , 'service': 'blogger'
                        , 'status': 'unauthorized'
                        , 'error': error
                    } );

                } else {

                    service.blogger.get( "https://www.googleapis.com/plus/v1/people/me", access_token, function(error, data){
                        if( error ) {

                            Private.publish( 'unauthorized', {
                                'data': params
                                , 'callback': callback
                                , 'error': error
                            } );

                            callback( {
                                'response_type': 'account'
                                , 'success': true
                                , 'service': 'blogger'
                                , 'status': 'unauthorized'
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                                , 'profile': null
                                , 'error': error
                            } );

                        } else {

                            var parsed = JSON.parse( data );

                            Private.publish( 'authorized', {
                                'data': params
                                , 'callback': callback
                                , 'response': parsed
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                            } );

                            Private.publish( 'profile', {
                                'data': parsed
                                , 'callback': callback
                            } );

                            callback( {
                                'response_type': 'account'
                                , 'success': true
                                , 'service': 'blogger'
                                , 'status': 'authorized'
                                , 'access_token': access_token
                                , 'refresh_token': refresh_token
                                , 'profile': parsed
                            } );

                        }

                    });

                }

            } );
        }

    } else {

        var redirect_url = service.blogger.getAuthorizeUrl( {
            redirect_uri : blogger.callback
            , scope: blogger.scope
            , response_type: 'code'
        } );

        Private.publish( 'authorizing', {
            'data': params
            , 'callback': callback
            , 'authorization_url': redirect_url
        } );

        callback( {
            'success': true
            , 'service': 'blogger'
            , 'status': 'unauthorized'
            , 'login_url': redirect_url
        } );

    }

};

Private.handle_foursquare = function( params, callback ) {
	
	if( params && 'connect' == params.command ) {

		service.foursquare.get( "https://api.foursquare.com/v2/users/self", params.access_token, function ( error, data, response ) {
				if( error ) {

					Private.publish( 'unauthorized', {
						'data': params
						, 'callback': callback
						, 'error': error
					} );
					
					callback( {
						'success': true
						, 'service': 'foursquare'
						, 'status': 'unauthorized'
						, 'message': params.message
					} );

				} else {

					var response = JSON.parse( data );
					var profile = response.response.user;
			
					Private.publish( 'authorized', {
						'data': params
						, 'callback': callback
						, 'data': profile
						, 'access_token': params.access_token
						, 'refresh_token': params.refresh_token
					} );

					Private.publish( 'profile', {
						'data': profile
						, 'callback': callback
					} );

					callback( {
						'success': true
						, 'service': 'foursquare'
						, 'status': 'authorized'
						, 'profile': profile
						, 'message': params.message
					} );
				}

			} );

	} else if( params && 'logout' == params.command ) {
	
		Private.publish( 'deauthorized', {
			'data': params
			, 'callback': callback
		} );

		callback( {
			'success': true
			
			, 'service': 'foursquare'
			, 'status': 'unauthorized'
			, 'logout_url': null
			, 'message': params.message
		} );

	} else if( params && ( params.code || params.error_reason === 'user_denied' ) ) {

		if( params.error_reason == 'user_denied' ) {

			Private.publish( 'unauthorized', {
				'data': params
				, 'callback': callback
			} );

			callback( {
				'success': true
				, 'error': 'user_denied'	
				, 'service': 'foursquare'
				, 'status': 'unauthorized'
			} );

		} else if ( params ) {

			service.foursquare.getOAuthAccessToken( params.code, { redirect_uri: foursquare.callback, 'grant_type': 'authorization_code' }, function( error, access_token, refresh_token ){

				if( error ) { 

					Private.publish( 'unauthorized', {
						'data': params
						, 'callback': callback
						, 'error': error
						, 'access_token': access_token
						, 'refresh_token': refresh_token
					} );

					callback( {
						'success': false
						
						, 'service': 'foursquare'
						, 'status': 'unauthorized'
					} );



				} else {

					service.foursquare.get( "https://api.foursquare.com/v2/users/self", access_token, function ( error, data, response ) {

						if( error ) {

							Private.publish( 'unauthorized', {
								'data': params
								, 'callback': callback
								, 'error': error
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );

							callback( {
								'success': false
								
								, 'service': 'foursquare'
								, 'status': 'unauthorized'
							} );


						} else {

							var response = JSON.parse( data );
							var profile = response.response.user;

							Private.publish( 'authorized', {
								'data': params
								, 'callback': callback
								, 'data': profile
								, 'access_token': access_token
								, 'refresh_token': refresh_token
							} );
					
							Private.publish( 'profile', {
								'data': profile
								, 'callback': callback
							} );

							callback( {
								'success': true
								, 'service': 'foursquare'
								, 'status': 'authorized'
								, 'access_token': access_token
								, 'refresh_token': refresh_token
								, 'profile': profile
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
			, 'callback': callback
			, 'authorization_url': redirect_url
		} );

		callback( {
			'success': true
			
			, 'service': 'foursquare'
			, 'status': 'unauthorized'
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
	service.facebook.setAccessTokenName( facebook.token || "oauth_token");

	// Google (oAuth 2)
	service.google = new OAuth2( google.id, google.secret,  "", "https://accounts.google.com/o/oauth2/auth", "https://accounts.google.com/o/oauth2/token" );
	service.google.setAccessTokenName( google.token || "oauth_token" );

    // YouTube (oAuth 2)
    service.youtube = new OAuth2( youtube.id, youtube.secret,  "", "https://accounts.google.com/o/oauth2/auth", "https://accounts.google.com/o/oauth2/token" );
    service.youtube.setAccessTokenName( youtube.token || "oauth_token" );

    // Blogger (oAuth 2)
    service.blogger = new OAuth2( blogger.id, blogger.secret,  "", "https://accounts.google.com/o/oauth2/auth", "https://accounts.google.com/o/oauth2/token" );
    service.blogger.setAccessTokenName( blogger.token || "oauth_token" );

	// Foursquare (oAuth 2)
	service.foursquare = new OAuth2( foursquare.id, foursquare.secret, "https://foursquare.com", "/oauth2/authenticate", "/oauth2/access_token", "HMAC-SHA1" );
	service.foursquare.setAccessTokenName( foursquare.token || "oauth_token" );

	// Tumblr (oauth 1.0)
	service.tumblr = new OAuth( "http://www.tumblr.com/oauth/request_token", "http://www.tumblr.com/oauth/access_token", tumblr.id, tumblr.secret, "1.0", tumblr.callback || '', "HMAC-SHA1" );

	// Github (oAuth 2)
	service.github = new OAuth2( github.id, github.secret, "https://github.com", "/login/oauth/authorize", "/login/oauth/access_token", { 'User-Agent': 'republish.co (@editor)' } );
	service.github.setAccessTokenName( github.token || "oauth_token" );

	// Yahoo (oauth 1.0)
	service.yahoo = new OAuth( "https://api.login.yahoo.com/oauth/v2/get_request_token", "https://api.login.yahoo.com/oauth/v2/get_token", yahoo.id, yahoo.secret, "1.0", yahoo.callback || null, "HMAC-SHA1" );

	// Linkedin (oauth 1.0)
	service.linkedin = new OAuth( "https://api.linkedin.com/uas/oauth/requestToken", "https://api.linkedin.com/uas/oauth/accessToken", linkedin.id, linkedin.secret, "1.0", linkedin.callback || null, "HMAC-SHA1", null, { 'x-li-format': 'json' } );

	// Windows Live (oAuth 2)
	service.windows = new OAuth2( windows.id, windows.secret, "https://oauth.live.com", "/authorize", "/token" );
	service.windows.setAccessTokenName( windows.token || "oauth_token");

    // Instagram (oAuth 2)
    service.instagram = new OAuth2( instagram.id, instagram.secret, "https://api.instagram.com", "/oauth/authorize", "/oauth/access_token" );
    service.instagram.setAccessTokenName( instagram.token || "oauth_token");

    // WordPress (oAuth 2)
    service.wordpress = new OAuth2( wordpress.id, wordpress.secret, "https://public-api.wordpress.com", "/oauth2/authorize", "/oauth2/token" );
    service.wordpress.setAccessTokenName( wordpress.token || "oauth_token");
    service.wordpress.useAuthorizationHeaderforGET( true );

    // Vimeo (oauth 1.0)
    service.vimeo = new OAuth( "http://vimeo.com/oauth/request_token", "http://vimeo.com/oauth/access_token", vimeo.id, vimeo.secret, "1.0", vimeo.callback || '', "HMAC-SHA1" );

    // Reddit (oauth 2.0)
    var authBuff = new Buffer("" + reddit.id + ":" + reddit.secret);
    service.reddit = new OAuth2( reddit.id, reddit.secret, "https://ssl.reddit.com", "/api/v1/authorize", "/api/v1/access_token", {
        'Authorization': "Basic " + authBuff.toString('base64')
    } );

    console.log("AUTH",authBuff.toString('base64') );
    service.reddit.setAccessTokenName( reddit.token || "oauth_token");
    service.reddit.useAuthorizationHeaderforGET( true );

    // Evernote (oauth 1.0)
    service.evernote = new OAuth( "https://sandbox.evernote.com/oauth", "https://sandbox.evernote.com/oauth", evernote.id, evernote.secret, "1.0", evernote.callback || '', "HMAC-SHA1" );

};


Public.prototype.logout = function( data, callback ) {
	Private.publish( 'logging_out', { 'data': data, 'callback': callback } );
};

Public.prototype.login = function( data, callback ) {
	Private.publish( 'logging_in', { 'data': data, 'callback': callback } );

	if( 'twitter' == data.service ) {
		Private.handle_twitter( data, callback );
	} else if( 'google' === data.service ) {
		Private.handle_google( data, callback );
	} else if( 'facebook' === data.service ) {
		Private.handle_facebook( data, callback );
	} else if( 'foursquare' === data.service ) {
		Private.handle_foursquare( data, callback );
	} else if( 'tumblr' === data.service ) {
		Private.handle_tumblr( data, callback );
	} else if( 'github' === data.service ) {
		Private.handle_github( data, callback );
	} else if( 'yahoo' === data.service ) {
		Private.handle_yahoo( data, callback );
	} else if( 'linkedin' === data.service ) {
		Private.handle_linkedin( data, callback );
	} else if( 'windows' === data.service ) {
		Private.handle_windows( data, callback );
	} else if( 'instagram' === data.service ) {
        Private.handle_instagram( data, callback );
    } else if( 'wordpress' === data.service ) {
        Private.handle_wordpress( data, callback );
    } else if( 'vimeo' === data.service ) {
        Private.handle_vimeo( data, callback );
    } else if( 'evernote' === data.service ) {
        Private.handle_evernote( data, callback );
    } else if( 'reddit' === data.service ) {
        Private.handle_reddit( data, callback );
    } else if( 'blogger' === data.service ) {
        Private.handle_blogger( data, callback );
    } else if( 'youtube' === data.service ) {
        Private.handle_youtube( data, callback );
    }
};

module.exports = new Public();
