# summary

Create a new trigger, handler class, and helper class for a Salesforce object. Recommend using `kc trigger-framework init` first.

# description

Given an SObject, creates `SObject.trigger`, `SObjectTriggerHandler.cls`, `SObjectHelper.cls`, and `SObjectHelper_Test.cls`.

`SObjectTriggerHandler` class extends `TriggerHandler` that is generated from the `kc trigger-framework init` command.

# examples

Create a new trigger, handler, and helper for the Account object.

<%= config.bin %> <%= command.id %> --sobject Account

# flags.target-dir.summary

The target directory for your apex classes and triggers. There should be a classes/ and triggers/ directory at this location.

# flags.sobject.summary

The name of the SObject that the trigger and classes will be created for.
