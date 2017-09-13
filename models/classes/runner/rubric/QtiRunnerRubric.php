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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\rubric;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use OutOfBoundsException;
use qtism\data\AssessmentItemRef;
use qtism\data\View;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\RouteItem;
use taoQtiTest_models_classes_QtiTestService;

/**
 * Class QtiRunnerRubric
 * @package oat\taoQtiTest\models\runner\rubric
 */
class QtiRunnerRubric extends ConfigurableService implements RunnerRubric
{
    const SERVICE_ID = 'taoQtiTest/QtiRunnerRubric';

    /**
     * Gets the rubrics according to the current session state
     * The content is directly rendered into the page
     * @param RunnerServiceContext $context
     * @param AssessmentItemRef $itemRef (optional) otherwise use the current
     * @return mixed
     */
    public function getRubrics(RunnerServiceContext $context, AssessmentItemRef $itemRef = null)
    {
        /* @var AssessmentTestSession $session */
        $session = $context->getTestSession();

        $routeItem = null;
        if (!is_null($itemRef)) {
            try {
                $routeItem = $session->getRoute()->getRouteItemsByAssessmentItemRef($itemRef);
                if ($routeItem) {
                    $routeItem = $routeItem[0];
                }
            } catch (OutOfBoundsException $obe) {
                \common_Logger::d("Could not retrieve the route for item '${itemRef}'.");
            }
        } else {
            $routeItem = $session->getRoute()->current();
        }

        return implode('', $this->getRubricBlock($routeItem, $session, $context->getCompilationDirectory()));
    }


    /**
     * @param RouteItem $routeItem
     * @param AssessmentTestSession $session
     * @param array $compilationDirs
     * @return array
     */
    public function getRubricBlock($routeItem, $session, $compilationDirs)
    {
        // TODO: make a better implementation for rubrics loading.

        $rubrics = [];

        if ($routeItem) {

            $rubricRefs = $routeItem->getRubricBlockRefs();

            if (count($rubricRefs) > 0) {

                // -- variables used in the included rubric block templates.
                // base path (base URI to be used for resource inclusion).
                $basePathVarName = taoQtiTest_models_classes_QtiTestService::TEST_BASE_PATH_NAME;
                $$basePathVarName = $compilationDirs['public']->getPublicAccessUrl();

                // state name (the variable to access to get the state of the assessmentTestSession).
                $stateName = taoQtiTest_models_classes_QtiTestService::TEST_RENDERING_STATE_NAME;
                $$stateName = $session;

                // views name (the variable to be accessed for the visibility of rubric blocks).
                $viewsName = taoQtiTest_models_classes_QtiTestService::TEST_VIEWS_NAME;
                $$viewsName = array(View::CANDIDATE);

                $tmpDir = \tao_helpers_File::createTempDir();
                ob_start();
                foreach ($rubricRefs as $rubric) {
                    $data = $compilationDirs['private']->read($rubric->getHref());
                    $tmpFile = $tmpDir . basename($rubric->getHref());
                    file_put_contents($tmpFile, $data);
                    include($tmpFile);
                    unlink($tmpFile);
                }
                $rubrics[] = ob_get_contents();
                ob_end_clean();
                rmdir($tmpDir);
            }
        }

        return $rubrics;
    }
}
