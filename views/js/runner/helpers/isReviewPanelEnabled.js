define(['taoQtiTest/runner/helpers/map'], function (mapHelper) { 'use strict';

    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;

    /**
     * Tells if the review panel is enabled
     * @returns {Boolean}
     */

    function isReviewPanelEnabled(runner) {
      var reviewEnabled = mapHelper.hasItemCategory(runner.getTestMap(), runner.getTestContext().itemIdentifier, 'reviewScreen', true);
      var itemReviewEnabled = runner.getOptions().review.enabled;
      return reviewEnabled && itemReviewEnabled;
    }

    return isReviewPanelEnabled;

});
