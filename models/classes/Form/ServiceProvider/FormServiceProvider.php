<?php

namespace oat\taoQtiTest\models\Form\ServiceProvider;

use oat\generis\model\data\Ontology;
use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\tao\model\form\Modifier\FormModifierManager;
use oat\taoQtiTest\models\Form\Modifier\EditTranslationInstanceFormModifier;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use taoQtiTest_models_classes_QtiTestService;
use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class FormServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(EditTranslationInstanceFormModifier::class, EditTranslationInstanceFormModifier::class)
            ->args([
                service(Ontology::SERVICE_ID),
                service(taoQtiTest_models_classes_QtiTestService::class),
            ]);

        $formModifierManager = $services->get(FormModifierManager::class);
        $formModifierManager
            ->call(
                'add',
                [
                    service(EditTranslationInstanceFormModifier::class),
                    EditTranslationInstanceFormModifier::ID,
                ]
            );
    }
}