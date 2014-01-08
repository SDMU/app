/* global GlobalNotification, Modernizr */

( function( window, $ ) {
	'use strict';

	var lockedFeatures = {};

	function init() {
		var $wikifeatures = $( '#WikiFeatures' ),
			$sliders = $wikifeatures.find('.slider');

		if ( !Modernizr.csstransforms ) {
			$( '.representation' ).removeClass( 'promotion' );
		}

		$sliders.click( function ( event ) {
			event.preventDefault();
			
			var $el = $( this ),
				feature = $el.closest( '.feature' ),
				featureName = feature.data( 'name' ),
				isEnabled,
				modalTitle;

			if ( !lockedFeatures[ featureName ] ) {
				isEnabled = $el.hasClass( 'on' );

				if ( isEnabled ) {
					modalTitle = $.msg( 'wikifeatures-deactivate-heading', feature.find( 'h3' ).text().trim() );

					require( [ 'wikia.ui.factory' ], function ( uiFactory ) {
						uiFactory.init( [ 'modal' ] ).then( function ( uiModal ) {
							var deactivateModalConfig = {
								vars: {
									id: 'DeactivateDialog',
									size: 'small',
									title: modalTitle,
									content: [
										'<p>',
										$.msg( 'wikifeatures-deactivate-description' ),
										'</p><p>',
										$.msg( 'wikifeatures-deactivate-notification' ),
										'</p>'
									].join( '' ),
									buttons: [
										{
											vars: {
												value: $.msg( 'wikifeatures-deactivate-confirm-button' ),
												classes: [ 'normal', 'primary' ],
												data: [
													{
														key: 'event',
														value: 'confirm'
													}
												]
											}
										},
										{
											vars: {
												value: $.msg( 'wikifeatures-deactivate-cancel-button' ),
												data: [
													{
														key: 'event',
														value: 'close'
													}
												]
											}
										}
									]
								}
							};

							uiModal.createComponent( deactivateModalConfig, function ( deactivateModal ) {
								deactivateModal.bind( 'confirm', function ( event ) {
									event.preventDefault();
									toggleFeature( featureName, false );
									$el.toggleClass( 'on' );
									deactivateModal.trigger( 'close' );
								} );
								deactivateModal.show();
							} );
						} );
					} );
				} else {
					toggleFeature( featureName, true );
					$el.toggleClass( 'on' );
				}
			}
		} );

		$( 'body' ).on( 'input propertychange', '#feedbackDialogModal [name=comment]', function () {
			var $this = $( this ),
				chars = this.value.length,
				elemParent = $this.closest( '#feedbackDialogModal' ),
				$counter = elemParent.find( '.comment-character-count' ),
				$label = elemParent.find( '.comment-group label' );

			$counter.html( chars + ' / 1000' );

			// Force re-paint HACK

			// Please do not touch those two lines - repainting is breaking in
			// some cases (mostly on subsequent opening the modal window,
			// but sometimes on first and sometimes it just works) - another
			// fix is toggling this element's CSS directly IN BROWSER'S INSPECTOR.

			// We've tried different hacks (javascript, adding 3D acceleration in
			// CSS, etc.), but it's only one that works.

			$counter.css( 'display', 'none' ).height(); // Force re-paint HACK
			$counter.css( 'display', 'block' );         // Force re-paint HACK

			if ( chars > 1000 ) {
				$this.addClass( 'invalid' );
				$label.addClass( 'invalid' );
			} else {
				$this.removeClass( 'invalid' );
				$label.removeClass( 'invalid' );
			}
		} );

		$wikifeatures.find('.feedback' ).click( function ( e ) {
			e.preventDefault();

			var feature = $( this ).closest( '.feature' );

			$.nirvana.sendRequest( {
				type: 'get',
				format: 'json',
				controller: 'WikiFeaturesSpecial',
				method: 'getFeedbackModal',
				data: {
					featureName: feature.data( 'heading' ),
					featureImageUrl: feature.find( '.representation img' ).attr( 'src' )
				},
				callback: function ( data ) {
					openFeedbackModal( feature, data );
				}
			} );
		} );
	}

	function openFeedbackModal( featureElem, data ) {
		require( [ 'wikia.ui.factory' ], function ( uiFactory ) {
			uiFactory.init( [ 'modal' ] ).then( function ( uiModal ) {
				var feedbackModalConfig = {
					vars: {
						id: 'feedbackDialogModal',
						size: 'medium',
						title: data.title,
						content: data.html,
						buttons: [
							{
								vars: {
									value: data.labelSubmit,
									classes: [ 'normal', 'primary' ],
									data: [
										{
											key: 'event',
											value: 'submit'
										}
									]
								}
							}
						]
					}
				};

				uiModal.createComponent( feedbackModalConfig, function ( feedbackModal ) {
					var modal = feedbackModal.$element,
						comment = modal.find( 'textarea[name=comment]' ),
						submitButton = modal.find( '[data-event=submit]' ),
						statusMsg = modal.find( '.status-msg' ),
						msgHandle = 0;

					feedbackModal.bind( 'submit', function ( event ) {
						event.preventDefault();
						submitButton.attr( 'disabled', 'true' );
						$.post( window.wgScriptPath + '/wikia.php', {
							controller: 'WikiFeaturesSpecial',
							method: 'saveFeedback',
							format: 'json',
							feature: featureElem.data( 'name' ),
							category: modal.find( 'select[name=feedback] option:selected' ).val(),
							message: comment.val()
						}, function ( res ) {
							if ( res.result === 'ok' ) {
								clearTimeout( msgHandle );
								statusMsg.removeClass( 'invalid' ).text( res.msg ).show();
								setTimeout( function () {
									feedbackModal.trigger( 'close' );
								}, 3000 );
							} else if ( res.result === 'error' ) {
								submitButton.removeAttr( 'disabled' );
								statusMsg.addClass( 'invalid' ).text( res.error ).show();
								msgHandle = setTimeout( function () {
									statusMsg.fadeOut( 1000 );
								}, 4000 );
							} else {
								GlobalNotification.show( 'Something is wrong', 'error' );
							}
						} );
					} );

					feedbackModal.show();
				} );
			} );
		} );
	}

	function toggleFeature( featureName, enable ) {
		lockedFeatures[featureName] = true;

		$.post( window.wgScriptPath + '/wikia.php', {
			controller: 'WikiFeaturesSpecial',
			method: 'toggleFeature',
			format: 'json',
			feature: featureName,
			enabled: enable
		}, function ( res ) {
			if ( res.result === 'ok' ) {
				lockedFeatures[featureName] = false;
			} else {
				GlobalNotification.show( res.error, 'error' );
			}
		} );
	}

	$( function() {
		init();
	} );

} )( window, jQuery );
