# Approve Workflow to Run

A custom GitHub Action that runs Node.js to approve workflows.

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