$(function() {

var LVS = {
	init: function() {
		this.container = $('#LVSGrid');

		this.initDropDown();
		this.initCallout();
		this.initMoreSuggestions();
		this.initSwapArrow();
	},
	initDropDown: function() {
		$('.WikiaDropdown').wikiaDropdown({
			onChange: function(e, $target) {
				console.log('changed');
			}
		});
	},
	initCallout: function() {
		var callout = $('#WikiaArticle').find('.lvs-callout'),
			closeBtn = callout.find('.close');

		callout.show();

		closeBtn.on('click', function(e) {
			e.preventDefault();
			callout.slideUp();
			// TODO: implement cookie to not open again.
		});
	},
	initMoreSuggestions: function() {
		this.container.on('click', '.more-link', function(e) {
			e.preventDefault();
			var $this = $(this),
				toggleDiv = $this.parent().next('.more-videos');

			if ( $this.hasClass('expanded') ) {
				$this.removeClass('expanded');
				toggleDiv.slideUp();
			} else {
				$this.addClass('expanded');
				toggleDiv.slideDown();
			}

		});
	},
	initSwapArrow: function() {
		this.container.on('mouseover mouseout', '.swap-button', function(e) {
			var arrow = $(this).parent().siblings('.swap-arrow');

			if ( e.type == 'mouseover' ) {
				arrow.fadeIn(100);
			} else {
				arrow.fadeOut(100);
			}
		});
	}
};

LVS.init();

});