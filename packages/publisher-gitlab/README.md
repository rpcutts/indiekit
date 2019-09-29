# @indiekit/publisher-gitlab

*Publish to the IndieWeb via GitLab*

## Installation

`npm i @indiekit/publisher-gitlab`

## Configuration

```js
const Publisher = require('@indiekit/publisher-gitlab');

const gitlab = new Publisher({
  // config options here
});
```

### Options

* `host`: GitLab Instance Host URL. *Optional*, defaults to `https://gitlab.com`.
* `token`: GitLab access token. **Required**.
* `user`: GitLab username. **Required (if `projectId` not provided)**.
* `repo`: GitLab repository. **Required (if `projectId` not provided)**.
* `projectId`: GitLab project ID. **Required (if `user` and `repo` not provided)**.
* `branch`: GitLab branch files are saved to. *Optional*, defaults to `master`.
