const core = require('@actions/core');
const github = require('@actions/github');

class Config {
    constructor() {
        this.input = {
            githubToken: core.getInput('github-token'),
            workflow: core.getInput('workflow'),
            artifactName: core.getInput('artifact-name'),

            path: core.getInput("path"/*, { required: true }*/),
            workflowConclusion: "success", //core.getInput("workflow_conclusion"),
            runNumber: core.getInput("run_number"),
            checkArtifacts: core.getInput("check_artifacts"),
            searchArtifacts: core.getInput("search_artifacts"),

        };
    }
}

try {
    module.exports = new Config();
} catch (error) {
    core.error(error);
    core.setFailed(error.message);
}