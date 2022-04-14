define(['exports', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/headerNavigation', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/toolbarNavigation', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/topToolbarNavigation', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/navigatorNavigation', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/pageNavigation', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/rubricsNavigation', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/itemNavigation', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/linearItemNavigation', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/stimulusNavigation', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/strategies/jumpLinks'], function (exports, headerNavigation, toolbarNavigation, topToolbarNavigation, navigatorNavigation, pageNavigation, rubricsNavigation, itemNavigation, linearItemNavigation, stimulusNavigation, jumpLinks) { 'use strict';

	headerNavigation = headerNavigation && Object.prototype.hasOwnProperty.call(headerNavigation, 'default') ? headerNavigation['default'] : headerNavigation;
	toolbarNavigation = toolbarNavigation && Object.prototype.hasOwnProperty.call(toolbarNavigation, 'default') ? toolbarNavigation['default'] : toolbarNavigation;
	topToolbarNavigation = topToolbarNavigation && Object.prototype.hasOwnProperty.call(topToolbarNavigation, 'default') ? topToolbarNavigation['default'] : topToolbarNavigation;
	navigatorNavigation = navigatorNavigation && Object.prototype.hasOwnProperty.call(navigatorNavigation, 'default') ? navigatorNavigation['default'] : navigatorNavigation;
	pageNavigation = pageNavigation && Object.prototype.hasOwnProperty.call(pageNavigation, 'default') ? pageNavigation['default'] : pageNavigation;
	rubricsNavigation = rubricsNavigation && Object.prototype.hasOwnProperty.call(rubricsNavigation, 'default') ? rubricsNavigation['default'] : rubricsNavigation;
	itemNavigation = itemNavigation && Object.prototype.hasOwnProperty.call(itemNavigation, 'default') ? itemNavigation['default'] : itemNavigation;
	linearItemNavigation = linearItemNavigation && Object.prototype.hasOwnProperty.call(linearItemNavigation, 'default') ? linearItemNavigation['default'] : linearItemNavigation;
	stimulusNavigation = stimulusNavigation && Object.prototype.hasOwnProperty.call(stimulusNavigation, 'default') ? stimulusNavigation['default'] : stimulusNavigation;
	jumpLinks = jumpLinks && Object.prototype.hasOwnProperty.call(jumpLinks, 'default') ? jumpLinks['default'] : jumpLinks;



	exports.headerNavigationStrategy = headerNavigation;
	exports.toolbarNavigationStrategy = toolbarNavigation;
	exports.topToolbarNavigationStrategy = topToolbarNavigation;
	exports.navigatorNavigationStrategy = navigatorNavigation;
	exports.pageNavigationStrategy = pageNavigation;
	exports.rubricsNavigationStrategy = rubricsNavigation;
	exports.itemNavigationStrategy = itemNavigation;
	exports.linearItemNavigationStrategy = linearItemNavigation;
	exports.stimulusNavigationStrategy = stimulusNavigation;
	exports.jumpLinksNavigationStrategy = jumpLinks;

	Object.defineProperty(exports, '__esModule', { value: true });

});
