# Crowdin Integration

This document explains how to set up and use the Crowdin integration for the WME Closures+ project.

## Overview

The project uses GitHub Actions to automatically upload localization files to Crowdin when changes are detected. The workflow is configured to:

1. Detect changes to the `src/localization/static/userscript.json` file
2. Upload the file to Crowdin under the path `closures-plus/localization.json`

## Required Secrets

To use this integration, you need to set up the following repository secrets in your GitHub repository:

1. `CROWDIN_PROJECT_ID`: Your Crowdin project ID
2. `CROWDIN_PERSONAL_TOKEN`: Your Crowdin personal access token

### How to Set Up Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click on "New repository secret"
5. Add the following secrets:
   - Name: `CROWDIN_PROJECT_ID`
   - Value: Your Crowdin project ID
   - Name: `CROWDIN_PERSONAL_TOKEN`
   - Value: Your Crowdin personal access token

### How to Get Crowdin Credentials

1. **Project ID**:
   - Go to your Crowdin project
   - The project ID is in the URL: `https://crowdin.com/project/{PROJECT_ID}`
   - Alternatively, you can find it in your project settings

2. **Personal Access Token**:
   - Go to your Crowdin account settings
   - Navigate to "API" or "Personal Access Tokens"
   - Create a new token with appropriate permissions (at minimum, it needs project files upload permission)
   - Copy the generated token

## Workflow Behavior

The workflow will run automatically when:
- Changes are pushed to the `src/localization/static/userscript.json` file on the main branch
- A pull request that changes this file is created against the main branch
- The workflow is manually triggered from the GitHub Actions tab

The workflow behaves differently depending on the trigger:
- **Pull Requests against main**: Always creates a Crowdin branch named `cp-{branch-name}` and uploads the file there
- **Direct pushes to main**: Uploads the file to the default branch in Crowdin (no branch is created)

Note: The workflow will not be triggered for pull requests opened against branches other than main.

## Manual Triggering

If you need to manually trigger the workflow:
1. Go to the "Actions" tab in your GitHub repository
2. Select the "Upload to Crowdin" workflow
3. Click on "Run workflow"
4. Select the branch you want to run the workflow on
5. Click "Run workflow"
