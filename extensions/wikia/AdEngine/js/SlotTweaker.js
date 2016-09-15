/*global define*/
define('ext.wikia.adEngine.slotTweaker', [
	'wikia.log',
	'wikia.browserDetect',
	'wikia.document',
	'wikia.window',
	'ext.wikia.adEngine.domElementTweaker',
	'ext.wikia.aRecoveryEngine.recovery.helper'
], function (log, browser, doc, win, DOMElementTweaker, recoveryHelper) {
	'use strict';

	var logGroup = 'ext.wikia.adEngine.slotTweaker',
		defaultHeightClass = 'default-height',
		standardLeaderboardSizeClass = 'standard-leaderboard';

	function hide(slotname, useInline) {
		log('hide ' + slotname + ' using class hidden', 6, logGroup);

		var slot = doc.getElementById(slotname);

		if (slot && useInline) {
			slot.style.display = 'none';
		} else if (slot) {
			DOMElementTweaker.removeClass(slot, 'hidden');
			slot.className += ' hidden';
		}
	}

	function show(slotname) {
		log('show ' + slotname + ' removing class hidden', 6, logGroup);

		var slot = doc.getElementById(slotname);

		if (slot) {
			DOMElementTweaker.removeClass(slot, 'hidden');
		}
	}

	function removeDefaultHeight(slotname) {
		var slot = doc.getElementById(slotname);

		log('removeDefaultHeight ' + slotname, 6, logGroup);

		if (slot) {
			DOMElementTweaker.removeClass(slot, defaultHeightClass);
		}
	}

	function isTopLeaderboard(slotname) {
		return slotname.indexOf('TOP_LEADERBOARD') !== -1;
	}

	function isStandardLeaderboardSize(slotname) {
		var slot = doc.getElementById(slotname),
			isStandardSize;

		if (slot) {
			isStandardSize = slot.offsetHeight >= 90 && slot.offsetHeight <= 95 && slot.offsetWidth <= 728;

			log(
				['isStandardLeaderboardSize', slotname, slot.offsetWidth + 'x' + slot.offsetHeight, isStandardSize],
				3,
				logGroup
			);

			return isStandardSize;
		}
		log('isStandardLeaderboardSize: ' + slotname + ' missing', 3, logGroup);
	}

	function addDefaultHeight(slotname) {
		var slot = doc.getElementById(slotname);

		log('addDefaultHeight ' + slotname, 6, logGroup);

		if (slot) {
			slot.className += ' ' + defaultHeightClass;
		}
	}

	// TODO: fix it, it's a hack!
	function adjustLeaderboardSize(slotname) {
		var slot = doc.getElementById(slotname);
		if (isTopLeaderboard(slotname) && isStandardLeaderboardSize(slotname)) {
			slot.className += ' ' + standardLeaderboardSizeClass;
		}
	}

	// TODO: fix it, it's a hack!
	function removeTopButtonIfNeeded(slotname) {
		if (isTopLeaderboard(slotname) && isStandardLeaderboardSize(slotname)) {
			win.Wikia.reviveQueue = win.Wikia.reviveQueue || [];

			win.Wikia.reviveQueue.push({
				zoneId: 27,
				slotName: 'TOP_BUTTON_WIDE'
			});
		}
	}

	function getRecoveredIframe(slotName) {
		var fallbackId = win._sp_.getElementId(document.querySelectorAll('div[id="' + slotName + '"] div')[1].id);
		return doc.getElementById(fallbackId).querySelector('div:not(.hidden) > div[id*="_container_"] iframe');
	}

	function onReady(slotName, callback) {
		var iframe = doc.getElementById(slotName).querySelector('div:not(.hidden) > div[id*="_container_"] iframe');

		if (!iframe && !recoveryHelper.isBlocking()) {
			log('onIframeReady - iframe does not exist', 'debug', logGroup);
			return;
		}

		if (!iframe && recoveryHelper.isBlocking()) {
			log('onIframeReady - trying fallback iframe', 'debug', logGroup);
			iframe = getRecoveredIframe(slotName);

			if (!iframe) {
				log('onIframeReady - fallback iframe does not exist', 'debug', logGroup);
				return;
			}
		}

		if (iframe.contentWindow.document.readyState === 'complete') {
			callback(iframe);
		} else {
			iframe.addEventListener('load', function () {
				callback(iframe);
			});
		}
	}

	function getRecoveredProviderContainer(providerContainer) {
		var element = document.getElementById(win._sp_.getElementId(providerContainer.childNodes[0].id));
		if (element && element.parentNode) {
			return element.parentNode;
		} else {
			return null;
		}
	}

	function tweakRecoveredSlot(adContainer) {
		var className = 'tmpHeader';

		if (browser.isIE() || browser.isEdge()) {
			return;
		}

		adContainer.className += ' ' + className;
		DOMElementTweaker.recursiveMoveStylesToInline(adContainer);
		DOMElementTweaker.removeClass(adContainer, className);
	}

	function makeResponsive(slotName, aspectRatio) {
		var providerContainer = doc.getElementById(slotName).lastElementChild;

		if (recoveryHelper.isBlocking()) {

			var recoveredProviderContainer = getRecoveredProviderContainer(providerContainer);

			if (recoveredProviderContainer) {
				providerContainer = recoveredProviderContainer;
			}
		}

		log(['makeResponsive', slotName, aspectRatio], 'info', logGroup);

		onReady(slotName, function (iframe) {
			log(['makeResponsive', slotName], 'debug', logGroup);
			if (!aspectRatio) {
				var height = iframe.contentWindow.document.body.scrollHeight,
					width = iframe.contentWindow.document.body.scrollWidth;

				aspectRatio = width/height;
			}

			log(['Slot ratio', aspectRatio], 'debug', logGroup);
			providerContainer.style.paddingBottom = 100/aspectRatio + '%';
		});
	}

	function adjustIframeByContentSize(slotName) {
		onReady(slotName, function (iframe) {
			var height = iframe.contentWindow.document.body.scrollHeight,
				width = iframe.contentWindow.document.body.scrollWidth;

			iframe.width = width;
			iframe.height = height;
			log(['adjustIframeByContentSize', slotName, width, height], 'debug', logGroup);
		});
	}

	function noop() {
		return;
	}

	/**
	 * Triggers repaint to hide empty slot placeholders in Chrome
	 * This is a temporary workaround
	 * @param {string} slotId
	 */
	function hackChromeRefresh(slotId) {
		var slot = doc.getElementById(slotId),
			parent = slot && slot.parentElement;

		if (parent && slotId.match(/^INCONTENT/)) {
			parent.style.display = 'none';
			noop(parent.offsetHeight);
			parent.style.display = '';
		}
	}

	return {
		addDefaultHeight: addDefaultHeight,
		adjustIframeByContentSize: adjustIframeByContentSize,
		adjustLeaderboardSize: adjustLeaderboardSize,
		hackChromeRefresh: hackChromeRefresh,
		hide: hide,
		isTopLeaderboard: isTopLeaderboard,
		makeResponsive: makeResponsive,
		onReady: onReady,
		removeDefaultHeight: removeDefaultHeight,
		removeTopButtonIfNeeded: removeTopButtonIfNeeded,
		show: show,
		tweakRecoveredSlot: tweakRecoveredSlot
	};
});
