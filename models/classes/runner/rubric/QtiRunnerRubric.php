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

use oat\taoQtiTest\models\runner\RunnerServiceContext;
use qtism\data\View;
use \OutOfBoundsException;

/**
 * Class QtiRunnerRubric
 * @package oat\taoQtiTest\models\runner\rubric
 */
class QtiRunnerRubric implements RunnerRubric
{
    /**
     * Gets the rubrics according to the current session state
     * The content is directly rendered into the page
     * @param RunnerServiceContext $context
     * @param string $itemRef (optional) otherwise use the current 
     * @return mixed
     */
    public function getRubrics(RunnerServiceContext $context, $itemRef = null)
    {
        // TODO: make a better implementation for rubrics loading.

        $rubrics = '';

        /* @var AssessmentTestSession $session */
        $session = $context->getTestSession();

        if(!is_null($itemRef)){
            try {
                $routeItem = $session->getRoute()->getRouteItemsByAssessmentItemRef($itemRef);
                if ($routeItem) {
                    $routeItem = $routeItem[0];
                }
            } catch(OutOfBoundsException $obe){
                \common_Logger::d("Could not retrieve the route for item '${itemRef}'.");
            }
        } else {
            $routeItem = $session->getRoute()->current();
        }

        if($routeItem){

            $rubricRefs = $routeItem->getRubricBlockRefs();

            if(count($rubricRefs) > 0 ){

                $compilationDirs = $context->getCompilationDirectory();

                // -- variables used in the included rubric block templates.
                // base path (base URI to be used for resource inclusion).
                $basePathVarName = TAOQTITEST_BASE_PATH_NAME;
                $$basePathVarName = $compilationDirs['public']->getPublicAccessUrl();

                // state name (the variable to access to get the state of the assessmentTestSession).
                $stateName = TAOQTITEST_RENDERING_STATE_NAME;
                $$stateName = $session;

                // views name (the variable to be accessed for the visibility of rubric blocks).
                $viewsName = TAOQTITEST_VIEWS_NAME;
                $$viewsName = array(View::CANDIDATE);

                ob_start();
                foreach ($routeItem->getRubricBlockRefs() as $rubric) {
                    $data = $compilationDirs['private']->read($rubric->getHref());
                    $tmpFile = \tao_helpers_File::createTempDir().basename($rubric->getHref());
                    file_put_contents($tmpFile, $data);
                    include($tmpFile);
                    unlink($tmpFile);
                }
                $rubrics = ob_get_contents();
                ob_end_clean();
            }
        }
        return $rubrics;
    }

}
