const core = require('@actions/core')
const github = require('@actions/github')
const artifact = require('@actions/artifact');
const config = require('./config');
const fs = require('fs');
const http = require('http');

const main = async () => {

    const artifactClient = artifact.create();

    // download a single artifact
    core.info(`Starting download for ${config.inputs.artifactName}`)


    const client = github.getOctokit(config.inputs.githubToken);

    const downloadOptions = {
        createArtifactFolder: false
    }
    
    const downloadResponse = await artifactClient.downloadArtifact(artifactName, path, downloadOptions);

    core.info(JSON.stringify(downloadResponse));

    // const artifacts = await client.paginate.iterator(octokit.rest.actions.listArtifactsForRepo({
    //     owner: github.context.repo.owner,
    //     repo: github.context.repo.repo,
    // }));

    // let found = false;
    // for (const artifact of artifacts) {
    //     if (artifact.name === config.inputs.artifactName) {
    //         found = true;

    //         const file = fs.createWriteStream("");

    //         const request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function (response) {
    //             response.pipe(file);

    //             // after download completed close filestream
    //             file.on("finish", () => {
    //                 file.close();
    //                 console.log("Download Completed");
    //             });
    //         });
    //     }
    // }
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
