# Approve Workflow to Run

A custom GitHub Action that runs Node.js to approve workflows.

## Features

- **Main Step**: Executes the primary workflow approval logic
- **Post Step**: Runs cleanup tasks after the main step completes (always runs, even if main step fails)
- Accepts optional GitHub token for authentication
- Supports optional workflow name specification
- Proper error handling and logging
- State management between main and post steps

## Usage

```yaml
name: Example Workflow
on: [push, pull_request]

jobs:
  approve:
    runs-on: ubuntu-latest
    steps:
      - name: Approve Workflow
        uses: WakuwakuP/approve-workflow-to-run@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          workflow-name: 'optional-workflow-name'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub token for authentication | true | `${{ github.token }}` |
| `workflow-name` | Name of the workflow to approve | false | `''` |

## Outputs

| Output | Description |
|--------|-------------|
| `result` | Result of the approval action |

## Execution Flow

1. **Main Step** (`dist/index.js`): Executes the primary workflow approval logic
2. **Post Step** (`dist/post.js`): Runs cleanup tasks and logs final results (always executes, regardless of main step outcome)

The post step has access to the main step's execution result through saved state and can perform cleanup operations such as:
- Cleaning up temporary resources
- Sending notifications
- Updating status
- Logging final results

## Development

This action is built with Node.js 20 and uses the GitHub Actions toolkit.

### Setup

```bash
npm install
```

### Running locally

```bash
npm start
```

## License

MIT