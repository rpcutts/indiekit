# @indiekit/publisher-github

*Publish to the IndieWeb via GitHub*

## Installation

`npm i @indiekit/publisher-github`

## Configuration

```js
const Publisher = require('@indiekit/publisher-github');

const github = new Publisher({
  // config options here
});
```

### Options

* `token`: GitHub access token. **Required**.
* `user`: GitHub username. **Required**.
* `repo`: GitHub repository. **Required**.
* `branch`: GitHub branch files are saved to. *Optional*, defaults to `master`.
