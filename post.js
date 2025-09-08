const core = require('@actions/core');
const github = require('@actions/github');

async function runPost() {
  try {
    // Log the post action start
    core.info('🧹 Starting post-step for approve-workflow-to-run action');
    
    // Get GitHub context
    const context = github.context;
    core.info(`Post-step cleanup for: ${context.repo.owner}/${context.repo.repo}`);
    
    // Get the main step result if available
    const mainResult = core.getState('main-result') || 'unknown';
    core.info(`Main step result: ${mainResult}`);
    
    // Get GitHub token from inputs
    const githubToken = core.getInput('github-token') || process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      core.warning('No GitHub token available, skipping workflow approval');
      return;
    }
    
    // Create octokit client
    const octokit = github.getOctokit(githubToken);
    
    // Check for workflows to approve for any event type
    core.info(`🔍 Checking for workflows to approve for event type: ${context.eventName}`);
    
    // Get workflow runs that are waiting for approval
    try {
      const { data: workflowRuns } = await octokit.rest.actions.listWorkflowRunsForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo,
        status: 'waiting',
        event: context.eventName,
        per_page: 50
      });
      
      core.info(`Found ${workflowRuns.total_count} workflow runs waiting for approval`);
      
      let workflowRunsToApprove = workflowRuns.workflow_runs;
      
      // For pull request events, filter workflow runs for the current pull request
      if (context.eventName === 'pull_request' || context.eventName === 'pull_request_target') {
        const prNumber = context.payload.pull_request?.number;
        if (prNumber) {
          workflowRunsToApprove = workflowRuns.workflow_runs.filter(run => 
            Array.isArray(run.pull_requests) && run.pull_requests.length > 0 && run.pull_requests.some(pr => pr.number === prNumber)
          );
          
          core.info(`Found ${workflowRunsToApprove.length} workflow runs for PR #${prNumber}`);
        } else {
          core.warning('Pull request number not found in context');
          workflowRunsToApprove = [];
        }
      } else {
        // For non-PR events (like workflow_dispatch, push, etc.), approve all waiting workflow runs
        core.info(`Found ${workflowRunsToApprove.length} workflow runs for ${context.eventName} event`);
      }
      
      // Approve each workflow run
      for (const run of workflowRunsToApprove) {
        try {
          await octokit.rest.actions.approveWorkflowRun({
            owner: context.repo.owner,
            repo: context.repo.repo,
            run_id: run.id
          });
          
          core.info(`✅ Approved workflow run: ${run.name} (ID: ${run.id})`);
        } catch (approvalError) {
          // Some workflow runs might not need approval or might already be approved
          core.warning(`Failed to approve workflow run ${run.id}: ${approvalError.message}`);
        }
      }
      
    } catch (apiError) {
      core.warning(`Failed to fetch workflow runs: ${apiError.message}`);
    }
    
    // Perform cleanup tasks
    core.info('Performing cleanup tasks...');
    
    core.info('✅ Post-step completed successfully');
    
  } catch (error) {
    // Post steps should not fail the overall action
    core.warning(`Post-step failed with error: ${error.message}`);
  }
}

// Run the post action
runPost();