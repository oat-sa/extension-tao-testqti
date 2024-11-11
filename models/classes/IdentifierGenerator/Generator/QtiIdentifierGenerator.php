<?php

namespace oat\taoQtiTest\models\IdentifierGenerator\Generator;

use core_kernel_classes_Resource;
use InvalidArgumentException;
use oat\generis\model\data\Ontology;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use qtism\common\utils\Format;

class QtiIdentifierGenerator implements IdentifierGeneratorInterface
{
    private Ontology $ontology;

    public function __construct(Ontology $ontology)
    {
        $this->ontology = $ontology;
    }

    public function generate(array $options = []): string
    {
        $resource = $this->getResource($options);
        $label = $resource->getLabel();

        $identifier = null;

        if (preg_match('/^\d/', $label)) {
            $identifier = 't_' . $label;
        }

        return str_replace('_', '-', Format::sanitizeIdentifier($identifier));
    }

    private function getResource(array $options): core_kernel_classes_Resource
    {
        if (isset($options[self::OPTION_RESOURCE_ID]) && is_string($options[self::OPTION_RESOURCE_ID])) {
            return $this->ontology->getResource($options[self::OPTION_RESOURCE_ID]);
        }

        if (
            isset($options[self::OPTION_RESOURCE])
            && $options[self::OPTION_RESOURCE] instanceof core_kernel_classes_Resource
        ) {
            return $options[self::OPTION_RESOURCE];
        }

        throw new InvalidArgumentException(
            'Test QTI Identifier generation failure: resource is required'
        );
    }
}
