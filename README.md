# kc-sf-plugin

[![NPM](https://img.shields.io/npm/v/kc-sf-plugin.svg?label=kc-sf-plugin)](https://www.npmjs.com/package/kc-sf-plugin) [![Downloads/week](https://img.shields.io/npm/dw/kc-sf-plugin.svg)](https://npmjs.org/package/kc-sf-plugin) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://github.com/k-capehart/kc-sf-plugin/blob/main/LICENSE)

This plugin is bundled with the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

## Install

```bash
sf plugins install kc-sf-plugin@x.y.z
```

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

## Commands

<!-- commands -->

- [`sf kc diff`](#sf-kc-diff)

## `sf kc diff`

Preview a retrieval and deploy to see what will be retrieved from the org, the potential conflicts, and the ignored files.

```
USAGE
  $ sf kc diff -o <value> [--json] [--flags-dir <value>] [--concise]

FLAGS
  -o, --target-org=<value>  (required) [default: kyleacapehart@gmail.com.dev] Login username or alias for the target
                            org.
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

_See code: [src/commands/kc/diff.ts](https://github.com/k-capehart/kc-sf-plugin/blob/v1.1.2/src/commands/kc/diff.ts)_

<!-- commandsstop -->
