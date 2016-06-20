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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 */
include_once __DIR__ . '/../includes/raw_start.php';

if(!isset($argv[1]) && !isset($argv[2]) && !isset($argv[3])){
    echo 'this script should be used with arguments php addQTIPackages.php DIRECTORY LOGIN PASSWORD';
    die();
}

$directory = $argv[1];
$login = $argv[2];
$password = $argv[3];


if(!is_dir($directory)){
    echo $directory . ' is not a valid directory';
    die();
}
$testClass = taoQtiTest_models_classes_QtiTestService::singleton()->getRootClass();

$directory = new RecursiveDirectoryIterator($directory);
$iterator = new RecursiveIteratorIterator($directory);
$regex = new RegexIterator($iterator, '/^.+\.zip$/i', RecursiveRegexIterator::GET_MATCH);

try {
    $auth = new \oat\generis\model\user\AuthAdapter();
    $auth->setCredentials($login, $password);
    $user = $auth->authenticate();
    $session = new common_session_DefaultSession($user);
    \common_session_SessionManager::startSession($session);

} catch (common_Exception $e) {
    echo $e->getMessage();
    die();
}

$packages = 0;
$imported = 0;
foreach ($regex as $archive) {
    $packages++;
    echo 'importing archive '.$archive[0].'...'.PHP_EOL;
    try {
        $report = taoQtiTest_models_classes_QtiTestService::singleton()->importMultipleTests(
            new core_kernel_classes_Class(TAO_TEST_CLASS),
            $archive[0]
        );
        $imported++;
    } catch (Exception $e) {
        common_Logger::e(
            'An error occured while importing QTI Test Example. The system reported the following error: ' . $e->getMessage(
            )
        );
        throw $e;
    }
}

echo $imported.' packages imported on '.$packages;
