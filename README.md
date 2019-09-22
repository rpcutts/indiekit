# IndieKit

*An IndieWeb publishing toolkit*

[![Build status](https://github.com/paulrobertlloyd/indiekit/workflows/build/badge.svg)](https://github.com/paulrobertlloyd/indiekit/actions)
[![Coverage status](https://coveralls.io/repos/github/paulrobertlloyd/indiekit/badge.svg?branch=master)](https://coveralls.io/github/paulrobertlloyd/indiekit?branch=master)

Learn more about this project on the [documentation site](https://paulrobertlloyd.github.io/indiekit/).

## Local development

```
npm start
```

If you want to run the service locally, perhaps to use with a tool like [Postman](https://www.getpostman.com/), ensure the [required environment variables](https://paulrobertlloyd.github.io/indiekit/deploy) have been set.

If you’re developing a new feature and want the application to automatically restart whenever a file change is detected, you can use `npm run dev`.

## Tests

```
npm test
```

Before running any automated tests, an IndieAuth token needs to be assigned to the `TEST_INDIEAUTH_TOKEN` environment variable. This token, whose URL *should* match that used for `INDIEKIT_URL`, should also include `create`, `update` and `delete` scopes. [Homebrew Access Token](https://gimme-a-token.5eb.nl) is a useful tool for creating tokens for this purpose.

## Similar projects

IndieKit is inspired by similar projects made by members of the [IndieWeb community](https://indieweb.org), all of which you are encouraged to try:

* [Mastr Cntrl](https://github.com/vipickering/mastr-cntrl) by [Vincent Pickering](https://vincentp.me)
* [Micropub endpoint](https://github.com/muan/micropub-endpoint) by [Mu-An Chiou](https://muan.co)
* [Micropub to GitHub](https://github.com/voxpelli/webpage-micropub-to-github) by [Pelle Wessman](https://kodfabrik.se)
* [Postr](https://github.com/grantcodes/postr) by [Grant Richmond](https://grant.codes)
* [SiteWriter](https://github.com/gerwitz/sitewriter) by [Hans Gerwitz](https://hans.gerwitz.com)
