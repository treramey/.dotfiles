---
description: Update the linked codebases to the latest version
agent: build
---

# Update Command

This command updates all the linked codebases (coldbox, commandbox, logbox, testbox) to their latest versions by pulling fresh changes from the upstream repositories.

You will need to run the following commands in this directory:`~/.local-dev-docs`

## Instructions

Execute the following git submodule update commands to update each repository:

```bash
git submodule update --remote --merge
```

Or update individually:

1. **Update ColdBox docs**

   ```bash
   git submodule update --remote --merge resources/coldbox
   ```

2. **Update CommandBox docs**

   ```bash
   git submodule update --remote --merge resources/commnadbox
   ```

3. **Update LogBox docs**

   ```bash
   git submodule update --remote --merge resources/logbox
   ```

4. **Update TestBox docs**
   ```bash
   git submodule update --remote --merge resources/testbox
   ```

Each command will fetch the latest changes from the upstream repository and merge them into the local submodule. There should be no conflicts, if there are ask the user what they want to do.
