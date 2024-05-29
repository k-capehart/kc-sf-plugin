# kc-sf-plugin

[![NPM](https://img.shields.io/npm/v/kc-sf-plugin.svg?label=kc-sf-plugin)](https://www.npmjs.com/package/kc-sf-plugin) [![Downloads/week](https://img.shields.io/npm/dw/kc-sf-plugin.svg)](https://npmjs.org/package/kc-sf-plugin) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://github.com/k-capehart/kc-sf-plugin/blob/main/LICENSE)

This plugin is bundled with the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

## Install

```bash
sf plugins install kc-sf-plugin@x.y.z
```

## Trigger-Framework

The trigger-framework command covers auto generating triggers, handlers, and other components used in relation to Apex Triggers.

First, use the `--init` flag to initialize the framework for a given template. This generates files that should only be created once, like interfaces or custom setting objects.

After initializing, use the `--sobject` flag to generate Apex Triggers (and its handler classes) for a given object.

The `--template` flag is used to choose which template to generate the apex code from. The available templates are:

- 1 (default): https://github.com/k-capehart/kc-sf-plugin/tree/main/src/templates/template-1
  - An extendable Apex Trigger Handler virtual class: https://github.com/k-capehart/sfdc-trigger-framework
  - A Custom Setting called BypassAutomation\_\_c
  - A checkbox field on BypassAutomation for the given Salesforce object
  - An Apex trigger
  - An Apex handler class that extends the virtual class, and uses the BypassAutomation\_\_c object to determine if logic should be skipped
  - An Apex helper class
  - An Apex test class for the helper class

If you want to override a given template, then use the `--template-override` flag. The value given to the flag should be the path to a directory containing identically named files for a given template.
For example, to override template 1:

1. Copy and paste the contents of this folder into a local directory, such as `templates/`: https://github.com/k-capehart/kc-sf-plugin/tree/main/src/templates/template-1
2. Modify the content of the text files according to your specific needs
   - Note that `{{sobject}}` is a token that will be replaced with the given Salesforce Object name given in the `--sobject` flag
3. Run the commands:
   <br/>`$ sf kc trigger-framework --template 1 --template-override templates/ --init`
   <br/>`$ sf kc trigger-framework --template 1 --template-override templates/ --sobject Account`

## Commands

<!-- commands -->

- [`sf kc diff`](#sf-kc-diff)
- [`sf kc trigger-framework init`](#sf-kc-trigger-framework-init)
- [`sf kc trigger-framework trigger`](#sf-kc-trigger-framework-trigger)

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

_See code: [src/commands/kc/diff.ts](https://github.com/k-capehart/kc-sf-plugin/blob/1.3.1/src/commands/kc/diff.ts)_

## `sf kc trigger-framework init`

Auto generate an Apex Trigger framework. By default, the template uses this Trigger Handler Apex class: https://github.com/k-capehart/sfdc-trigger-framework

```
USAGE
  $ sf kc trigger-framework init [--json] [--flags-dir <value>] [-d <value>]

FLAGS
  -d, --target-dir=<value>  [default: force-app/main/default] The target directory for your salesforce project. There
                            should be subdirectories for classes/ and objects/.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Auto generate an Apex Trigger framework. By default, the template uses this Trigger Handler Apex class:
  https://github.com/k-capehart/sfdc-trigger-framework

  Using this command will initialize an Apex Trigger framework by creating an extendable Trigger Handler class based off
  a template.

  Also creates a CustomSetting called BypassAutomation that can be used to optionally skip triggers for specific users.

  SObject specific trigger handlers should extend this class and override the methods for beforeInsert(), afterInsert(),
  etc.

  If a file already exists with the given name then it is not overwritten.

EXAMPLES
  Initialize the trigger framework in the directory: force-app/main/default

    $ sf kc trigger-framework init --target-dir force-app/main/default
```

_See code: [src/commands/kc/trigger-framework/init.ts](https://github.com/k-capehart/kc-sf-plugin/blob/1.3.1/src/commands/kc/trigger-framework/init.ts)_

## `sf kc trigger-framework trigger`

Create a new trigger, handler class, and helper class for a Salesforce object. Recommend using `kc trigger-framework init` first.

```
USAGE
  $ sf kc trigger-framework trigger -s <value> [--json] [--flags-dir <value>] [-d <value>]

FLAGS
  -d, --target-dir=<value>  [default: force-app/main/default] The target directory for your apex classes and triggers.
                            There should be subdirectories for classes/, triggers/, and objects/.
  -s, --sobject=<value>...  (required) The name of the SObject that the trigger and classes will be created for.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Create a new trigger, handler class, and helper class for a Salesforce object. Recommend using `kc trigger-framework
  init` first.

  Given an SObject, creates a Trigger, a Handler class, a Helper class, a Test class, and a custom field for the
  BypassAutomation custom setting.

  The Handler class extends `TriggerHandler`.

  The custom field is used in the Handler class to check whether implementation should be skipped.

EXAMPLES
  Create a new trigger, handler, and helper for the Account object.

    $ sf kc trigger-framework trigger --sobject Account
```

_See code: [src/commands/kc/trigger-framework/trigger.ts](https://github.com/k-capehart/kc-sf-plugin/blob/1.3.1/src/commands/kc/trigger-framework/trigger.ts)_

<!-- commandsstop -->

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/kc-sf-plugin

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
