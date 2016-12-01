require(['wikia.window', 'jquery', 'wikia.tracker'], function (window, $, tracker) {
	'use strict';

	var track = function (data) {
		tracker.track(window.Object.assign({
			action: tracker.ACTIONS.CLICK,
			category: 'rwe-page-header',
			trackingMethod: 'analytics'
		}, data));
	};

	function addWordmarkTracking() {
		$('.rwe-page-header-nav__link, .rwe-page-header-wordmark_wrapper').on('click', function () {
			track({
				label: $(this).data().tracking
			});
		});
	}

	function openChatWindowOnClick() {
		$('.rwe-chat').on('click', function (e) {
			e.preventDefault();
			window.ChatWidget.onClickChatButton($(this).attr('href'));
		});
	}

	function initReadDropdown() {
		var firstLevelItems = $('.rwe-page-header-nav__dropdown-first-level-item'),
			secondLevelItems = $('.rwe-page-header-nav__dropdown-second-level-item');

		$('.rwe-page-header-nav__element-dropdown > .rwe-page-header-nav__link').on('click', function (e) {
			e.preventDefault();
		});

		$('.rwe-page-header-nav__dropdown-first-level-item:first-child').addClass('item-selected');
		$('.rwe-page-header-nav__dropdown-second-level')
			.find('.rwe-page-header-nav__dropdown-second-level-item:has(ul):first').addClass('item-selected');

		firstLevelItems.hover(function () {
			var self = $(this),
				secondLevel = self.find('.rwe-page-header-nav__dropdown-second-level-item:has(ul):first');

			firstLevelItems.removeClass('item-selected');
			secondLevelItems.removeClass('item-selected');
			self.addClass('item-selected');
			secondLevel.addClass('item-selected');
		});

		secondLevelItems.hover(function () {
			secondLevelItems.removeClass('item-selected');
			$(this).addClass('item-selected');
		});
	}

	function moveBannerNotifications() {
		var $globalNav = $('.wds-global-navigation-wrapper'),
			$notificationsWrapper = $('.banner-notifications-wrapper');

		$notificationsWrapper.detach();
		$notificationsWrapper.insertAfter($globalNav);

		window.BannerNotification.prototype.onShow = window.BannerNotification.prototype.show;

		window.BannerNotification.prototype.show = function () {
			this.onShow();

			var $notificationsWrapper = $('.banner-notifications-wrapper');

			$notificationsWrapper.detach();
			$notificationsWrapper.insertAfter($globalNav);

			return this;
		};
	}

	$(function () {
		addWordmarkTracking();
		initReadDropdown();
		moveBannerNotifications();
		openChatWindowOnClick();
	});
});
