## Summary

"GitHub Actions is a continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline. You can create workflows that run tests whenever you push a change to your repository, or that deploy merged pull requests to production." [GitHub Docs](https://docs.github.com/en/actions/writing-workflows/quickstart)

## Workflows
Workflows can be configured to complete a variety of actions. GitHub provides templates for actions such as:
- [Continuous Integration](https://github.com/actions/starter-workflows/tree/main/ci)
- [Deployments](https://github.com/actions/starter-workflows/tree/main/deployments)
- [Automation](https://github.com/actions/starter-workflows/tree/main/automation)
- [Code Scanning](https://github.com/actions/starter-workflows/tree/main/code-scanning)
- [Pages](https://github.com/actions/starter-workflows/tree/main/pages)
### Workflow Structure
#### Root-level parameters
[name](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#run-name)
Specifies the name of the Workflow

Example: `name: Deploy to S3`

[run-name](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#run-name)
Specifies the name of this run of the workflow. When you view a workflow in GitHub, you can see a list of previous runs. The title of each run is specified by this parameter.

Example: `run-name: Deploy frontend code`

[on](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#on)
Specifies what should trigger the workflow. [See Possible Triggers](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows)

Example: `on: [push]`

[permissions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#permissions)
Used to modify the default permissions granted to the GitHub token. Can set either 'read', 'write', or 'none'. 'write' includes read permissions. You can specify multiple by using the pipe symbol.

Example:
```yaml
permissions:
  actions: read|write
  attestations: none
  checks: read
```

[env](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#env)
Used to set a map of variables available to all jobs in the workflow.
Example:
```yaml
env:
	DEPLOYMENT_TYPE: production
```

[defaults](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#defaults)
Used to set default settings for all jobs in the workflow.

[concurrency](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#concurrency)
Use `concurrency` to ensure that only a single job or workflow using the same concurrency group will run at a time. A concurrency group can be any string or expression.

**concurrency.cancel-in-progress**: optional boolean parameter. If true, it will cancel any other jobs or workflows running on the same concurrency channel.

Example:
```yaml
on:
  push:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

[jobs](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobs)
Specifies the jobs that should be completed as part of the workflow. Jobs run in parallel by default.
Example:
```yaml
jobs:
  Job1:
	...
  Job2:
	...
```

[jobs.<job_id>.name](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idname)
Specifies the name of the job.

Example:
```yaml
jobs:
  job_build:
	name: Build App
```

[jobs.<job_id>.permissions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idpermissions)
Similar to base permissions parameter. Modifies the github token's default permissions.

Example:
```yaml
jobs:
  job_build:
    name: Build App
    permissions:
      actions: read
      packages: write
      pull-requests: read|write
      statuses: none
```

[jobs.<job_id>.needs](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idneeds)
Specifies which jobs must complete successfully before this job begins. Can specify multiple jobs using an array.

```yaml
jobs:
  job_1:
    ...
  job_2:
    ...
  job_3:
    needs: [job_1, job_2]
  job_4:
	needs: job_3
```

[jobs.<job_id>.if](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idif)
Used to prevent a job from running unless a condition is met. See the section on **Workflow special variables** for more details on how to write a condition.

Example:
```yaml
jobs:
  production-deploy:
    if: github.repository == 'octo-org/octo-repo-prod'
```

[jobs.<job_id>.runs_on](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idruns-on)
Specifies the type of machine to run the job on.

Example:
```yaml
name: example-workflow
on: [push]
jobs:
  production-deploy:
    runs-on: ubuntu-latest
```

[jobs.<job_id>.environment](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idenvironment)
Specifies the environment that the job references.

[jobs.<job_id>.concurrency](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idenvironment)
See the root-level concurrency parameter.

[jobs.<job_id>.outputs](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idoutputs)
Set a map of output variables that will be available to all jobs that depend on this job.

[jobs.<job_id>.env](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idenv)
Set a map of environment variables that will be available to the job.

[jobs.<job_id>.defaults](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_iddefaults)
Set default settings for all steps in the job

[jobs.<job_id>.defaults.run](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_iddefaultsrun)
Sets the default shell and working directory for all steps in the job

[jobs.<job_id>.steps](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idsteps)
Specify a list of tasks to accomplish in the job. Each step is done in a separate runtime.

Example:
```yaml
name: Greeting from Mona

on: push

jobs:
  my-job:
    name: My Job
    runs-on: ubuntu-latest
    steps:
      - name: Print a greeting
        env:
          MY_VAR: Hi there! My name is
          FIRST_NAME: Mona
          MIDDLE_NAME: The
          LAST_NAME: Octocat
        run: |
          echo $MY_VAR $FIRST_NAME $MIDDLE_NAME $LAST_NAME.
```

[jobs.<job_id>.strategy](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategy)
Used to specify a matrix of parameters to mix and match to run the job with. The job will run with each combination of parameters in the matrix.

[jobs.<job_id>.continue-on-error](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idcontinue-on-error)
Used to indicate that if this job fails, continue running the workflow.

[jobs.<job_id>.container](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idcontainer)
Run the job in a container

[jobs.<job_id>.services](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idservices)
Specify services as containers that are then accessible by the job.

[jobs.<job_id>.uses](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_iduses)
Specify a workflow file that needs to be run before this job.

[jobs.<job_id>.with](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idwith)
Can be specified in addition to 'uses'. Allows you to set a map of inputs that will be passed to the workflow.

[jobs.<job_id>.secrets](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idsecrets)
Can be specified in addition to 'uses'. Allows you to set a map of secrets that will be passed to the workflow.
### Workflow special variables
[See which variables are available per parameter](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/accessing-contextual-information-about-workflow-runs#context-availability)
[How to write expressions](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/evaluate-expressions-in-workflows-and-actions)
## Setup
In order to get a workflow running, do the following:
1. Create the folder `.github/workflows` in the root of your project.
2. Inside `.github/workflows`, create a new file with the extension `.yml`. This is your workflow.
3. Inside the YAML file, add your workflow code.
4. Commit and push to GitHub