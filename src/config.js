const core = require('@actions/core');
const github = require('@actions/github');
const os = require('os');
const path = require('path');

class Config {
    constructor() {
        this.inputs = {
            githubToken: core.getInput('github-token',{ required: true }),
            artifactName: core.getInput('artifact-name', { required: true }),
            destinationPath: core.getInput('path', { required: true }),
            debug: core.getBooleanInput('debug'),
        };

        if (debug == true) {
            const res = await octokit.actions.createOrUpdateRepoSecret({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                secret_name: ACTIONS_STEP_DEBUG,
                encrypted_value: encrypted,
            });            
        }
        core.info('Received inputs: ' + JSON.stringify(this.inputs));
        
        this.resolvedPath;
        // resolve tilde expansions, path.replace only replaces the first occurrence of a pattern
        if (this.inputs.destinationPath.startsWith(`~`)) {
            this.resolvedPath = path.resolve(this.inputs.destinationPath.replace('~', os.homedir()));
        } else {
            this.resolvedPath = path.resolve(this.inputs.destinationPath);
        }
        core.info(`Resolved path is ${this.resolvedPath}`);
    }
}

try {
    module.exports = new Config();
} catch (error) {
    core.error(error);
    core.setFailed(error.message);
}