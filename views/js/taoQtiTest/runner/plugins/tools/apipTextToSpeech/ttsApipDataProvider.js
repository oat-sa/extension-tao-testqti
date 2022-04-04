define(function () { 'use strict';

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
     * Copyright (c) 2016-2019  (original work) Open Assessment Technologies SA;
     *
     * @author Anton Tsymuk <anton@taotesting.com>
     */

    /**
     * Extract TTS data from APIP item data
     *
     * @param {Object} apipElement - APIP item Data
     * @returns {Object}
     */
    var getTTSItemData = function getTTSItemData(apipElement) {
      var identifier = apipElement['@attributes'].identifier;
      var _apipElement$contentL = apipElement.contentLinkInfo,
          contentLinkInfo = _apipElement$contentL === void 0 ? {
        '@attributes': {}
      } : _apipElement$contentL,
          _apipElement$relatedE = apipElement.relatedElementInfo;
      _apipElement$relatedE = _apipElement$relatedE === void 0 ? {} : _apipElement$relatedE;
      var _apipElement$relatedE2 = _apipElement$relatedE.spoken;
      _apipElement$relatedE2 = _apipElement$relatedE2 === void 0 ? {} : _apipElement$relatedE2;
      var _apipElement$relatedE3 = _apipElement$relatedE2.audioFileInfo,
          audioFileInfo = _apipElement$relatedE3 === void 0 ? [] : _apipElement$relatedE3;

      var _ref = audioFileInfo.find(function (audioFile) {
        return audioFile['@attributes'].mimeType === 'audio/mpeg';
      }) || {},
          _ref$fileHref = _ref.fileHref,
          fileHref = _ref$fileHref === void 0 ? '' : _ref$fileHref;

      var elementId = contentLinkInfo['@attributes'].qtiLinkIdentifierRef;
      return {
        identifier: identifier,
        selector: elementId && "#".concat(elementId),
        url: fileHref.replace('assets/', '')
      };
    };
    /**
     * Get APIP item order from APIP order data
     *
     * @param {String} identifier - APIP item identifier
     * @param {Object} elementOrder - APIP order data
     * @returns {Number}
     */


    var getTTSItemOrder = function getTTSItemOrder(identifier, elementOrder) {
      var _ref2 = elementOrder.find(function (apipElementOrder) {
        return apipElementOrder['@attributes'].identifierRef === identifier;
      }) || {},
          order = _ref2.order;

      return parseInt(order) || Number.POSITIVE_INFINITY;
    };
    /**
     * Extract data related to Text To Speech from item APIP data
     * @param {Object} apipData
     * @returns {Object}
     */


    var ttsApipDataProvider = (function (apipData) {
      var _apipData$accessibili = apipData.accessibilityInfo;
      _apipData$accessibili = _apipData$accessibili === void 0 ? {} : _apipData$accessibili;
      var _apipData$accessibili2 = _apipData$accessibili.accessElement,
          accessElement = _apipData$accessibili2 === void 0 ? [] : _apipData$accessibili2,
          _apipData$inclusionOr = apipData.inclusionOrder;
      _apipData$inclusionOr = _apipData$inclusionOr === void 0 ? {} : _apipData$inclusionOr;
      var _apipData$inclusionOr2 = _apipData$inclusionOr.textGraphicsDefaultOrder;
      _apipData$inclusionOr2 = _apipData$inclusionOr2 === void 0 ? {} : _apipData$inclusionOr2;
      var _apipData$inclusionOr3 = _apipData$inclusionOr2.elementOrder,
          elementOrder = _apipData$inclusionOr3 === void 0 ? [] : _apipData$inclusionOr3;
      return accessElement.map(getTTSItemData).filter(function (_ref3) {
        var url = _ref3.url;
        return !!url;
      }).sort(function (a, b) {
        return getTTSItemOrder(a.identifier, elementOrder) - getTTSItemOrder(b.identifier, elementOrder);
      });
    });

    return ttsApipDataProvider;

});
