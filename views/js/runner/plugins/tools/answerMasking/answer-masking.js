define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/sts/stsEventManager'
], function ($, _, eventManager) {
    'use strict';

    function AnswerMasking(options) {
        var self = this,
            defaultOptions = {
                choiceContainerSelector : '.qti-choiceInteraction', //available only for choice interaction
                choiceSelector : '.qti-choice',
                eventNS : 'parccAnswerMasking'
            };

        /**
         * Container of choices
         *
         * @type {jQueryElement}
         */
        this.$choiceContainer = null;

        /**
         * Whether the masking mode is enabled (button pressed)
         *
         * @type {jQueryElement}
         */
        this.active = false;

        /**
         * List of tools id that can't be used with current tool.
         *
         * @type {array}
         */
        this.mutuallyExclusiveTools = ['parccEliminateAnswerChoices'];

        /**
         * Tool button on the student tools panel
         *
         * @type {jQueryElement}
         */
        this.$toolButton = null;

        /**
         * Init function
         * @returns {undefined}
         */
        this.init = function () {
            options = _.merge(defaultOptions, options);

            self.$choiceContainer = self.getChoiceContainer();
            self.$toolButton = options.$container.find('.sts-button');

            if (!(self.$choiceContainer instanceof $)) {
                throw new TypeError("options.choiceContainerSelector option should be selector of existing element.");
            }
            
            if (options.scenario) {
                if ((self.$choiceContainer.find(options.choiceSelector).length <= 1 && options.scenario === 'runtime')
                    || options.scenario === 'authoring'
                ) {
                    self.$toolButton.addClass('disabled');
                    return;
                } 
            }

            options.$container.on('click', '.sts-button', function () {
                if (!self.active) {
                    self.enable();
                } else {
                    self.disable();
                }
            });

            eventManager.on('stsEnabled', function (data) {
                if (data && data.stsName && self.mutuallyExclusiveTools.indexOf(data.stsName) >= 0) {
                    self.destroy();
                }
            });
        };

        /**
         * Get choice container.
         * @returns {jQueryElement}
         */
        this.getChoiceContainer = function () {
            if (!self.$choiceContainer || self.$choiceContainer.length === 0 || !$.contains(document, self.$choiceContainer[0])) {
                self.$choiceContainer = $(options.choiceContainerSelector);
            }

            return self.$choiceContainer;
        };

        /**
         * Enable masking mode. Hide all choices and render show button.
         *
         * @returns {undefined}
         */
        this.enable = function () {
            var $mask;

            self.$choiceContainer = self.getChoiceContainer();

            if (this.active || self.$choiceContainer.length === 0) {
                return;
            }

            eventManager.trigger('stsEnabled', [{stsName : options.id}]);

            options.$container.find('.sts-button').addClass('active');
            self.active = true;

            self.$choiceContainer.addClass('js-choice-masking');

            self.$choiceContainer.find(options.choiceSelector).each(function () {
                $mask = $('<div class="js-masking-choice-wrap masking-choice-wrap"></div>');
                $mask.append($('<span class="js-mask-toggle mask-toggle icon-eye-slash"></span>'));
                $mask.on('click', function () {
                    return false;
                });
                $(this).prepend($mask);
            });

            self.$choiceContainer.find('.js-masking-choice-wrap .js-mask-toggle')
                .on('click.' + options.eventNS, function () {
                    var $choice = $(this).closest(options.choiceSelector);
                    self.toggleState($choice);
                    return false;
                });

            this.toggleState();
        };

        /**
         * Toggle choice state
         * @param {jQueryElement} $choices Choices to be toggled. If parameter is not given then all choices will be masked.
         * @returns {undefined}
         */
        this.toggleState = function ($choices) {
            self.$choiceContainer = self.getChoiceContainer();

            if (!$choices || !$choices.length) {
                $choices = self.$choiceContainer.find(options.choiceSelector);
            }

            $choices.toggleClass('masked-choice');

            $choices.find('input:visible')
                    .prop('checked', false)
                    .trigger('change');

            self.saveInteractionState();
        };

        /**
         * Save the current masked choices
         */
        this.saveInteractionState = function () {
            self._choices = [];
            self.$choiceContainer.find(options.choiceSelector + ':not(.masked-choice)').each(function () {
                var choiceSerial = $(this).data('serial');
                self._choices.push(choiceSerial);
            });
        };

        /**
         * Get the list of visible choices
         * @returns {Array} the list of choice serials
         */
        this.getInteractionState = function getInteractionState() {
            return this._choices || [];
        };

        /**
         * Set the list of visible choices
         * @param {Array} choices - the list of choice serials-
         */
        this.setInteractionState = function setInteractionState(choices) {
            if (_.isArray(choices)) {
                this._choices = choices;
                _.forEach(choices, function (serial) {
                    self.toggleState($(options.choiceSelector + '[data-serial="' + serial + '"]'));
                });
            }
        };

        /**
         * Disable masking mode and save state.
         * @returns {undefined}
         */
        this.disable = function () {
            if (!this.active) {
                return;
            }
            options.$container.find('.sts-button').removeClass('active');
            self.active = false;

            self.$choiceContainer = self.getChoiceContainer();
            self.$choiceContainer.find('.masking-choice-wrap').remove();
            self.$choiceContainer.find(options.choiceSelector).removeClass('masked-choice');
            self.$choiceContainer.off('.' + options.eventNS);

            self.saveInteractionState();
        };

        /**
         * Destroy and disable all changes
         * @returns {undefined}
         */
        this.destroy = function () {
            this.disable();
        };

        this.init();
    }

    return AnswerMasking;
});
