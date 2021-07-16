# E2E testing

Please refer to the readme file placed at `tao/views/cypress` for generic info about E2E. This file is aimed at describing the E2E for the extension taoQtiTest.

Development of end-to-end tests in TAO is based on the principle of storing the test specs in each relevant extension, while the common and shared features with respect to TAO are stored in `tao-core`. The base engine as well as the very common features are supplied through the dependency `@oat-sa/e2e-runner`.

The local structure, in `tao-core` is a reduced form of the classic Cypress project structure:

<pre>
tao
|-- views
  |-- cypress.json        # project config
  |-- cypress/            #
    |-- envs/             # environment configs
    |-- fixtures/         # static data used in tests
    |-- tests/            # root folder of the tests
    |-- plugins/          # folder for the plugins
  |  -- support/          # support commands, imports, global setup
</pre>

The env files are to be placed in `tao/views/cypress/env`.

The plugins and command must be stored in respectively `tao/views/cypress/plugins` and `tao/views/cypress/support`.

> **Note:** For the time being, there is no way to store plugins or commands in each extension. If they are generic enough, say not related to any specific extension, they can be placed in `tao-core`.
> 
> Otherwise, the only way to have shared feature for a specific extension is to use local helpers. Often you will see a `utils` folder aside the tests, this is where such helpers will take place. Then can be imported the usual manner thanks to the ES module management. 

## Configuration

Because tests may be run against various envs (local, demo, staging, etc), we need to have multiple env files. They are stored in `cypress/envs/`, and loaded into the main config according to the key `env.configFile` defined in the `cypress.json`.

Create `envs/env*.json` file and set it in the `tao/views/cypress.json`:

```json
{
    "env": {
        "configFile": "cypress/envs/env-local.json"
    }
}
```

For taoQtiTest, the following additional config can be added in any `env*.json` file:
```json
{
    "testTakerUser": "e2e_test_taker",
    "testTakerPass": "e2e_pass",
    "deliveryIds": {
        "basicLinearTest": "Delivery of E2E Tests - basic linear test"
    }
}
```

The sample file `taoQtiTest/views/cypress/env/env.sample` contains an example.

### Environment setup
In order to have the E2E tests working properly, it is needed to follow these instructions:
- Any test packages from the folder `taoQtiTest/views/cypress/fixtures/testPackages` must be imported in TAO, usually within the namespace `E2E`.
- A specific test taker group must be created to give access to the tests, usually name `E2E`
- A specific test taker must be created, usually named `e2e_test_taker`, and added to the `E2E` group.
- All the E2E related tests must be published and assigned to the group `E2E`, or any group you created for this purpose
- The env file must contain the `deliveryIds` property, filled with the list of test names. The example given above should give a good idea of what needs to be set. Usually the names listed in it should be ok, unless the deliveries have been renamed.

## Commands

[Commands](https://docs.cypress.io/api/cypress-api/custom-commands.html) are a key part of Cypress. For now commands can be registered to `Cypress.Commands` in `tao/views/cypress/support/commands` file.
There's no ability to register them within the extensions yet.

> When registering a local or global command, take care to avoid name collisions with any command you might have imported.

> **Note:** For the time being, there is no way to store commands in each extension. If they are generic enough, say not related to any specific extension, they can be placed in `tao-core`.
>
> Otherwise, the only way to have shared commands for a specific extension is to use local helpers instead, so not a command actually. Often you will see a `utils` folder aside the tests, this is where such helpers will take place. Then can be imported the usual manner thanks to the ES module management.

## Plugins

Plugins can be created in `tao/views/cypress/plugins` directory.
Some plugins also register commands. You can import these files (for their side effects) in the `tao/views/cypress/support/index.js`.

> **Note:** For the time being, there is no way to store plugins in each extension. If they are generic enough, say not related to any specific extension, they can be placed in `tao-core`.
>
> Otherwise, the only way to have shared features for a specific extension is to use local helpers instead, so not a plugin actually. Often you will see a `utils` folder aside the tests, this is where such helpers will take place. Then can be imported the usual manner thanks to the ES module management.


## Fixtures

Any generic data needed in tests (and not hard-coded) should be placed in `tao/views/cypress/fixtures/`. Can be JSON, JavaScript, zip files, whatever is needed.

> **Note:** For the time being, there is no way to store fixture in each extension. If they are generic enough, say not related to any specific extension, they can be placed in `tao-core`.
>
> Otherwise, the only way to have shared fixture for a specific extension is to use local helpers instead. Often you will see a `utils` folder aside the tests, this is where such helpers will take place. Then can be imported the usual manner thanks to the ES module management.
> If the fixture is a data packages that doesn't need to get directly accessed from inside the test, it can be placed in the `taoQtiTest/cypress/fixtures` folder. This is how the test packages to import in TAO are supplied.

## How to run the tests

To run the tests there's a single entry point in tao core.

In your tao installation folder:
* `cd tao/views`
* `npm install`
* `npm run cy:open`  - to open cypress UI and browser
    
    or
    
   `npm run cy:run` - to run the tests headless
   
## How to create your tests

Add .spec files to the `taoQtiTest/views/cypress/tests` folder.

> Feel free to use common commands from the tao core (located in `tao/views/cypress/support`)

> For any local feature that needs to be shared, you may create a `utils` folder and add some regular JavaScript module. There is already a bunch of them you can use in `taoQtiTest/views/cypress/tests/utils`.
