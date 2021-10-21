export default {
    addTest: '[data-context="resource"][data-action="instanciate"]',
    addSubClassUrl: 'taoTests/Tests/addSubClass',

    deleteClass: '[data-context="resource"][data-action="removeNode"]',
    deleteTestUrl: 'taoTests/Tests/delete',
    deleteConfirm: '[data-control="ok"]',

    editClassLabelUrl: 'taoTests/Tests/editClassLabel',
    editTestUrl: 'taoTests/Tests/editTest',

    root: '[data-uri="http://www.tao.lu/Ontologies/TAOTest.rdf#Test"]',

    testForm: 'form[action="/taoTests/Tests/editTest"]',
    testClassForm: 'form[action="/taoTests/Tests/editClassLabel"]',
    treeRenderUrl: 'taoTests/Tests',

    authoring: '[data-context="instance"][data-action="launchEditor"]',
    addSection: '[data-testid="add-section"]',
    addPart: '[data-testid="add-test-part"]'
};
