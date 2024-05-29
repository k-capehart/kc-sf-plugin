# summary

Generate apex trigger frameworks based on templates.

# description

Given an SObject, creates a Trigger and accompaning handler classes and components.

Use the `--init` flag to initialize the framework, then the `--sobject` flag to create triggers based on the framework.

# examples

Initialize a trigger framework using template-1.

<%= config.bin %> <%= command.id %> --template 1 --template-override templates/ --init

Create a new trigger and related components for the Account and Contact object using template-1.

<%= config.bin %> <%= command.id %> --template 1 --sobject Account --sobject Contact

Create a new trigger and related components by overriding template-1 using files located at templates/.

<%= config.bin %> <%= command.id %> --template 1 --template-override templates/ --sobject Account

# flags.target-dir.summary

The target directory for your salesforce project.

# flags.sobject.summary

The name of the SObject that the trigger and classes will be created for.

# flags.template.summary

The template that should be used to generate the trigger framework.

# flags.template-override.summary

The directory in which the custom templates are located.

# flags.init.summary

Initialize the trigger framework for the given template.
