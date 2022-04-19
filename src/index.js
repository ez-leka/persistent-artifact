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
        //config.debug(`Response ${JSON.stringify(response)}`);
        config.debug(`${response.length} artifacts  found`);
        
        // filter array of artifacts by name
        const named_artifacts = response.filter(function (el) {
            return el.name == config.inputs.artifactName &&
                el.expired !== true
        });
        config.debug(`Artifacts with requested name  ${JSON.stringify(named_artifacts)}`);

        // sort by 'updated_at' to get latest first
        named_artifacts.sort((a, b) => Date(b.updated_at) - new Date(a.updated_at))
        config.debug(`Artifacts with requested name sorted descending ${JSON.stringify(named_artifacts)}`);

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
    config.debug(`Destination directory = ${dir}`);

    fs.mkdirSync(dir, { recursive: true });    

    const adm = new AdmZip(Buffer.from(zip.data));
    adm.getEntries().forEach((entry) => {
        const action = entry.isDirectory ? "creating" : "inflating"
        const filepath = pathname.join(dir, entry.entryName)

        config.debug(`       ${action}: ${filepath}`);

        if (!entry.isDirectory) {
            config.debug(`adding file ${filepath}`);
            files.push(filepath);
        }
    })

    adm.extractAllTo(dir, true);

    return files;
};

const main = async () => {

    // download a single artifact
    config.debug(`Checking for ${config.inputs.artifactName}`)

    const client = github.getOctokit(config.inputs.githubToken);

    let found = ArtifactStatus.NotFound;

    const artifact = await checkArtifactStatus(client);

    config.debug(`Artifact to download: ${JSON.stringify(artifact)}`);
    if (artifact != null) {
        found = ArtifactStatus.Available;

        // download artifact
        const files = await downloadArtifact(client, artifact);

        // the call above must return list of downloaded files withtheir absolute pathes.

        //upload it back to make persistant past max days
        const artifactClient = artifact_mod.create();

        config.debug(`Files to re-upload ${JSON.stringify(files)}`);

        const uploadOptions = {
            continueOnError: true,
            retentionDays: 0

        };
        config.debug(`Deleting old artifact`);
        // delete prev version to make retrieval fast and consuistent
        let result = await client.actions.deleteArtifact({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            artifact_id: artifact.id
        });
        config.debug(`Artifact ${artifact.id} deleted `);

        config.debug(`creating new artifact`);
        result = await artifactClient.uploadArtifact(config.inputs.artifactName, files, config.resolvedPath, uploadOptions);
        config.debug(`Upload result ${JSON.stringify(result)}`);

    }

    config.debug(`Setting output to ${found}`);
    core.setOutput('artifact-status', found);

}

main();
