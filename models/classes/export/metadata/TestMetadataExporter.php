<?php

namespace oat\taoQtiTest\models\export\metadata;


interface TestMetadataExporter
{
    const SERVICE_ID = 'taoQtiTest/metadataExporter';

    const OPTION_FILE_NAME = 'fileName';

    /**
     * Main action to launch export
     *
     * @param string $uri
     * @return mixed
     */
    public function export($uri);
}