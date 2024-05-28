# summary

Create a new trigger, handler class, and helper class for a Salesforce object. Recommend using `kc trigger-framework init` first.

# description

Given an SObject, creates a Trigger, a Handler class, a Helper class, a Test class, and a custom field for the BypassAutomation custom setting.

The Handler class extends `TriggerHandler`.

The custom field is used in the Handler class to check whether implementation should be skipped.

# examples

Create a new trigger, handler, and helper for the Account object.

<%= config.bin %> <%= command.id %> --sobject Account

# flags.target-dir.summary

The target directory for your apex classes and triggers. There should be subdirectories for classes/, triggers/, and objects/.

# flags.sobject.summary

The name of the SObject that the trigger and classes will be created for.
