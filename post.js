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
    
    // Perform cleanup tasks
    core.info('Performing cleanup tasks...');
    
    // Example cleanup logic - this could include:
    // - Cleaning up temporary resources
    // - Sending notifications
    // - Updating status
    // - Logging final results
    
    core.info('✅ Post-step completed successfully');
    
  } catch (error) {
    // Post steps should not fail the overall action
    core.warning(`Post-step failed with error: ${error.message}`);
  }
}

// Run the post action
runPost();