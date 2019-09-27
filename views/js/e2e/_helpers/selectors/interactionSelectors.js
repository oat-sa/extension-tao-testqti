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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * CSS Selectors for interactions
 */
export default {
    commonInteractionSelectors: {
        interaction: '.qti-interaction',
        qtiChoice: '.qti-choice',
        choiceArea: '.choice-area',
        resultArea: '.result-area',
        itemInstruction: '.item-instruction',
        checkboxIcon: '.icon-checkbox',
        checkboxChecked: 'input[type="checkbox"]:checked',
        qtiOrder: '.qti-orderInteraction'
    },
    matchInteractionSelectors: {
        interactionArea: '.match-interaction-area'
    },
    orderInteractionSelectors: {
        addToSelection: 'span.icon-add-to-selection',
        removeFromSelection: 'span.icon-remove-from-selection',
        moveBefore: 'span.icon-move-before',
        moveAfter: 'span.icon-move-after'
    },
    sliderInteractionSelectors: {
        sliderHandle: '.noUi-handle-lower',
        sliderBar: '.noUi-origin',
        labels: '.qti-slider-values',
        minLabel: '.slider-min',
        maxLabel: '.slider-max',
        currentValue: 'span.qti-slider-cur-value'
    },
    extendedTextInteractionSelectors: {
        textContainer: '.text-container',
        countChars: '.count-chars'
    },
    fileUploadInteractionSelectors: {
        fileUploadInput: '.file-upload input[type="file"]',
        fileUploadPreview: '.file-upload-preview',
        progressBar: '.progressbar'
    },
    mediaInteractionSelectors: {
        mediaPlayer: '.mediaplayer',
        video: '.video',
        playButton: '.playback [data-control="play"]',
        pauseButton: '.playback [data-control="pause"]',
        overlayPlayButton: '.overlay [data-control="play"]',
        overlayPauseButton: '.overlay [data-control="pause"]',
        muteSound: '.sound [data-control="mute"]',
        unmuteSound: '.sound [data-control="unmute"]',
        currentTime: '[data-control="time-cur"]',
        durationTime: '[data-control="time-end"]',
        seekSliderBar: '.seek .noUi-origin',
        seekSliderHandle: '.seek .noUi-handle-lower',
        volumeSliderBar: '.volume .noUi-base', //
        volumeSliderHandle: '.volume .noUi-handle-upper',
        volumeSliderPosition: '.volume .noUi-origin.noUi-connect', //
    },
    inlineInteractionSelectors: {
        choiceDropdown: 'div.qti-inlineChoiceInteraction',
        choiceOption: '.select2-result-label',
        choosenOption: '.select2-chosen',
        textEntry: '.qti-textEntryInteraction'
    },
    itemInstructionFeedback: {
        info: 'feedback-info',
        warning: 'feedback-warning',
        success: 'feedback-success',
        error: 'feedback-error'
    }
};
