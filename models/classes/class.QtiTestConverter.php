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
* Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
*/

use qtism\common\datatypes\QtiPair;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\QtiComponent;
use qtism\data\QtiComponentCollection;
use qtism\common\datatypes\QtiDuration;
use oat\taoQtiTest\helpers\QtiTestSanitizer;
use qtism\common\collections\IntegerCollection;
use qtism\common\collections\StringCollection;
use qtism\data\ViewCollection;
use qtism\data\View;

/**
 * This class helps you to convert a QTITest from the qtism library.
 * It supports only JSON conversion, but uses assoc arrays as transitional format.
 *
 * This converter will be replaced by a JSON Marshaller from inside the qtism lib.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 *
 * @access public
 * @package taoQtiTest
 *
 */
class taoQtiTest_models_classes_QtiTestConverter
{
    /**
     * operators for which qtsm classes are postfix
     *
     * @var array $operatorClassesOperatorPostfix
     */
    public static $operatorClassesPostfix = [
        'and',
        'custom',
        'math',
        'or',
        'match',
        'stats'
    ];

    /**
     * The instance of the XmlDocument that represents the QTI Test.
     *
     * This is the pivotal class.
     *
     * @var XmlDocument
     */
    private $doc;

    /** @var QtiTestSanitizer */
    private $qtiTestSanitizer;

    /**
     * Instantiate the converter using a QTITest document.
     */
    public function __construct(XmlDocument $doc, QtiTestSanitizer $qtiTestSanitizer = null)
    {
        $this->doc = $doc;
        $this->qtiTestSanitizer = $qtiTestSanitizer ?? new QtiTestSanitizer();
    }

    /**
     * Converts the test from the document to JSON.
     *
     * @return string json
     */
    public function toJson()
    {
        return json_encode($this->toArray());
    }

    /**
     * Converts the test from the document to an array
     * @return array the test data as array
     * @throws taoQtiTest_models_classes_QtiTestConverterException
     */
    public function toArray()
    {
        try {
            return $this->componentToArray($this->doc->getDocumentComponent());
        } catch (ReflectionException $re) {
            common_Logger::e($re->getMessage());
            common_Logger::d($re->getTraceAsString());
            throw new taoQtiTest_models_classes_QtiTestConverterException(
                'Unable to convert the QTI Test to json: ' . $re->getMessage()
            );
        }
    }

    /**
     * Populate the document using the JSON parameter.
     *
     * @param string $json a valid json object (one that comes from the toJson method).
     *
     * @throws taoQtiTest_models_classes_QtiTestConverterException
     */
    public function fromJson($json)
    {
        try {
            $data = json_decode($json, true);
            if (is_array($data)) {
                $this->arrayToComponent($data);
            }
        } catch (ReflectionException $re) {
            common_Logger::e($re->getMessage());
            common_Logger::d($re->getTraceAsString());
            throw new taoQtiTest_models_classes_QtiTestConverterException(
                'Unable to create the QTI Test from json: ' . $re->getMessage()
            );
        }
    }

    /**
     * Converts a QTIComponent to an assoc array (instances variables to key/val), using reflection.
     *
     * @param \qtism\data\QtiComponent $component
     * @return array
     */
    private function componentToArray(QtiComponent $component)
    {
        $array = [
            'qti-type' => $component->getQtiClassName()
        ];

        $reflector = new ReflectionClass($component);

        foreach ($this->getProperties($reflector) as $property) {
            $value = $this->getValue($component, $property);
            if ($value !== null) {
                $key = $property->getName();
                if ($value instanceof QtiPair) {
                    $array[$property->getName()] = (string) $value;
                } elseif ($value instanceof QtiComponentCollection) {
                    $array[$key] = [];
                    foreach ($value as $item) {
                        $array[$key][] = $this->componentToArray($item);
                    }
                } elseif ($value instanceof ViewCollection) {
                    $array[$property->getName()] = [];
                    foreach ($value as $item) {
                        $array[$property->getName()][] = View::getNameByConstant($item);
                    }
                } elseif ($value instanceof QtiComponent) {
                    $array[$property->getName()] = $this->componentToArray($value);
                } elseif ($value instanceof QtiDuration) {
                    $array[$property->getName()] = taoQtiTest_helpers_TestRunnerUtils::getDurationWithMicroseconds(
                        $value
                    );
                } elseif ($value instanceof IntegerCollection || $value instanceof StringCollection) {
                    $array[$property->getName()] = [];
                    foreach ($value as $item) {
                        $array[$property->getName()][] = $item;
                    }
                } else {
                    $array[$property->getName()] = $value;
                }
            }
        }

        return $array;
    }

    /**
     * Get the class properties.
     *
     * @param ReflectionClass $reflector
     * @param array $childrenProperties for recursive usage only
     * @return ReflectionProperty[] the list of properties
     */
    private function getProperties(ReflectionClass $reflector, array $childrenProperties = [])
    {
        $properties = array_merge($childrenProperties, $reflector->getProperties());
        if ($reflector->getParentClass()) {
            $properties = $this->getProperties($reflector->getParentClass(), $properties);
        }
        return $properties;
    }

    /**
     * Call the getter from a reflection property, to get the value
     *
     * @param \qtism\data\QtiComponent $component
     * @param ReflectionProperty $property
     * @return mixed value produced by the getter
     */
    private function getValue(QtiComponent $component, ReflectionProperty $property)
    {
        $value = null;
        $getterProps = [
            'get',
            'is',
            'does',
            'must'
        ];
        foreach ($getterProps as $getterProp) {
            $getterName = $getterProp . ucfirst($property->getName());
            try {
                $method = new ReflectionMethod($component, $getterName);
                if ($method->isPublic()) {
                    $value = $component->{$getterName}();
                }
            } catch (ReflectionException $re) { // this must be ignored
                continue;
            }
            return $value;
        }
    }

    /**
     * Call the setter to assign a value to a component using a reflection property
     *
     * @param \qtism\data\QtiComponent $component
     * @param ReflectionProperty $property
     * @param mixed $value
     */
    private function setValue(QtiComponent $component, ReflectionProperty $property, $value)
    {
        $setterName = 'set' . ucfirst($property->getName());
        try {
            $method = new ReflectionMethod($component, $setterName);
            if ($method->isPublic()) {
                $component->{$setterName}($value);
            }
        } catch (ReflectionException $re) {
        } // this must be ignored
    }

    /**
     * If a class is explicitly defined for a property, we get it (from the setter's parameter...).
     *
     * @param \qtism\data\QtiComponent $component
     * @param ReflectionProperty $property
     * @return null|ReflectionClass
     */
    public function getPropertyClass(QtiComponent $component, ReflectionProperty $property)
    {
        $setterName = 'set' . ucfirst($property->getName());
        try {
            $method = new ReflectionMethod($component, $setterName);
            $parameters = $method->getParameters();

            if (count($parameters) === 1) {
                $param = $parameters[0];
                return $param->getClass();
            }
        } catch (ReflectionException $re) {
        }

        return null;
    }

    /**
     * Converts an assoc array to a QtiComponent using reflection
     *
     * @param array $testArray the assoc array
     * @param \qtism\data\QtiComponent|null $parent for recursive usage only
     * @param boolean $attach if we want to attach the component to it's parent or return it
     * @return QtiComponent|void
     */
    private function arrayToComponent(array $testArray, QtiComponent $parent = null, $attach = true)
    {
        if (isset($testArray['qti-type']) && ! empty($testArray['qti-type'])) {
            $compName = $this->lookupClass($testArray['qti-type']);

            if (! empty($compName)) {
                $reflector = new ReflectionClass($compName);
                $component = $this->createInstance($reflector, $testArray);

                $properties = [];
                foreach ($this->getProperties($reflector) as $property) {
                    $properties[$property->getName()] = $property;
                }

                foreach ($testArray as $key => $value) {
                    if (array_key_exists($key, $properties)) {
                        $class = $this->getPropertyClass($component, $properties[$key]);

                        if (is_array($value) && array_key_exists('qti-type', $value)) {
                            $this->arrayToComponent($value, $component, true);
                        } else {
                            $assignableValue = $this->componentValue($value, $class);

                            if ($assignableValue !== null) {
                                if (is_string($assignableValue) && $key === 'content') {
                                    $assignableValue = $this->qtiTestSanitizer->sanitizeContent($assignableValue);
                                }

                                $this->setValue($component, $properties[$key], $assignableValue);
                            }
                        }
                    }
                }

                if ($attach) {
                    if (is_null($parent)) {
                        $this->doc->setDocumentComponent($component);
                    } else {
                        $parentReflector = new ReflectionClass($parent);
                        foreach ($this->getProperties($parentReflector) as $property) {
                            if ($property->getName() === $testArray['qti-type']) {
                                $this->setValue($parent, $property, $component);
                                break;
                            }
                        }
                    }
                }
                return $component;
            }
        }
    }

    /**
     * Get the value according to it's type and class.
     *
     * @param mixed $value
     * @param object|null $class
     * @return QtiDuration|QtiComponentCollection|mixed|null
     */
    private function componentValue($value, $class)
    {
        if ($class === null) {
            return $value;
        }

        if (is_array($value)) {
            return $this->createComponentCollection(new ReflectionClass($class->name), $value);
        }
        if ($class->name === QtiDuration::class) {
            return new QtiDuration('PT' . $value . 'S');
        }

        return $value;
    }

    /**
     * Instantiate and fill a QtiComponentCollection
     *
     * @param ReflectionClass $class
     * @param array $values
     * @return \qtism\data\QtiComponentCollection|null
     */
    private function createComponentCollection(ReflectionClass $class, $values)
    {
        $collection = $class->newInstance();
        if ($collection instanceof ViewCollection) {
            foreach ($values as $value) {
                $collection[] = View::getConstantByName($value);
            }
            return $collection;
        }
        if ($collection instanceof QtiComponentCollection) {
            foreach ($values as $value) {
                $collection->attach($this->arrayToComponent($value, null, false));
            }
            return $collection;
        }
        if ($collection instanceof IntegerCollection || $collection instanceof StringCollection) {
            foreach ($values as $value) {
                if (!empty($value)) {
                    $collection[] = $value;
                }
            }
            return $collection;
        }

        return null;
    }

    /**
     * Call the constructor with the required parameters of a QtiComponent.
     *
     * @param ReflectionClass $class
     * @param array|string $properties
     * @return QtiComponent
     */
    private function createInstance(ReflectionClass $class, $properties)
    {
        $arguments = [];
        if (is_string($properties) && $class->implementsInterface('qtism\common\enums\Enumeration')) {
            $enum = $class->newInstance();
            return $enum->getConstantByName($properties);
        }
        $constructor = $class->getConstructor();
        if (is_null($constructor)) {
            return $class->newInstance();
        }
        $docComment = $constructor->getDocComment();
        foreach ($class->getConstructor()->getParameters() as $parameter) {
            if (! $parameter->isOptional()) {
                $name = $parameter->getName();
                $paramClass = $parameter->getClass();
                if ($paramClass !== null) {
                    if (is_array($properties[$name])) {
                        $component = $this->arrayToComponent($properties[$name]);
                        if (! $component) {
                            $component = $this->createComponentCollection(
                                new ReflectionClass($paramClass->name),
                                $properties[$name]
                            );
                        }

                        $arguments[] = $component;
                    }
                } elseif (array_key_exists($name, $properties)) {
                    $arguments[] = $properties[$name];
                } else {
                    $hint = $this->getHint($docComment, $name);
                    switch ($hint) {
                        case 'int':
                            $arguments[] = 0;
                            break;
                        case 'integer':
                            $arguments[] = 0;
                            break;
                        case 'boolean':
                            $arguments[] = false;
                            break;
                        case 'string':
                            $arguments[] = '';
                            break;
                        case 'array':
                            $arguments[] = [];
                            break;
                        default:
                            $arguments[] = null;
                            break;
                    }
                }
            }
        }

        return $class->newInstanceArgs($arguments);
    }

    /**
     * Get the type of parameter from the jsdoc (yes, I know...
     * but this is temporary ok!)
     *
     * @param string $docComment
     * @param string $varName
     * @return null|array
     */
    private function getHint($docComment, $varName)
    {
        $matches = [];
        $count = preg_match_all(
            '/@param[\t\s]*(?P<type>[^\t\s]*)[\t\s]*\$(?P<name>[^\t\s]*)/sim',
            $docComment,
            $matches
        );
        if ($count > 0) {
            foreach ($matches['name'] as $n => $name) {
                if ($name === $varName) {
                    return $matches['type'][$n];
                }
            }
        }
        return null;
    }

    /**
     * get the namespaced class name
     *
     * @param string $name the short class name
     * @return string the long class name
     */
    private function lookupClass($name)
    {
        $namespaces = [
            'qtism\\common\\datatypes\\',
            'qtism\\data\\',
            'qtism\\data\\content\\',
            'qtism\\data\\content\\xhtml\\',
            'qtism\\data\\content\\xhtml\\lists\\',
            'qtism\\data\\content\\xhtml\\presentation\\',
            'qtism\\data\\content\\xhtml\\tables\\',
            'qtism\\data\\content\\xhtml\\text\\',
            'qtism\\data\\content\\interactions\\',
            'qtism\\data\\expressions\\',
            'qtism\\data\\expressions\\operators\\',
            'qtism\\data\\processing\\',
            'qtism\\data\\rules\\',
            'qtism\\data\\state\\'
        ];

        if (in_array(mb_strtolower($name), self::$operatorClassesPostfix)) {
            $name .= 'Operator';
        }

        foreach ($namespaces as $namespace) { // this could be cached
            $className = $namespace . ucfirst($name);
            if (class_exists($className, true)) {
                return $className;
            }
        }
    }
}
