# kc-sf-plugin

[![NPM](https://img.shields.io/npm/v/kc-sf-plugin.svg?label=kc-sf-plugin)](https://www.npmjs.com/package/kc-sf-plugin) [![Downloads/week](https://img.shields.io/npm/dw/kc-sf-plugin.svg)](https://npmjs.org/package/kc-sf-plugin) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://github.com/k-capehart/kc-sf-plugin/blob/main/LICENSE)

This plugin is bundled with the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

## Contents

- [Install](#install)
- [Trigger-Framework](#trigger-framework)
- [List of Commands](#list-of-commands)
- [Build](#build)

## Install

```bash
sf plugins install kc-sf-plugin@x.y.z
```

## Trigger-Framework

The trigger-framework command auto generates components used in relation to Apex Triggers.

First, use the `--init` flag to initialize the framework for a given template. This generates files that should only be created once, like interfaces or custom setting objects.

After initializing, use the `--sobject` flag to add a given object to the framework.

![Demo of kc trigger-framework command creating triggers and classes](./assets/trigger-framework.gif)

The `--template` flag is used to choose which template to generate the apex code from. The available templates are:

- 1 (default)

  - Based on: https://github.com/kevinohara80/sfdc-trigger-framework
    - Fork with extra features: https://github.com/k-capehart/sfdc-trigger-framework
  - A Custom Setting called BypassAutomation\_\_c with checkbox fields for Salesforce objects
    - Allows disabling of triggers on a per object basis either globally or for a given user
  - Extendable Apex class for trigger handler functionality: TriggerHandler
  - Apex trigger, Handler, and Helper class for a Salesforce object
  - Apex test classes

- 2

  - Based on: https://github.com/trailheadapps/apex-recipes
  - 2 Custom Metadata objects: Metadata_Driven_Trigger and Disabled_For
    - Allows defining the order of execution for trigger handlers, and disable triggers either globally or for a given user
  - Extendable Apex classes for trigger handler functionality: TriggerHandler, MetadataTriggerHandler, and MetadataTriggerService
  - Apex trigger, Handler, and helper class for a Salesforce object

If you want to create a custom template, then use the `--custom-template` flag. The value given to the flag should be the path to a directory containing templates for classes, triggers, objects, etc. The directory should contain a `init.json` and `sobject.json` that provide instructions on which files to use. There are 3 required fields for each template:

- `name`: The API name for the component (i.e. `TriggerHandler` or `Enabled__c`)
- `fileType`: The file extension for the component (i.e. `.cls` or `.field-meta.xml`)
- `targetDir`: The file path within a salesforce dx project where the component should be created (i.e. `/classes/`, `/objects/Metadata_Driven_Trigger__mdt/fields/`)

`init.json` is used with the `--init` flag. `sobject.json` is used with the `--sobject` flag.

For example, imagine the following JSON file is stored at the relative path of `templates/sobject.json`. It is assumed that within this directory are also 5 other files called `BypassCustomField.txt`, `SObjectTrigger.txt`, `SObjectTriggerHandler.txt`, `SObjectTriggerHelper.txt`, and `SObjectTriggerHelper_Test.txt`. The `{{sobject}}` token is replaced at runtime with the value given in the `--sobject` flag.

```json
{
  "BypassCustomField.txt": {
    "name": "{{sobject}}__c",
    "fileType": ".field-meta.xml",
    "targetDir": "/objects/BypassAutomation__c/fields/"
  },
  "SObjectTrigger.txt": {
    "name": "{{sobject}}Trigger",
    "fileType": ".trigger",
    "targetDir": "/triggers/"
  },
  "SObjectTriggerHandler.txt": {
    "name": "{{sobject}}TriggerHandler",
    "fileType": ".cls",
    "targetDir": "/classes/"
  },
  "SObjectTriggerHelper.txt": {
    "name": "{{sobject}}Helper",
    "fileType": ".cls",
    "targetDir": "/classes/"
  },
  "SObjectTriggerHelper_Test.txt": {
    "name": "{{sobject}}Helper_Test",
    "fileType": ".cls",
    "targetDir": "/classes/"
  }
}
```

Running the command: `sf kc trigger-framework --custom-template templates/ --sobject Account` will create 5 files:

- Account\_\_c.field-meta.xml
- AccountTrigger.trigger
- AccountTriggerHandler.cls
- AccountTriggerHelper.cls
- AccountTriggerHelper_Test.cls

For more template examples: https://github.com/k-capehart/kc-sf-plugin/tree/main/src/templates/

## List of Commands

<!-- commands -->
* [`sf kc diff`](#sf-kc-diff)
* [`sf kc trigger-framework`](#sf-kc-trigger-framework)
* [`sf kc update-api`](#sf-kc-update-api)

## `sf kc diff`

Preview a retrieval and deploy to see what will be retrieved from the org, the potential conflicts, and the ignored files.

```
USAGE
  $ sf kc diff -o <value> [--json] [--flags-dir <value>] [--concise]

FLAGS
  -o, --target-org=<value>  (required) Login username or alias for the target org.
      --concise             Omits files that are forceignored.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Preview a retrieval and deploy to see what will be retrieved from the org, the potential conflicts, and the ignored
  files.

  You must run this command from within a project that has source tracking.

  The command outputs a table that describes the difference between your local project and an org. It is equivalent to
  running both the "sf project retrieve preview" and "sf project deploy preview" commands.

EXAMPLES
  View differences between local org and an org with the alias "my-org"
  $ sf kc diff --target-org my-org
  View differences between local org and the default org, omitting ignored files
  $ sf kc diff --concise

FLAG DESCRIPTIONS
  -o, --target-org=<value>  Login username or alias for the target org.

    Overrides your default org.

  --concise  Omits files that are forceignored.

    Ignore files by placing them in your .forceignore and using this flag.
```

_See code: [src/commands/kc/diff.ts](https://github.com/k-capehart/kc-sf-plugin/blob/1.4.16/src/commands/kc/diff.ts)_

## `sf kc trigger-framework`

Generate apex trigger frameworks based on templates.

```
USAGE
  $ sf kc trigger-framework [--json] [--flags-dir <value>] [-d <value>] [-i] [-s <value>...] [-t 1|2] [--custom-template
    <value>]

FLAGS
  -d, --target-dir=<value>       [default: force-app/main/default] The target directory for your salesforce project.
  -i, --init                     Initialize the trigger framework for the given template.
  -s, --sobject=<value>...       The name of the SObject that the trigger and classes will be created for.
  -t, --template=<option>        The template that should be used to generate the trigger framework.
                                 <options: 1|2>
      --custom-template=<value>  The directory in which the custom templates are located. View docs for more information
                                 on creating templates: https://github.com/k-capehart/kc-sf-plugin

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Generate apex trigger frameworks based on templates.

  Given an SObject, creates a Trigger and related components.

  Use the `--init` flag to initialize the framework, then the `--sobject` flag to create triggers based on the
  framework.

EXAMPLES
  Initialize a trigger framework using template-1.
  $ sf kc trigger-framework --template 1 --init
  Create a new trigger and related components for the Account and Contact object using template-1.
  $ sf kc trigger-framework --template 1 --sobject Account --sobject Contact
  Create a new trigger and related components with a custom template by providing the path to the locally stored templates.
  $ sf kc trigger-framework --custom-template templates/ --sobject Account
```

_See code: [src/commands/kc/trigger-framework.ts](https://github.com/k-capehart/kc-sf-plugin/blob/1.4.16/src/commands/kc/trigger-framework.ts)_

## `sf kc update-api`

Update the API version of Apex classes, triggers, and flows.

```
USAGE
  $ sf kc update-api -t classes|triggers|flows... -v <value> [--json] [--flags-dir <value>] [-d <value>]

FLAGS
  -d, --target-dir=<value>   [default: force-app/main/default] The target directory for your salesforce project.
  -t, --type=<option>...     (required) The component type whose API version should be updated.
                             <options: classes|triggers|flows>
  -v, --api-version=<value>  (required) The minimum required API version that components should satisfy.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Update the API version of Apex classes, triggers, and flows.

  Parse through a SFDX project and update the API version for Apex classes, triggers and flows to a specified version.
  The API version must be a valid version that is not deprecated.

EXAMPLES
  Update all apex classes and triggers to be at least version 61.0.
  - sf kc update-api --type classes --type triggers --api-version 61.0

FLAG DESCRIPTIONS
  -v, --api-version=<value>  The minimum required API version that components should satisfy.

    Override the api version used for api requests made by this command
```

_See code: [src/commands/kc/update-api.ts](https://github.com/k-capehart/kc-sf-plugin/blob/1.4.16/src/commands/kc/update-api.ts)_
<!-- commandsstop -->

## Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:k-capehart/kc-sf-plugin

# Install the dependencies and compile
yarn && yarn build
```

To use your plugin, run using the local `./bin/dev` or `./bin/dev.cmd` file.

```bash
# Run using local run file.
./bin/dev kc diff
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sf cli
sf plugins link .
# To verify
sf plugins
```
