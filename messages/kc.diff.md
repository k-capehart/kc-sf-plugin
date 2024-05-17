# summary

Preview a retrieval and deploy to see what will be retrieved from the org, the potential conflicts, and the ignored files.

# description

You must run this command from within a project that has source tracking.

The command outputs a table that describes the difference between your local project and an org. It is equivalent to running both the "<%= config.bin %> project retrieve preview" and "<%= config.bin %> project deploy preview" commands.

# examples

View differences between local org and an org with the alias "my-org"

<%= config.bin %> <%= command.id %> --target-org my-org

View differences between local org and the default org, omitting ignored files

<%= config.bin %> <%= command.id %> --concise

# flags.target-org.summary

Login username or alias for the target org.

# flags.target-org.description

Overrides your default org.

# flags.concise.summary

Omits files that are forceignored.

# flags.concise.description

Ignore files by placing them in your .forceignore and using this flag.
