# Persistent artifact

Create artifact once and use it on any other workflow or workflow run in teh same repository. If you have slow build that is rearly changing but taking a lot of time to bild every time you run your worklfow, you can use this lugin to retrieve artifact that was build last time you run your worklow, ot create just a separate workfow to run that slow build only  when needed. 

Artifact will be kept current for as long as it is used, not rebuilt,  or expires due to no use 

See [below](#example) the YAML code of the depicted workflow. <br><br>

**Table of Contents**

- [Use cases](#use-cases)
- [Usage](#usage)
  - [How to start](#how-to-start)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Example](#example)
    - [Conditional Artifact Creation](#conditional-artifact-creation)
## Use cases
1. Create a worflow to make an artifact once. Then download that artifact by name in any other worklow in teh same repository.

2. Create a conditional build only in case artifact needs to be re-created. Use pre-creted artifact for as long as you need it. 

## Usage

### How to start

The action works exactly as @action/download- artifact. 

Create a step to retrieve you r persistent artifact 

```
 - name: get persistent artifact
        id: check-artifact
        uses: ez-leka/persistent-artifact@v1
        with:
          github-token: ${{ secrets.GH_TOKEN }}
          artifact-name:  <artifact name>
          path: <target directory>
```
### Inputs 

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Required                                   | Description                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github-token`                                                                                                                                                                       | Required     |                                                               |
| `artifact-name`                                                                                                                                                                       | Required     | Name of the artifact to download                                                              |
| `path`                                                                                                                                                                       | Optional     | Specify path to download atrifact to. If not provided, artifact will be downloaded into current directory.                                                                |

### Outputs

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `artifact-status`                                                                                                                                                                      | return status of the artifact:  <br>available: if artifact is available for download <br>not-found: if artifact is not found
| 

### Examples

#### Conditional artifact creation

```
 - name: check artifact
        id: check-artifact
        uses: ez-leka/persistent-artifact@v1
        with:
          github-token: ${{ secrets.GH_TOKEN }}
          artifact-name:  p-artifact
          path: /tmp/artifacts

      - name: Build artifact if necessary
        if: ${{ steps.check-artifact.outputs.artifact-status != 'available' }}
        run: |
          echo 'my artifact file content' > art.txt
          echo '  line 1' >> art.txt
          echo '  line 2' >> art.txt
          echo '  line 3' >> art.txt
          mkdir /tmp/artifacts
          mv art.txt /tmp/artifacts
          mkdir /tmp/artifactssubdir
          echo 'subdir artifact' >> /tmp/artifacts/subdir/sart.txt

      - name: Upload artifact if needed 
        if: ${{ steps.check-artifact.outputs.artifact-status != 'available' }}
        uses: actions/upload-artifact@v2
        with:
          name: p-artifact1
          path: /tmp/artifacts
          retention-days: 7  

```


