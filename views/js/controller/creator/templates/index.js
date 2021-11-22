define([
    'taoQtiTest/controller/creator/config/defaults',
    'tpl!taoQtiTest/controller/creator/templates/testpart',
    'tpl!taoQtiTest/controller/creator/templates/section',
    'tpl!taoQtiTest/controller/creator/templates/rubricblock',
    'tpl!taoQtiTest/controller/creator/templates/itemref',
    'tpl!taoQtiTest/controller/creator/templates/outcomes',
    'tpl!taoQtiTest/controller/creator/templates/test-props',
    'tpl!taoQtiTest/controller/creator/templates/testpart-props',
    'tpl!taoQtiTest/controller/creator/templates/section-props',
    'tpl!taoQtiTest/controller/creator/templates/itemref-props',
    'tpl!taoQtiTest/controller/creator/templates/itemref-props-weight',
    'tpl!taoQtiTest/controller/creator/templates/rubricblock-props',
    'tpl!taoQtiTest/controller/creator/templates/category-presets',
    'tpl!taoQtiTest/controller/creator/templates/subsection'
],
function(
    defaults,
    testPart,
    section,
    rubricBlock,
    itemRef,
    outcomes,
    testProps,
    testPartProps,
    sectionProps,
    itemRefProps,
    itemRefPropsWeight,
    rubricBlockProps,
    categoryPresets,
    subsection
){
    'use strict';

    const applyTemplateConfiguration = (template) => (config) => template(defaults(config));

    /**
     * Expose all the templates used by the test creator
     * @exports taoQtiTest/controller/creator/templates/index
     */
    return {
        testpart    : applyTemplateConfiguration(testPart),
        section     : applyTemplateConfiguration(section),
        itemref     : applyTemplateConfiguration(itemRef),
        rubricblock : applyTemplateConfiguration(rubricBlock),
        outcomes    : applyTemplateConfiguration(outcomes),
        subsection  : applyTemplateConfiguration(subsection),
        properties  : {
            test            : applyTemplateConfiguration(testProps),
            testpart        : applyTemplateConfiguration(testPartProps),
            section         : applyTemplateConfiguration(sectionProps),
            itemref         : applyTemplateConfiguration(itemRefProps),
            itemrefweight   : applyTemplateConfiguration(itemRefPropsWeight),
            rubricblock     : applyTemplateConfiguration(rubricBlockProps),
            categorypresets : applyTemplateConfiguration(categoryPresets),
            subsection  : applyTemplateConfiguration(subsection)

        }
    };
});
