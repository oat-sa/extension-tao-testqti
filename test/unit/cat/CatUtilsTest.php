<?php

namespace oat\taoQtiTest\test\unit\cat;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\cat\CatUtils;
use qtism\data\storage\xml\XmlDocument;

class CatUtilsTest extends TestCase
{
    /**
     * @dataProvider getCatInfoProvider
     */
    public function testGetCatInfo($sampleFile, array $expected)
    {
        $doc = new XmlDocument();
        $doc->load($sampleFile);
        
        $info = CatUtils::getCatInfo($doc->getDocumentComponent());
        $this->assertEquals($expected, $info);
    }
    
    public function getCatInfoProvider()
    {
        return [
            [
                dirname(__FILE__) . '/../../samples/xml/cat/single-adaptive-section.xml',
                [
                    'S01' => 
                    [
                        'adaptiveEngineRef' => 'http://www.my-cat-engine.com/api/',
                        'adaptiveSettingsRef' => 'cat/settings.data',
                        'qtiUsagedataRef' => 'cat/usagedata.data',
                        'qtiMetadataRef' => 'cat/metadata.data'
                    ]
                ]
            ]
        ];
    }
}
