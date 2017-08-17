<?php
use oat\taoQtiTest\models\cat\CatService;
use oat\libCat\custom\EchoAdaptEngine;
use \oat\taoOauth\model\provider\ProviderFactory;
use \oat\taoOauth\model\connector\implementation\OAuthConnector;

return new CatService([
    CatService::OPTION_ENGINE_ENDPOINTS => [
        'http://YOUR_URL_OAUTH/cat/api/' => [
            'class'  => '\oat\libCat\custom\EchoAdaptEngine',
            'args' => [
                'client_id' => 'YOUR_ID',
                'consumer_secret' => 'YOU_SECRET',
                'resource_owner_details_url' => false,
                'authorize_url' => false,
                'http_client_options' => array(),
                'token_url' => 'GET_TOKEN_URL',
                'token_key' => 'YOUR_STORAGE_TOKEN_KEY',
                'tokenParameters' => array(
                    'audience' => 'YOUR_AUDIENCE'
                ),
                'token_storage' => 'cache',
            ]
        ]
    ]
]);
