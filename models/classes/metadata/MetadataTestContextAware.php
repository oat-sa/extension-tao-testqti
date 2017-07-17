<?php

namespace oat\taoQtiTest\models\metadata;

interface MetadataTestContextAware {
    
    public function contextualizeWithTest($testResourceIdentifier, \DOMDocument $testDocument, $itemResourceIdentifier, array $metadataValues);
}
