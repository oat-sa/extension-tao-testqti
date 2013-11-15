<?php

use qtism\data\storage\xml\XmlDocument;
use qtism\data\QtiComponent;
use qtism\data\QtiComponentCollection;
use qtism\common\datatypes\Duration;
use qtism\common\collections\IntegerCollection;

/**
 * This class helps you to convert a QTITest from the qtism library.
 * It supports only JSON convertion, but uses assoc arrays as transitional format.
 * 
 * This converter will be replaced by a JSON Marshaller from inside the qtism lib.
 * 
 * @access public
 * @package taoQtiTest
 * @subpackage models_classes
 */
class taoQtiTest_models_classes_QtiTestConverter {
    
    /**
     * The instance of the XmlDocument that represents the QTI Test. 
     * This is the pivotal class.
     * @var XmlDocument  
     */
    private $doc;
    
    /**
     * Instantiate the converter using a QTITest document.
     * @param \qtism\data\storage\xml\XmlDocument $doc
     */
    public function __construct(XmlDocument $doc) {
        $this->doc = $doc;
    }
    
    /**
     * Converts the test from the document to JSON.
     * @return a json string
     */
    public function toJson(){
        try{
            return json_encode($this->componentToArray($this->doc->getDocumentComponent()));
        } catch(ReflectionException  $re){
            common_Logger::e($re->getMessage());
            throw new taoQtiTest_models_classes_QtiTestConverterException('Unable to covert QTI Test to json: ' . $re->getMessage() );
        }
    }
    
    /**
     * Popoulate the document using the JSON parameter.
     * @param string $json a valid json object (one that comes from the toJson method).
     */
    public function fromJson($json){
        try{
            $this->arrayToComponent(json_decode($json, true));
        } catch(ReflectionException  $re){
            common_Logger::e($re->getMessage());
            throw new taoQtiTest_models_classes_QtiTestConverterException('Unable to create QTI Test from json: ' . $re->getMessage() );
        }
    }
    
    /**
     * Converts a QTIComponent to an assoc array (instances variables to key/val), using reflection.
     * @param \qtism\data\QtiComponent $component
     * @return array
     */
    private function componentToArray(QtiComponent $component){
        $array = array(
            'qti-type' => $component->getQtiClassName()
        );
        
        $reflector = new ReflectionClass($component);
        
        foreach($this->getProperties($reflector) as $property){
            $value = $this->getValue($component, $property);
            if($value !== null){
                $key = $property->getName();
                if($value instanceof QtiComponentCollection){
                    $array[$key] = array();
                    foreach($value as $item){
                        $array[$key][] = $this->componentToArray($item);
                    }
                } else if($value instanceof QtiComponent){
                    $array[$property->getName()] = $this->componentToArray($value);
                } else if($value instanceof Duration){
                    $array[$property->getName()] = $value->getSeconds(true);
                } else if ($value instanceof IntegerCollection){
                    $array[$property->getName()] = array();
                    foreach($value as $item){
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
     * @param ReflectionClass $reflector
     * @param array $childrenProperties for recursive usage only
     * @return the list of properties
     */
    private function getProperties(ReflectionClass $reflector, array $childrenProperties = array()){
        $properties = array_merge($childrenProperties, $reflector->getProperties());
        if($reflector->getParentClass() != null){
            $properties = $this->getProperties($reflector->getParentClass(), $properties);
        }
        return $properties;
    }
    
    /**
     * Call the getter from a relfection property, to get the value
     * @param \qtism\data\QtiComponent $component
     * @param ReflectionProperty $property
     * @return the value produced by the getter
     */
    private function getValue(QtiComponent $component, ReflectionProperty $property){
         $value = null; 
         $getterProps = array('get', 'is', 'does', 'must');
         foreach($getterProps as $getterProp){
            $getterName = $getterProp . ucfirst($property->getName());
            try{
               $method = new ReflectionMethod($component, $getterName);
               if($method->isPublic()){
                  $value = $component->{$getterName}();
               }
            } catch(ReflectionException $re){   //this must be ignored
                continue;
            }
            return $value;
         }
    }
    
    /**
     * Call the setter to assign a value to a component using a relfection property
     * @param \qtism\data\QtiComponent $component
     * @param ReflectionProperty $property
     * @param type $value
     */
    private function setValue(QtiComponent $component, ReflectionProperty $property, $value){
         $setterName = 'set' . ucfirst($property->getName());
         try{
            
            $method = new ReflectionMethod($component, $setterName);
            if($method->isPublic()){
               $component->{$setterName}($value);
            }
         } catch(ReflectionException  $re){ }   //this must be ignored
    }
    
    /**
     * If a class is explicitly defined for a property, we get it (from the setter's parameter...).
     * @param \qtism\data\QtiComponent $component
     * @param ReflectionProperty $property
     * @return null or the ReflectionClass
     */
    public function getPropertyClass(QtiComponent $component, ReflectionProperty $property){
         $setterName = 'set' . ucfirst($property->getName());
         try{
            
            $method = new ReflectionMethod($component, $setterName);
            $parameters  = $method->getParameters();
            
            if(count($parameters) == 1){
                $param = $parameters[0];
                return $param->getClass();
            }
            
         } catch(ReflectionException  $re){ }
         
         return null;
    }
    
    /**
     * Converts an assoc array to a QtiComponent using reflection
     * @param array $testArray the assoc array
     * @param \qtism\data\QtiComponent $parent for recursive usage only
     * @param type $attach if we want to attach the component to it's parent or return it
     * @return see above
     */
    private function arrayToComponent(array $testArray, QtiComponent $parent = null, $attach = true){
        
        
        if(isset($testArray['qti-type']) && !empty($testArray['qti-type'])){
            
            $compName = $this->lookupClass($testArray['qti-type']);

            $reflector = new ReflectionClass($compName);
            $component = $this->createInstance($reflector, $testArray);

            $properties = array();
            foreach($this->getProperties($reflector) as $property){
                $properties[$property->getName()] = $property;
            }

            foreach($testArray as $key => $value){
                
                if(array_key_exists($key, $properties)){
                    
                     $class = $this->getPropertyClass($component, $properties[$key]);
                    
                    if(is_array($value) && array_key_exists('qti-type', $value)){
                        
                        $this->arrayToComponent($value, $component, true);

                    } else {
                        $assignableValue = $this->componentValue($value, $class);
                        if(!is_null($assignableValue)){
                            $this->setValue($component, $properties[$key], $assignableValue);
                        }
                    }
                }
            }

            if($attach){
                if(is_null($parent)){
                    $this->doc->setDocumentComponent($component);
                } else {
                    $parentReflector = new ReflectionClass($parent);
                    foreach($this->getProperties($parentReflector) as $property){
                        if($property->getName() == $testArray['qti-type']){
                            $this->setValue($parent, $property, $component);
                            break;
                        }
                    }
                }
            } 
            return $component;
        }
    }
    
    /**
     * Get the value according to it's type and class.
     * @param type $value
     * @param type $class
     * @return \qtism\common\datatypes\Duration
     */
    private function componentValue($value, $class){
         if(!is_null($class)){
              if(is_array($value)){
                  return $this->createComponentCollection(new ReflectionClass($class->name), $value);
              } else if($class->name == 'qtism\common\datatypes\Duration'){
                  return new qtism\common\datatypes\Duration('PT'.$value.'S');
              }
         } 
         return $value; 
    }
    
    /**
     * Instantiate and fill a QtiComponentCollection
     * @param ReflectionClass $class
     * @param type $values
     * @return \qtism\data\QtiComponentCollection|null
     */
    private function createComponentCollection(ReflectionClass $class, $values){
        $collection = $class->newInstanceWithoutConstructor();
        if($collection instanceof QtiComponentCollection){
            foreach($values as $value){
                $collection->attach($this->arrayToComponent($value, null, false));
            }
            return $collection;
        }
        if($collection instanceof IntegerCollection){
            foreach($values as $value){
                $collection[] = $value;
            }
            return $collection;
        }
        return null;
    }
    
    /**
     * Call the constructor with the required parameters of a QtiComponent.
     * @param ReflectionClass $class
     * @param type $properties
     * @return the QtiComponent's instance
     */
    private function createInstance(ReflectionClass $class, $properties){
        $arguments = array();
        $constructor = $class->getConstructor();
        if(is_null($constructor)){
            return $class->newInstance();
        }
        $docComment = $constructor->getDocComment();
        foreach($class->getConstructor()->getParameters() as $parameter){
            if(!$parameter->isOptional()){
                $name = $parameter->getName();
                $paramClass = $parameter->getClass();
                if(!is_null($paramClass)){
                    
                    $collection = $this->createComponentCollection(new ReflectionClass($paramClass->name), $properties[$name]);
                    $arguments[] = $collection;
                } else if(array_key_exists($name, $properties)){
                    $arguments[] = $properties[$name];
                } else {
                   $hint = $this->getHint($docComment, $name);
                    switch($hint){
                        case 'integer' : $arguments[] = 0; break;
                        case 'boolean' : $arguments[] = false; break;
                        case 'string' : $arguments[] = ''; break;
                        case 'array' : $arguments[] = array(); break;
                        default : $arguments[] = null; break;
                    }
                }
            }
        }
        
        return $class->newInstanceArgs($arguments);
    }
    
    /**
     * Get the type of parameter from the jsdoc (yes, I know... but this is temporary ok!)
     * @param type $docComment
     * @param type $varName
     * @return null|array
     */
    private function getHint( $docComment, $varName ) {
        $matches = array();
        $count = preg_match_all('/@param[\t\s]*(?P<type>[^\t\s]*)[\t\s]*\$(?P<name>[^\t\s]*)/sim', $docComment, $matches);
        if( $count>0 ) {
            foreach( $matches['name'] as $n=>$name ) {
                if( $name == $varName ) {
                    return $matches['type'][$n];
                }
            }
        }
        return null;
    }
    
    /**
     * get the namespaced class name
     * @param type $name the short class name
     * @return the long class name
     */
    private function lookupClass($name){
        $namespaces = array(
            'qtism\\common\\datatypes\\',
            'qtism\\data\\', 
            'qtism\\data\\content\\', 
            'qtism\\data\\content\\xhtml\\', 
            'qtism\\data\\content\\xhtml\\lists\\', 
            'qtism\\data\\content\\xhtml\\presentation\\', 
            'qtism\\data\\content\\xhtml\\tables\\', 
            'qtism\\data\\content\\xhtml\\text\\', 
            'qtism\\data\\content\\interactions\\', 
            'qtism\\data\\content\\expressions\\', 
            'qtism\\data\\content\\operators\\', 
            'qtism\\data\\processing\\', 
            'qtism\\data\\rules\\', 
            'qtism\\data\\state\\'
        ); 
        foreach($namespaces as $namespace){      //this could be cached
            $className = $namespace . ucfirst($name);
            if(class_exists($className, true)){
                return $className;
            }
        }
    }
}
?>