<?php

namespace oat\taoQtiTest\models\IdentifierGenerator\ServiceProvider;

use oat\generis\model\data\Ontology;
use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorProxy;
use oat\tao\model\TaoOntology;
use oat\taoQtiTest\models\IdentifierGenerator\Generator\QtiIdentifierGenerator;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class IdentifierGeneratorServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(QtiIdentifierGenerator::class, QtiIdentifierGenerator::class)
            ->args([
                service(Ontology::SERVICE_ID),
            ]);

        $services
            ->get(IdentifierGeneratorProxy::class)
            ->call(
                'addIdentifierGenerator',
                [
                    service(QtiIdentifierGenerator::class),
                    TaoOntology::CLASS_URI_TEST,
                ]
            );
    }
}
