const core = require('@actions/core')
const github = require('@actions/github')
const config = require('./config');
const fs = require('fs');

const main = async () => {
    try {

        const client = github.getOctokit(config.inputs.githubToken);

        console.log("==> Workflow:", config.inputs.workflow);

        console.log("==> Repo:", github.context.repo.repo + "/owner:" + github.context.repo.owner);

        console.log("==> Conclusion:", config.inputs.workflowConclusion);

        if (config.inputs.runNumber) {
            console.log("==> RunNumber:", config.inputs.runNumber)
        }

        for await (const runs of client.paginate.iterator(client.actions.listWorkflowRuns,
            {
                owner: owner,
                repo: repo,
                workflow_id: workflow
            }
        )) {
            for (const run of runs.data) {

                core.info(`Run Data: ${JSON.stringify(run)}`);
                
                if (commit && run.head_sha != commit) {
                    continue;
                }
                if (runNumber && run.run_number != runNumber) {
                    continue;
                }
                if (workflowConclusion && (workflowConclusion != run.conclusion && workflowConclusion != run.status)) {
                    continue;
                }
                if (checkArtifacts || searchArtifacts) {
                    let artifacts = await client.actions.listWorkflowRunArtifacts({
                        owner: owner,
                        repo: repo,
                        run_id: run.id,
                    })
                    if (artifacts.data.artifacts.length == 0) {
                        continue
                    }
                    if (searchArtifacts) {
                        const artifact = artifacts.data.artifacts.find((artifact) => {
                            return artifact.name == name
                        })
                        if (!artifact) {
                            continue
                        }
                    }
                }
                runID = run.id;
                break;
            }
            if (runID) {
                break
            }
        }

        if (runID) {
            console.log("==> RunID:", runID)
        } else {
            throw new Error("no matching workflow run found")
        }

        // let artifacts = await client.paginate(client.actions.listWorkflowRunArtifacts, {
        //     owner: owner,
        //     repo: repo,
        //     run_id: runID,
        // })

        // // One artifact or all if `name` input is not specified.
        // if (name) {
        //     artifacts = artifacts.filter((artifact) => {
        //         return artifact.name == name
        //     })
        // }

        // if (artifacts.length == 0)
        //     throw new Error("no artifacts found")

        // for (const artifact of artifacts) {
        //     console.log("==> Artifact:", artifact.id)

        //     const size = filesize(artifact.size_in_bytes, { base: 10 })

        //     console.log(`==> Downloading: ${artifact.name}.zip (${size})`)

        //     const zip = await client.actions.downloadArtifact({
        //         owner: owner,
        //         repo: repo,
        //         artifact_id: artifact.id,
        //         archive_format: "zip",
        //     })

        //     const dir = name ? path : pathname.join(path, artifact.name)

        //     fs.mkdirSync(dir, { recursive: true })

        //     const adm = new AdmZip(Buffer.from(zip.data))

        //     adm.getEntries().forEach((entry) => {
        //         const action = entry.isDirectory ? "creating" : "inflating"
        //         const filepath = pathname.join(dir, entry.entryName)

        //         console.log(`  ${action}: ${filepath}`)
        //     })

        //     adm.extractAllTo(dir, true)
        //}
    } catch (error) {
        core.setOutput("error_message", error.message)
        core.setFailed(error.message)
    }
}

main();
