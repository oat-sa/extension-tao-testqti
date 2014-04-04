<?php

use qtism\data\storage\xml\XmlDocument;

require_once dirname(__FILE__) . '/../../tao/test/TaoPhpUnitTestRunner.php';
include_once dirname(__FILE__) . '/../includes/raw_start.php';

/**
 * Integration test of the {@link taoQtiTest_models_classes_QtiTestConverter} class.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @package taoQtiTest
 
 */
class QtiTestConverterTest extends TaoPhpUnitTestRunner {
    
//     "rubricBlocks" : [ { "content" : [  ],
//                    "rubricBlock" : { "content" : [  ],
//                        "qti-type" : "rubricBlock",
//                        "views" : [ 1 ]
//                      },
//                    "views" : [ "" ]
//                  } ],
    
    /**
     * Data provider 
     * @return array[] the parameters
     */
    public function dataProvider(){
        
        $testPath = dirname(__FILE__) . '/data/qtitest.xml';
       $json = '{ "identifier" : "testId",
  "outcomeDeclarations" : [  ],
  "qti-type" : "assessmentTest",
  "testFeedbacks" : [  ],
  "testParts" : [ { "assessmentSections" : [ { "branchRules" : [  ],
              "fixed" : false,
              "identifier" : "assessmentSection-1",
              "index" : 0,
              "keepTogether" : true,
              "preConditions" : [  ],
              "qti-type" : "assessmentSection",
              "required" : true,
              "sectionParts" : [  ],
              "title" : "Section+1",
              "visible" : true
            },
            { "identifier" : "assessmentSection-2",
              "index" : 1,"testFeedbacks" : [  ],
  "testParts" : [ { "assessmentSections" : [ { "branchRules" : [  ],
              "fixed" : false,
              "identifier" : "assessmentSection-1",
              "index" : 0,
              "keepTogether" : true,
              "preConditions" : [  ],
              "qti-type" : "assessmentSection",
              "required" : true,
              "sectionParts" : [  ],
              "title" : "Section+1",
              "visible" : true
            },
            { "identifier" : "assessmentSection-2",
              "index" : 1,
              "ordering" : { "qti-type" : "ordering",
                  "shuffle" : false
              "ordering" : { "qti-type" : "ordering",
                  "shuffle" : false
                },
              "qti-type" : "assessmentSection",
              "sectionParts" : [  ],
              "selection" : { "select" : 1,
                  "withReplacement" : false
                },
              "title" : "Section+2",
              "visible" : true
            }
          ],
        "branchRules" : [  ],
        "identifier" : "testPart-1",
        "itemSessionControl" : { "allowComment" : false,
            "allowReview" : true,
            "allowSkipping" : true,
            "maxAttempts" : 0,
            "qti-type" : "itemSessionControl",
            "showFeedback" : false,
            "showSolution" : false,
            "validateResponses" : false
          },
        "navigationMode" : 0,
        "preConditions" : [  ],
        "qti-type" : "testPart",
        "submissionMode" : 0,
        "testFeedbacks" : [  ]
      } ],
  "title" : "Test+4",
  "toolName" : "tao",
  "toolVersion" : "2.6-alpha"
}';
        
        return array(
            array($testPath, str_replace(array(' ', "\n", "\t"), '', $json))
        );
    }
    
    /**
     * Test {@link taoQtiTest_models_classes_QtiTestConverter::toJson}
     * @dataProvider dataProvider
     * @param string $testPath the path of the QTI test to convert
     * @param string $expected the expected json result 
     */
    public function testToJson($testPath, $expected){
        
        $doc = new XmlDocument('2.1');
        try {
            $doc->load($testPath);
        } catch (StorageException $e) {
            $this->fail($e->getMessage());
        }
        
        $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);
        $result = $converter->toJson();

        $this->assertEquals($expected, $result);
    }
    
    /**
     * Test {@link taoQtiTest_models_classes_QtiTestConverter::fromJson}
     * @dataProvider dataProvider
     * @param string $testPath 
     * @param string $json 
     */
   public function testFromJson($testPath, $json){
        
        $doc = new XmlDocument('2.1');
        $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);
        $converter->fromJson($json);
        $result = $doc->saveToString();
        $this->assertEquals($result, file_get_contents($testPath));
    }

}
