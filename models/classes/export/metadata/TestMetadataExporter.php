<?php

namespace oat\taoQtiTest\models\export\metadata;


interface TestMetadataExporter
{
    const SERVICE_ID = 'taoQtiTest/metadataExporter';

    /**
     * Main action to launch export
     *
     * @param string $uri
     * @return mixed
     */
    public function export($uri);
}