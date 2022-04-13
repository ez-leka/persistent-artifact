github = require('@actions/github');
core = require('@actions/core');

const test = async () => {
    const github_token = core.getInput('github-token');
    const workflow = 'test-on-demand.yml';
    const artifact_name = 'my-runable';

    const client = github.getOctokit(github_token);

    const params = {
        owner: 'ez_leka',
        repo: 'test-on-demand-action-runner',
        //workflow_id: workflow,        
    }
    const workflows = await client.paginate('GET /repos/{owner}/{repo}/actions/runs', params);

    core.info(JSON.stringify(workflows))
    core.info('Done');
    
}

test();
