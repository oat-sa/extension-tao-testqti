define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/sectionCategory',
    'core/errorHandler'
], function (_, sectionCategory, errorHandler){

    'use strict';

    var _sectionModel = {
        'qti-type' : 'assessmentSection',
        sectionParts : [
            {
                'qti-type' : 'assessmentItemRef',
                categories : ['A', 'B']
            },
            {
                'qti-type' : 'assessmentItemRef',
                categories : ['A', 'B']
            },
            {
                'qti-type' : 'assessmentItemRef',
                categories : ['A', 'B', 'C', 'D']
            },
            {
                'qti-type' : 'assessmentItemRef',
                categories : ['A', 'B', 'D', 'E', 'F']
            }
        ]
    };

    QUnit.test('isValidSectionModel', function (assert){

        assert.ok(sectionCategory.isValidSectionModel({
            'qti-type' : 'assessmentSection',
            sectionParts : []
        }));

        assert.ok(sectionCategory.isValidSectionModel(_sectionModel));
        
        assert.ok(!sectionCategory.isValidSectionModel({
            'qti-type' : 'assessmentItemRef',
            categories : ['A', 'B', 'C', 'D']
        }));
        
        assert.ok(!sectionCategory.isValidSectionModel({
            'qti-type' : 'assessmentSection',
            noSectionParts : null
        }));
        
    });
    
    QUnit.test('getCategories', function(assert){
       var sectionModel = _.clone(_sectionModel);
       var categories = sectionCategory.getCategories(sectionModel);
       assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F'], 'all categories found');
       assert.deepEqual(categories.propagated, ['A', 'B'], 'propagated categories found');
       assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');
    });
    
    QUnit.test('addCategories', function(assert){
       
       var sectionModel = _.clone(_sectionModel);
       var categories = sectionCategory.getCategories(sectionModel);
       
       assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F'], 'all categories found');
       assert.deepEqual(categories.propagated, ['A', 'B'], 'propagated categories found');
       assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');
       
       //add a new category
       sectionCategory.addCategories(sectionModel, ['G']);
       categories = sectionCategory.getCategories(sectionModel);
       assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'all categories found');
       assert.deepEqual(categories.propagated, ['A', 'B', 'G'], 'propagated categories found');
       assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');
       
       //try adding an exiting one
       sectionCategory.addCategories(sectionModel, ['A', 'C']);
       assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'all categories found');
       assert.deepEqual(categories.propagated, ['A', 'B', 'G'], 'propagated categories found');
       assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');
    });
    
//    QUnit.test('removeCategories', function(assert){
//       
//       var sectionModel = _.clone(_sectionModel);
//       var categories = sectionCategory.getCategories(sectionModel);
//       
//       assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F'], 'all categories found');
//       assert.deepEqual(categories.propagated, ['A', 'B'], 'propagated categories found');
//       assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');
//       
//       sectionCategory.addCategories(sectionModel, ['G']);
//       categories = sectionCategory.getCategories(sectionModel);
//       assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'all categories found');
//       assert.deepEqual(categories.propagated, ['A', 'B', 'G'], 'propagated categories found');
//       assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');
//    });
});