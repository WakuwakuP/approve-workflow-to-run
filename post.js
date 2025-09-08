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
    
    // Check if this is a pull request event
    if (context.eventName === 'pull_request' || context.eventName === 'pull_request_target') {
      core.info('🔍 Pull request detected, checking for workflows to approve');
      
      // Get GitHub token from inputs
      const githubToken = core.getInput('github-token') || process.env.GITHUB_TOKEN;
      
      if (!githubToken) {
        core.warning('No GitHub token available, skipping workflow approval');
        return;
      }
      
      // Create octokit client
      const octokit = github.getOctokit(githubToken);
      
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
        
        // Filter workflow runs for the current pull request
        const prNumber = context.payload.pull_request?.number;
        if (prNumber) {
          const prWorkflowRuns = workflowRuns.workflow_runs.filter(run => 
            run.pull_requests && run.pull_requests.some(pr => pr.number === prNumber)
          );
          
          core.info(`Found ${prWorkflowRuns.length} workflow runs for PR #${prNumber}`);
          
          // Approve each workflow run
          for (const run of prWorkflowRuns) {
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
        } else {
          core.warning('Pull request number not found in context');
        }
        
      } catch (apiError) {
        core.warning(`Failed to fetch workflow runs: ${apiError.message}`);
      }
      
    } else {
      core.info(`Event type '${context.eventName}' is not a pull request, skipping workflow approval`);
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