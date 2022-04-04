define(['exports', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/modes/defaultMode', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/modes/linearMode', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/modes/nativeMode'], function (exports, defaultMode, linearMode, nativeMode) { 'use strict';

	defaultMode = defaultMode && Object.prototype.hasOwnProperty.call(defaultMode, 'default') ? defaultMode['default'] : defaultMode;
	linearMode = linearMode && Object.prototype.hasOwnProperty.call(linearMode, 'default') ? linearMode['default'] : linearMode;
	nativeMode = nativeMode && Object.prototype.hasOwnProperty.call(nativeMode, 'default') ? nativeMode['default'] : nativeMode;



	exports.defaultModeProvider = defaultMode;
	exports.linearModeProvider = linearMode;
	exports.nativeModeProvider = nativeMode;

	Object.defineProperty(exports, '__esModule', { value: true });

});
