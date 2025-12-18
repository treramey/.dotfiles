# Create Pull Request Command

This command automates the process of creating a pull request with several key features:

## Key Behaviors

- Creates a new branch from current changes
- Automatically splits changes into logical commits
- Generates descriptive commit messages

## Commit Splitting Guidelines

- Prefix the commit message with the current branch name minus the feature/ followed by a colon and space character.
- Split commits by feature, component, or concern
- Keep related file changes together
- Separate refactoring from new features
- Ensure each commit is independently understandable
- Separate unrelated changes into distinct commits
- Do not include claude code as a contribution

The command aims to streamline the code contribution process by providing intelligent commit and pull request creation.
