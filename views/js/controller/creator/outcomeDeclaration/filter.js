define(['lodash', 'taoQtiTest/controller/creator/helpers/outcome', 'taoQtiTest/controller/creator/helpers/scoring'],
    function (_, outcomeHelper, scoringHelper) {
        function getGeneratedOutcomeIdentifiers(testModel) {
            // Collect all identifiers from outcome processing rules
            const generatedIdentifiers = [];
            outcomeHelper.eachOutcomeProcessingRuleExpressions(testModel, (rule) => {
                const identifier = outcomeHelper.getProcessingRuleProperty(rule, 'setOutcomeValue.identifier');
                if (identifier) {
                    generatedIdentifiers.push(identifier);
                }
            });

            // Collect all identifiers from outcomesRecipes
            const recipeIdentifiers = [];
            _.forEach(scoringHelper.outcomesRecipes, (recipe) => {
                if (recipe.outcomes) {
                    recipe.outcomes.forEach((outcome) => {
                        if (outcome.identifier) {
                            recipeIdentifiers.push(outcome.identifier);
                        }
                    });
                }
            });

            const feedbackScoreIdentifier = ['PASS_ALL_RENDERING'];

            // Combine all identifiers to exclude
            return _.uniq([
                ...generatedIdentifiers, ...recipeIdentifiers, ...feedbackScoreIdentifier
            ]);
        }

        /**
         * Filters out dynamically generated outcomeDeclarations based on identifiers.
         *
         * @param {Object} testModel - The test model containing outcomeDeclarations and processing rules.
         * @returns {Array} - The filtered list of outcomeDeclarations.
         */
        function filterManualOutcomeDeclarations(testModel) {
            excludedIdentifiers = getGeneratedOutcomeIdentifiers(testModel);
            // Filter out outcomeDeclarations with matching identifiers
            return testModel.outcomeDeclarations.filter((outcome) => {
                const outcomeIdentifier = outcomeHelper.getOutcomeIdentifier(outcome);
                return !excludedIdentifiers.includes(outcomeIdentifier);
            });
        }

        function filterGeneratedOutcomeDeclarations(testModel) {
            generatedIdentifiers = getGeneratedOutcomeIdentifiers(testModel);
            // Filter out outcomeDeclarations with matching identifiers
            return testModel.outcomeDeclarations.filter((outcome) => {
                const outcomeIdentifier = outcomeHelper.getOutcomeIdentifier(outcome);
                return excludedIdentifiers.includes(outcomeIdentifier);
            });
        }

        return {
            filterManualOutcomeDeclarations,
            filterGeneratedOutcomeDeclarations
        };
    });
