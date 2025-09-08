const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    // Get inputs
    const githubToken = core.getInput('github-token') || process.env.GITHUB_TOKEN;
    const workflowName = core.getInput('workflow-name');
    
    // Log the action start
    core.info('🚀 Starting approve-workflow-to-run action');
    
    // Get GitHub context
    const context = github.context;
    core.info(`Repository: ${context.repo.owner}/${context.repo.repo}`);
    core.info(`Event: ${context.eventName}`);
    
    if (workflowName) {
      core.info(`Workflow name: ${workflowName}`);
    }
    
    // Check if GitHub token is available
    if (!githubToken) {
      core.warning('No GitHub token provided, workflow approval functionality will be limited');
    }
    
    // Create octokit client if token is available
    if (githubToken) {
      const octokit = github.getOctokit(githubToken);
      core.info('GitHub API client initialized successfully');
    }
    
    // Log pull request information if available
    if (context.eventName === 'pull_request' || context.eventName === 'pull_request_target') {
      const prNumber = context.payload.pull_request?.number;
      if (prNumber) {
        core.info(`Pull Request: #${prNumber}`);
      }
    }
    
    core.info('✅ Main step completed successfully');
    
    // Set outputs
    core.setOutput('result', 'success');
    
    // Save state for post step
    core.saveState('main-result', 'success');
    
  } catch (error) {
    // Save error state for post step
    core.saveState('main-result', 'failed');
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

// Run the action
run();