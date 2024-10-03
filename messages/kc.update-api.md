# summary

Update the API version of Apex classes, triggers, and flows.

# description

Parse through a SFDX project and update the API version for Apex classes, triggers and flows to a specified version. The API version must be a valid version that is not deprecated.

# flags.target-dir.summary

The target directory for your salesforce project.

# examples

Update all apex classes and triggers to be at least version 61.0.

- <%= config.bin %> <%= command.id %> --type classes --type triggers --api-version 61.0

# flags.type.summary

The component type whose API version should be updated.

# flags.type.api-version

The minimum required API version that components should be updated to satisfy.
