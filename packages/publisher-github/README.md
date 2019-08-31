# @indiekit/publisher-github

*Publish to the IndieWeb via GitHub*

## Installation

`npm i @indiekit/publisher-github`

## Configuration

```js
// indiekit.config.js
module.exports = {
  adapter: require('@indiekit/publisher-github')({
    // config options here
  })
};
```

### Options

* `token`: GitHub access token. **Required**.
* `user`: GitHub username. **Required**.
* `repo`: GitHub repository. **Required**.
* `branch`: GitHub branch files are saved to. *Optional*, defaults to `master`.
