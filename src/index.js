const core = require('@actions/core');
const github = require('@actions/github');
const artifact_mod = require('@actions/artifact');
const config = require('./config');
const AdmZip = require('adm-zip');
//const filesize = require('filesize');
const pathname = require('path');
const fs = require('fs');

const ArtifactStatus = {
    Available: 'available',
    NotFound: 'not-found'
}

const checkArtifactStatus = async (client) => {

    let artifact = null;

    try {
        const response = await client.paginate(
            client.rest.actions.listArtifactsForRepo,
            {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
            }
        );
        //core.debug(`Response ${JSON.stringify(response)}`);
        core.debug(`${response.length} artifacts  found`);
        
        // filter array of artifacts by name
        const named_artifacts = response.filter(function (el) {
            return el.name == config.inputs.artifactName &&
                el.expired !== true
        });
        core.debug(`Artifacts with requested name  ${JSON.stringify(named_artifacts)}`);

        // sort by 'updated_at' to get latest first
        named_artifacts.sort((a, b) => Date(b.updated_at) - new Date(a.updated_at))
        core.debug(`Artifacts with requested name sorted descending ${JSON.stringify(named_artifacts)}`);

        artifact = named_artifacts[0];
    } catch (error) {
        core.error(error);
    }
    return artifact;
}

const downloadArtifact = async (client, artifact) => {

    const files = [];

    const zip = await client.actions.downloadArtifact({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        artifact_id: artifact.id,
        archive_format: "zip",
    });
  
    const dir = config.resolvedPath;
    // make all directories
    core.debug(`Destination directory = ${dir}`);

    fs.mkdirSync(dir, { recursive: true });    

    const adm = new AdmZip(Buffer.from(zip.data));
    adm.getEntries().forEach((entry) => {
        const action = entry.isDirectory ? "creating" : "inflating"
        const filepath = pathname.join(dir, entry.entryName)

        core.debug(`       ${action}: ${filepath}`);

        if (!entry.isDirectory) {
            core.debug(`adding file ${filepath}`);
            files.push(filepath);
        }
    })

    adm.extractAllTo(dir, true);

    return files;
};

const main = async () => {

    if (debug == true) {
        const res = await octokit.actions.createOrUpdateRepoSecret({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            secret_name: ACTIONS_STEP_DEBUG,
            encrypted_value: encrypted,
        });
    }
    
    // download a single artifact
    core.debug(`Checking for ${config.inputs.artifactName}`)

    const client = github.getOctokit(config.inputs.githubToken);

    let found = ArtifactStatus.NotFound;

    const artifact = await checkArtifactStatus(client);

    core.debug(`Artifact to download: ${JSON.stringify(artifact)}`);
    if (artifact != null) {
        found = ArtifactStatus.Available;

        // download artifact
        const files = await downloadArtifact(client, artifact);

        // the call above must return list of downloaded files withtheir absolute pathes.

        //upload it back to make persistant past max days
        const artifactClient = artifact_mod.create();

        core.debug(`Files to re-upload ${JSON.stringify(files)}`);

        const uploadOptions = {
            continueOnError: true,
            retentionDays: 0

        };
        let result = await artifactClient.uploadArtifact(config.inputs.artifactName, files, config.resolvedPath, uploadOptions);
        core.debug(`Upload result ${JSON.stringify(result)}`);

        core.debug(`Deleting old artifact`);
        // delete prev version to make retrieval fast and consuistent
        result = await client.actions.deleteArtifact({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            artifact_id: artifact.id
        });
        core.debug(`Artifact ${artifact.id} deleted `);
    }

    core.debug(`Setting output to ${found}`);
    core.setOutput('artifact-status', found);

}

main();
