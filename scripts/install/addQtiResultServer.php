<?php
$class = taoResultServer_models_classes_ResultServerAuthoringService::singleton()->getResultServerClass();
$resultServer = $class->createInstanceWithProperties(array(
    RDFS_LABEL => 'QTI Test Result Server',
    PROPERTY_RESULTSERVER_ENDPOINT => QTITEST_RESULT_SERVER
));

$ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
$ext->setConfig(QTITEST_RESULT_SERVER_CONFIG_KEY, $resultServer->getUri());