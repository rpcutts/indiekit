const debug = require('debug')('indiekit:app');
const express = require('express');
const {check, validationResult} = require('express-validator');
const redis = require('redis');
const {promisify} = require('util');

const config = require('../config');

// Redis
const client = redis.createClient({
  url: config.redisUrl
});

client.on('error', error => {
  debug(error);
});

client.hmget = promisify(client.hmget);
client.hgetall = promisify(client.hgetall);

const router = new express.Router();

// Server
router.get('/app', async (req, res) => {
  res.render('configure/app', {
    publisher: await client.hmget('app', 'publisher'),
    locale: await client.hmget('app', 'locale'),
    themeColor: await client.hmget('app', 'themeColor')
  });
});

router.post('/app', (req, res) => {
  const {publisher, locale, themeColor} = req.body;
  const {referrer} = req.query;
  client.hmset('app', {publisher, locale, themeColor});
  res.redirect(referrer || '/configure/publisher');
});

// Publisher
router.get('/publisher', async (req, res) => {
  res.render('configure/publisher', {
    user: await client.hmget('publisher', 'user'),
    repo: await client.hmget('publisher', 'repo'),
    branch: await client.hmget('publisher', 'branch'),
    token: await client.hmget('publisher', 'token')
  });
});

router.post('/publisher', [
  check('user')
    .matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`configure.publisher.${path}.error`);
    }),
  check('repo')
    .matches(/^[a-zA-Z0-9-_]+$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`configure.publisher.${path}.error`);
    }),
  check('token')
    .matches(/^[0-9a-fA-F]{40}$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`configure.publisher.${path}.error`);
    })
], async (req, res) => {
  const {user, repo, branch, token} = req.body;
  const {referrer} = req.query;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.render('configure/publisher', {
      errors: errors.mapped(),
      user,
      repo,
      branch,
      token
    });
  } else if (user && repo && token) {
    client.hmset('publisher', {user, repo, branch, token});
    res.redirect(referrer || '/configure/done');
  }
});

// Done
router.get('/done', async (req, res) => {
  const app = await client.hgetall('app').catch(error => {
    debug(error);
  });
  const publisher = await client.hgetall('publisher').catch(error => {
    debug(error);
  });

  res.render('configure/done', {
    config: {
      app, publisher
    }
  });
});

module.exports = router;
