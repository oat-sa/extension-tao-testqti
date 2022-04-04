define(['jquery', 'util/typeCaster', 'taoTests/runner/plugin'], function ($, typeCaster, pluginFactory) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    typeCaster = typeCaster && Object.prototype.hasOwnProperty.call(typeCaster, 'default') ? typeCaster['default'] : typeCaster;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;

    /**
     * This program is free software; you can redistribute it and/or
     * modify it under the terms of the GNU General Public License
     * as published by the Free Software Foundation; under version 2
     * of the License (non-upgradable).
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU General Public License for more details.
     *
     * You should have received a copy of the GNU General Public License
     * along with this program; if not, write to the Free Software
     * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
     *
     * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
     */
    /**
     * Creates the loading bar plugin.
     * Displays a loading bar when a blocking task is running
     */

    var itemScrolling = pluginFactory({
      name: 'itemScrolling',

      /**
       * Initializes the plugin (called during runner's init)
       */
      init: function init() {
        var testRunner = this.getTestRunner();
        var $contentArea = testRunner.getAreaBroker().getContentArea();
        var gridRowBottomMargin = 12,
            qtiItemPadding = 30 * 2;
        testRunner.on('renderitem', function () {
          adaptItemHeight();
          $(window).off('resize.adaptItemHeight');
          $(window).on('resize.adaptItemHeight', adaptItemHeight);
        });

        function adaptItemHeight() {
          var $itemContainer = $contentArea.find('[data-scrolling="true"]');
          var contentHeight = getItemRunnerHeight() - getExtraGridRowHeight() - getSpaceAboveQtiContent() - gridRowBottomMargin - qtiItemPadding;
          $itemContainer.each(function () {
            var $item = $(this);
            var isScrollable = typeCaster.strToBool($item.attr('data-scrolling') || 'false');
            var selectedHeight = parseFloat($item.attr('data-scrolling-height')) || 100;
            var containerParent = $item.parent().closest('[data-scrolling="true"]');

            if ($item.length && isScrollable) {
              $item.data('scrollable', true);
              $item.css({
                'overflow-y': 'scroll'
              });

              if (containerParent.length > 0) {
                $item.css('max-height', "".concat(containerParent.height() * (selectedHeight * 0.01), "px"));
              } else {
                $item.css('max-height', "".concat(contentHeight * (selectedHeight * 0.01), "px"));
              }
            }
          });
        } // depending on the context (item preview, new/old test runner...) available height is computed differently


        function getItemRunnerHeight() {
          var $testRunnerSections = $('.test-runner-sections'); // exists only in the new test runner

          if ($testRunnerSections.length) {
            return $testRunnerSections.get(0).getBoundingClientRect().height;
          } // otherwise, we assume that we are in an iframe with all space available (= item preview, old test runner)


          return $(window).height();
        } // extra grid row are there in case of a vertical layout (item on top/bottom of the question)


        function getExtraGridRowHeight() {
          var $gridRows = $('.qti-itemBody > .grid-row'),
              extraHeight = 0;
          $gridRows.each(function () {
            var $gridRow = $(this),
                $itemContainer = $gridRow.find('[data-scrolling="true"]');

            if (!$itemContainer.length) {
              extraHeight += $gridRow.outerHeight(true);
            }
          });
          return extraHeight;
        } // most of the time this will be rubrick's block height in the new test runner


        function getSpaceAboveQtiContent() {
          var $testRunnerSections = $('.test-runner-sections'),
              $qtiContent = $('#qti-content');

          if ($testRunnerSections.length && $qtiContent.length) {
            return $qtiContent.get(0).getBoundingClientRect().top - $testRunnerSections.get(0).getBoundingClientRect().top;
          }

          return 0;
        }
      }
    });

    return itemScrolling;

});
