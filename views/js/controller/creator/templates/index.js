define([
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
    'tpl!taoQtiTest/controller/creator/templates/category-presets'
],
function(
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
    categoryPresets
){
    'use strict';

    /**
     * Expose all the templates used by the test creator
     * @exports taoQtiTest/controller/creator/templates/index
     */
    return {
        'testpart'      : testPart,
        'section'       : section,
        'itemref'       : itemRef,
        'rubricblock'   : rubricBlock,
        'outcomes'      : outcomes,
        'properties'    : {
            'test'      : testProps,
            'testpart'  : testPartProps,
            'section'   : sectionProps,
            'itemref'   : itemRefProps,
            'itemrefweight'     : itemRefPropsWeight,
            'rubricblock'       : rubricBlockProps,
            'categorypresets'  : categoryPresets
        }
    };
});
