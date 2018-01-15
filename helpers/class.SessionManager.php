<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2013-2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\taoResultServer\models\classes\ResultStorageWrapper;
use qtism\runtime\tests\AbstractSessionManager;
use qtism\runtime\tests\TestResultsSubmission;
use qtism\runtime\tests\Route;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\data\AssessmentTest;
use qtism\data\IAssessmentItem;
use qtism\common\datatypes\QtiDuration;

/**
 * A TAO specific implementation of QTISM's AbstractSessionManager.
 * 
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 *
 */
class taoQtiTest_helpers_SessionManager extends AbstractSessionManager {

    /**
     * The class name of the default TestSession
     */
    const DEFAULT_TEST_SESSION = '\\taoQtiTest_helpers_TestSession';

    /**
     * The result server to be used by tao_helpers_TestSession created by the factory.
     *
     * @var ResultStorageWrapper
     */
    private $resultServer;
    
    /**
     * The TAO Resource describing the Test definition to be set to the AssessmentTestSession to be built.
     * 
     * @var core_kernel_classes_Resource
     */
    private $test;

    /**
     * Create a new SessionManager object.
     *
     * @param ResultStorageWrapper $resultServer The ResultServer to be set to the AssessmentTestSession to be built.
     * @param core_kernel_classes_Resource $test The TAO Resource describing the Test definition to be set to the AssessmentTestSession to be built.
     * @throws \InvalidArgumentException
     * @throws common_Exception
     */
    public function __construct(ResultStorageWrapper $resultServer, core_kernel_classes_Resource $test)
    {
        parent::__construct();
        $this->setAcceptableLatency(new QtiDuration(taoQtiTest_models_classes_QtiTestService::singleton()->getQtiTestAcceptableLatency()));
        $this->setResultServer($resultServer);
        $this->setTest($test);
    }

    /**
     * Set the result server to be used by tao_helpers_TestSession created by the factory.
     *
     * @param ResultStorageWrapper $resultServer
     */
    public function setResultServer(ResultStorageWrapper $resultServer)
    {
        $this->resultServer = $resultServer;
    }

    /**
     * Get the result server to be used by tao_helpers_TestSession created by the factory.
     *
     * @return ResultStorageWrapper
     */
    public function getResultServer()
    {
        return $this->resultServer;
    }
    
    /**
     * Set the TAO Resource describing the Test definition to be set to the AssessmentTestSession to be built.
     * 
     * @param core_kernel_classes_Resource $test A TAO Test Resource.
     */
    public function setTest(core_kernel_classes_Resource $test) {
        $this->test = $test;
    }
    
    /**
     * Get the TAO Resource describing the Test definition to be set to the AssessmentTestSession to be built.
     * 
     * @return core_kernel_classes_Resource A TAO Resource.
     */
    public function getTest() {
        return $this->test;
    }

    /**
     * Instantiates an AssessmentTestSession with the default implementation provided by QTISM.
     * @param AssessmentTest $test
     * @param Route $route
     * @return AssessmentTestSession
     * @throws common_ext_ExtensionException
     */
    protected function instantiateAssessmentTestSession(AssessmentTest $test, Route $route) {
        $config = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
        
        // Test Session class instantiation, depending on configuration.
        if (!isset($config) || !isset($config['test-session'])) {
            $className = self::DEFAULT_TEST_SESSION;
            \common_Logger::w("Missing configuration for TestRunner session class, using '${className}' by default!");
        } else {
            $className = $config['test-session'];
        }
        
        $assessmentTestSession = new $className($test, $this, $route, $this->getResultServer(), $this->getTest());
        
        $forceBranchrules = (isset($config['force-branchrules'])) ? $config['force-branchrules'] : false;
        $forcePreconditions = (isset($config['force-preconditions'])) ? $config['force-preconditions'] : false;
        $pathTracking = (isset($config['path-tracking'])) ? $config['path-tracking'] : false;
        $alwaysAllowJumps = (isset($config['always-allow-jumps'])) ? $config['always-allow-jumps'] : false;
        
        $assessmentTestSession->setForceBranching($forceBranchrules);
        $assessmentTestSession->setForcePreconditions($forcePreconditions);
        $assessmentTestSession->setAlwaysAllowJumps($alwaysAllowJumps);
        $assessmentTestSession->setPathTracking($pathTracking);
        
        return $assessmentTestSession;
    }
    
    /**
     * Extra configuration for newly instantiated AssessmentTestSession objects. This implementation
     * forces test results to be sent at the end of the candidate session, and get the acceptable
     * latency time from the taoQtiTest extension's configuration.
     * 
     * @param AssessmentTestSession $assessmentTestSession
     */
    protected function configureAssessmentTestSession(AssessmentTestSession $assessmentTestSession) {
        $assessmentTestSession->setTestResultsSubmission(TestResultsSubmission::END);
    }

    /**
     * Instantiates an AssessmentItemSession with the default implementation provided by QTISM.
     *
     * @param IAssessmentItem $assessmentItem
     * @param integer $navigationMode A value from the NavigationMode enumeration.
     * @param integer $submissionMode A value from the SubmissionMode enumeration.
     * @return AssessmentItemSession A freshly instantiated AssessmentItemSession.
     * @throws \InvalidArgumentException
     */
    protected function instantiateAssessmentItemSession(IAssessmentItem $assessmentItem, $navigationMode, $submissionMode) {
        return new AssessmentItemSession($assessmentItem, $this, $navigationMode, $submissionMode);
    }

}
