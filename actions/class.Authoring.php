<?php
/*  
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
 * Copyright (c) 2007-2010 (original work) Public Research Centre Henri Tudor & University of Luxembourg) (under the project TAO-QUAL);
 *               2008-2010 (update and modification) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 * 
 */

/**
 * Author an QTI test
 *
 * @author Joel Bout, <joel@taotesting.com>
 * @package taoQtiTest
 * @subpackage actions
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class taoQtiTest_actions_Authoring extends tao_actions_CommonModule {

    /**
     * Display a very basic authoring interface
     */
	public function index()
	{
	    $test = $this->getCurrentTest();
    	$genericTestService = taoTests_models_classes_TestsService::singleton();
    	$qtiTestService = taoQtiTest_models_classes_QtiTestService::singleton();

    	$itemSequence = array();
		$itemUris = array();
		$i = 1;
		foreach($qtiTestService->getItems($test) as $item){
			$itemUris[] = $item->getUri();
			$itemSequence[$i] = array(
				'uri' 	=> tao_helpers_Uri::encode($item->getUri()),
				'label' => $item->getLabel()
			);
			$i++;
		}

		// data for item sequence, terrible solution
		// @todo implement an ajax request for labels or pass from tree to sequence
		$allItems = array();
		foreach($genericTestService->getAllItems() as $itemUri => $itemLabel){
			$allItems['item_'.tao_helpers_Uri::encode($itemUri)] = $itemLabel;
		}
		
		$this->setData('uri', $test->getUri());
    	$this->setData('allItems', json_encode($allItems));
		$this->setData('itemSequence', $itemSequence);
		
		// data for generis tree form
		$this->setData('relatedItems', json_encode(tao_helpers_Uri::encodeArray($itemUris)));
		$openNodes = tao_models_classes_GenerisTreeFactory::getNodesToOpen($itemUris, new core_kernel_classes_Class(TAO_ITEM_CLASS));
		$this->setData('itemRootNode', TAO_ITEM_CLASS);
		$this->setData('itemOpenNodes', $openNodes);
		$this->setData('saveUrl', _url('saveItems'));
                $this->setData('qtiItemModel', tao_helpers_Uri::encode(TAO_ITEM_MODEL_QTI));
		$this->setView('authoring.tpl');
	}
	
	/**
	 * Create a QTI test with the specified items
	 */
	public function saveItems()
	{
	    $test = $this->getCurrentTest();
	    $items = array();
	    foreach ($this->getRequestParameters() as $key => $value) {
	        if (substr($key, 0, strlen('instance')) == 'instance') {
	            $items[] = new core_kernel_classes_Resource(tao_helpers_Uri::decode($value));
	        }
	    }
	    
	    $qtiTestService = taoQtiTest_models_classes_QtiTestService::singleton();
	    $success = $qtiTestService->setItems($test, $items);
	    
	    echo json_encode(array('saved'	=> $success));
	}
	
	/**
	 * Returns the test that is being authored
	 * 
	 * @throws tao_models_classes_MissingRequestParameterException
	 * @return core_kernel_classes_Resource
	 */
	protected function getCurrentTest()
	{
	    if (!$this->hasRequestParameter('uri')) {
	        throw new tao_models_classes_MissingRequestParameterException('uri');
	    }
	    return new core_kernel_classes_Resource($this->getRequestParameter('uri'));
	}
	
}
