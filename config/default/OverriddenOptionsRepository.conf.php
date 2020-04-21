<?php
/**
 * Default config header created during install
 */

use oat\oatbox\service\ServiceFactoryInterface;
use oat\oatbox\session\SessionService;
use oat\taoQtiTest\models\runner\toolsStates\DataAccess\Mapper\OptionCollectionMapper;
use oat\taoQtiTest\models\runner\toolsStates\DataAccess\Repository\OverriddenLtiToolsRepository;
use oat\taoQtiTest\models\TestCategoryPresetProvider;
use Zend\ServiceManager\ServiceLocatorInterface;

return new class implements ServiceFactoryInterface {
    public function __invoke(ServiceLocatorInterface $serviceLocator)
    {
        return new OverriddenLtiToolsRepository(
            $serviceLocator->get(TestCategoryPresetProvider::SERVICE_ID),
            $serviceLocator->get(SessionService::SERVICE_ID),
            $serviceLocator->get(OptionCollectionMapper::SERVICE_ID)
        );
    }
};
