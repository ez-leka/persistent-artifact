const core = require('@actions/core');
const github = require('@actions/github');
const artifact = require('@actions/artifact');
const config = require('./config');

const ArtifactStatus = {
    Available: 'available',
    Expired: 'expired',
    NotFound: 'not-found'
}


const main = async () => {

    // download a single artifact
    core.info(`Checking for ${config.inputs.artifactName}`)

    const client = github.getOctokit(config.inputs.githubToken);
    const artifactClient = artifact.create();

    const downloadOptions = {
        createArtifactFolder: false
    }

    let found = ArtifactStatus.NotFound;

    for await (const response of client.paginate.iterator(
        client.rest.actions.listArtifactsForRepo,
        {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        }
    )) {
        for (const artifact of response.data) {
            core.info(`Artifact: ${JSON.stringify(artifact)}`);
        }
    }

    // const artifacts = client.paginate(client.rest.actions.listArtifactsForRepo({
    //     owner: github.context.repo.owner,
    //     repo: github.context.repo.repo,
    // }));
    // core.info(`All Artifacts: ${JSON.stringify(artifacts)}`);


    // for(artifact of artifacts){
    //     core.info(`Artifact: ${JSON.stringify(artifact)}`);

    //     if (artifact.name === config.inputs.artifactName) {
    //         core.info(`Found`);
    //         found = ArtifactStatus.Available;
    //         if (artifact.expired == true) {
    //             core.info(`     Expired`)
    //             found = ArtifactStatus.Expired;
    //         }
    //         break;
    //     }
    // }
    // core.info(`Downloading now`)
    // if (found == ArtifactStatus.Available) {
    //     // artifact is available - download it 
    //     const downloadResponse = await artifactClient.downloadArtifact(
    //         config.inputs.artifactName,
    //         config.resolvedPath,
    //         downloadOptions);

    //     core.info(`Downloaded Response: ${downloadResponse}`);
    // }

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
