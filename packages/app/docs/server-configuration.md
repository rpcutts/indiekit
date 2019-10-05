---
title: Server configuration
---
Certain aspects of {{ app.name }} can be adapted by updating the following environment variables.

### Environment variables

#### {{ app.name }}

`INDIEKIT_URL`
: URL of the website you want to publish to. **Required**.

`INDIEKIT_CONFIG_PATH`
: Location of configuration file in your repo, relative to its root. *Optional*, if not provided, default values will be used for templates and file paths.

`INDIEKIT_LOCALE`
: Locale with which to format dates. *Optional*, defaults to `en-GB`.

#### IndieAuth

`INDIEAUTH_TOKEN_ENDPOINT`
: IndieAuth token endpoint. *Optional*, defaults [`https://tokens.indieauth.com/token`](https://tokens.indieauth.com/token)

#### GitHub

`GITHUB_TOKEN`
: A GitHub [personal access token](https://github.com/settings/tokens). **Required**.

`GITHUB_USER`
: Username on GitHub. **Required**.

`GITHUB_REPO`
: Name of the repository files will be saved to. **Required**.

`GITHUB_BRANCH`
: Name of the branch files will be saved to. *Optional*, defaults to `master`.
