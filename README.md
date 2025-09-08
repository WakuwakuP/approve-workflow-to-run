# Approve Workflow to Run

A custom GitHub Action that runs Node.js to approve workflows.

## Features

- **Main Step**: Initializes the action and prepares for workflow approval
- **Post Step**: Automatically approves workflows for pull request events (always runs, even if main step fails)
- Accepts optional GitHub token for authentication
- Supports optional workflow name specification
- Proper error handling and logging
- State management between main and post steps
- **Pull Request Workflow Approval**: Automatically approves pending workflow runs for pull requests

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

1. **Main Step** (`dist/index.js`): Initializes the action, validates inputs, and prepares the GitHub API client
2. **Post Step** (`dist/post.js`): Handles workflow approval for any event type (always executes, regardless of main step outcome)

### Workflow Approval

The post step will check for and approve workflow runs that are waiting for approval:

**For pull request events** (`pull_request` or `pull_request_target`):
1. Check for workflow runs that are waiting for approval
2. Filter workflow runs associated with the current pull request
3. Automatically approve those workflow runs using the GitHub API

**For other event types** (such as `workflow_dispatch`, `push`, `schedule`, etc.):
1. Check for workflow runs that are waiting for approval
2. Automatically approve all waiting workflow runs for the event type
4. Log the approval results

The post step has access to the main step's execution result through saved state and can perform operations such as:
- Approving pending workflow runs for pull requests
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