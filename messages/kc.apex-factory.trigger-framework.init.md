# summary

Auto generate an Apex Trigger framework. By default, the template uses this Trigger Handler Apex class: https://github.com/k-capehart/sfdc-trigger-framework

# description

Using this command will initialize an Apex Trigger framework by creating an extendable Trigger Handler class based off a template.

SObject specific trigger handlers should extend this class and override the methods for beforeInsert(), afterInsert(), etc.

If a file already exists with the given name then it is not overwritten.

# examples

Initialize the trigger framework in the directory: force-app/main/default

<%= config.bin %> <%= command.id %> --target-dir force-app/main/default

# flags.target-dir.summary

The target directory for your salesforce project. Files will be generated in a classes/ sub-directory. (default=force-app/main/default).
