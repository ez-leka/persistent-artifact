const core = require('@actions/core');
const github = require('@actions/github');
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
        for await (const response of client.paginate.iterator(
            client.rest.actions.listArtifactsForRepo,
            {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
            }
        )) {
            core.debug(`Responce data ${JSON.stringify(response.data)}`);
            // do whatever you want with each response, break out of the loop, etc.
            core.debug(`${response.data.length} artifacts  found`, response.data.length);

            // filter array of artifacts by name
            const named_artifacts = response.data.filter(function (el) {
                return el.name == config.inputs.artifactName &&
                    el.expired !== true
            });
            core.debug(`Artifacts with requested name  ${JSON.stringify(named_artifacts)}`);

            // sort by 'updated_at' to get latest first
            named_artifacts.sort((a, b) => Date(b.updated_at) - new Date(a.updated_at))
            core.debug(`Artifacts with requested name sorted descending ${JSON.stringify(named_artifacts)}`);

            artifact = named_artifacts[0];
        }
    } catch (error) {
        core.error(error);
    }
    return artifact;
}

const downloadArtifact = async (client, artifact) => {

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
    })

    adm.extractAllTo(dir, true);

};

const main = async () => {

    // download a single artifact
    core.debug(`Checking for ${config.inputs.artifactName}`)

    const client = github.getOctokit(config.inputs.githubToken);

    const downloadOptions = {
        createArtifactFolder: false
    }

    let found = ArtifactStatus.NotFound;

    const artifact = await checkArtifactStatus(client);

    core.info(`Artifact to download: ${JSON.stringify(artifact)}`);
    if (artifact != null) {
        found = ArtifactStatus.Available;

        // download artifact
        downloadArtifact(client, artifact);
    }

    core.debug(`Setting output to ${found}`);
    core.setOutput('artifact-status', found);

    // try {

    //     const client = github.getOctokit(config.inputs.githubToken);

    //     console.log("==> Workflow:", config.inputs.workflow);

    //     console.log("==> Repo:", github.context.repo.repo + "/owner:" + github.context.repo.owner);

    //     console.log("==> Conclusion:", config.inputs.workflowConclusion);

    //     if (config.inputs.runNumber) {
    //         console.log("==> RunNumber:", config.inputs.runNumber)
    //     }

    //     const runs = await client.paginate.iterator(client.rest.actions.listWorkflowRuns,
    //         {
    //             owner: github.context.repo.owner,
    //             repo: github.context.repo.repo,
    //             workflow_id: config.inputs.workflow
    //         }
    //     );


    //     for (const run of runs.data) {

    //         core.info(`Run Data: ${JSON.stringify(run)}`);

    //         if (config.inputs.runNumber && run.run_number != runNumber) {
    //             continue;
    //         }
    //         if (config.inputs.workflowConclusion && config.inputs.workflowConclusion != run.conclusion) {
    //             continue;
    //         }
    //         // found successfull run with artifact

    //         // found successfull run with artifact
    //         const runTimestamp = Date.parse(run.run_started_at);
    //         if (dateOfRun == null || (dateOfRun < runTimestamp)) {
    //             foundRunId = run.id;
    //             dateOfRun = runTimestamp;
    //         }
    //     }

    //     if (runID) {
    //         core.info(`RunID: ${runID}`);
    //     } else {
    //         throw new Error("no matching workflow run found");
    //     }

    //     // let artifacts = await client.paginate(client.actions.listWorkflowRunArtifacts, {
    //     //     owner: owner,
    //     //     repo: repo,
    //     //     run_id: runID,
    //     // })

    //     // // One artifact or all if `name` input is not specified.
    //     // if (name) {
    //     //     artifacts = artifacts.filter((artifact) => {
    //     //         return artifact.name == name
    //     //     })
    //     // }

    //     // if (artifacts.length == 0)
    //     //     throw new Error("no artifacts found")

    //     // for (const artifact of artifacts) {
    //     //     console.log("==> Artifact:", artifact.id)

    //     //     const size = filesize(artifact.size_in_bytes, { base: 10 })

    //     //     console.log(`==> Downloading: ${artifact.name}.zip (${size})`)

    //     //     const zip = await client.actions.downloadArtifact({
    //     //         owner: owner,
    //     //         repo: repo,
    //     //         artifact_id: artifact.id,
    //     //         archive_format: "zip",
    //     //     })

    //     //     const dir = name ? path : pathname.join(path, artifact.name)

    //     //     fs.mkdirSync(dir, { recursive: true })

    //     //     const adm = new AdmZip(Buffer.from(zip.data))

    //     //     adm.getEntries().forEach((entry) => {
    //     //         const action = entry.isDirectory ? "creating" : "inflating"
    //     //         const filepath = pathname.join(dir, entry.entryName)

    //     //         console.log(`  ${action}: ${filepath}`)
    //     //     })

    //     //     adm.extractAllTo(dir, true)
    //     //}
    // } catch (error) {
    //     core.setOutput("error_message", error.message)
    //     core.setFailed(error.message)
    // }
}

main();
