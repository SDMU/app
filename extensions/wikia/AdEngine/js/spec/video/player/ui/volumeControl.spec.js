/*global describe, it, expect, modules, beforeEach, spyOn*/
describe('ext.wikia.adEngine.video.player.ui.volumeControl', function () {
	'use strict';

	function noop () {}

	var mocks = {
			doc: {
				createElement: function () {
					return {
						addEventListener: function (name, callback) {
							this.callback = callback;
						},
						appendChild: noop,
						classList: {
							add: noop,
							remove: noop
						},
						click: function () {
							var event = {
								preventDefault: noop
							};
							this.callback(event);
						}
					};
				}
			},
			log: noop,
			video: {
				addEventListener: noop,
				container: {
					appendChild: function (element) {
						mocks.video.volumeControl = element;
					}
				},
				isMuted: function () {
					return this.muted;
				},
				muted: false,
				setVolume: function (volume) {
					this.muted = volume === 0;
				},
				stop: noop
			}
		},
		volumeControl;

	function getModule() {
		return modules['ext.wikia.adEngine.video.player.ui.volumeControl'](
			mocks.doc,
			mocks.log
		);
	}

	beforeEach(function () {
		mocks.log.levels = {};
		mocks.video.pauseOverlay = null;

		volumeControl = getModule();
	});

	it('Click on volume control triggers video mute/unmute actions', function () {
		volumeControl.add(mocks.video);

		mocks.video.volumeControl.click();
		expect(mocks.video.muted).toBeTruthy();

		mocks.video.volumeControl.click();
		expect(mocks.video.muted).toBeFalsy();
	});
});
