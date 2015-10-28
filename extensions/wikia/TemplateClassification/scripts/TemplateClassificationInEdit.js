/**
 * TemplateClassificationInEdit module
 *
 * Works for edit page.
 *
 * Provides selected type for TemplateClassificationModal,
 * handles type submit that is stored in hidden input in editform
 */
define('TemplateClassificationInEdit',
	['jquery', 'mw', 'TemplateClassificationModal'],
	function ($, mw, templateClassificationModal) {
		'use strict';

		var $editFormHiddenTypeField;

		function init() {
			$editFormHiddenTypeField = $('#editform').find('[name=templateClassificationType]');

			templateClassificationModal.init(getType, storeTypeForSend);

			/* Force modal on load for new pages creation */
			if (isNewArticle()) {
				templateClassificationModal.open('addTemplate');
			}
		}

		function isNewArticle() {
			return mw.config.get('wgArticleId') === 0;
		}

		function getType() {
			/* Return in format required by TemplateClassificationModal module */
			return $editFormHiddenTypeField.val();
		}

		function storeTypeForSend(templateType) {
			$editFormHiddenTypeField.val(mw.html.escape(templateType));
			templateClassificationModal.updateEntryPointLabel(templateType);
		}

		return {
			init: init,
			open: templateClassificationModal.open
		};
	}
);

require(['TemplateClassificationInEdit'], function (tc) {
	'use strict';
	$(tc.init);
});