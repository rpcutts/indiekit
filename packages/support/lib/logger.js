const {createLogger, format, transports} = require('winston');
const {Timber} = require('@timberio/node');
const {TimberTransport} = require('@timberio/winston');

let level;
let silent;
let colorize;
switch (process.env.NODE_ENV) {
  case 'production':
    level = 'debug';
    silent = false;
    colorize = false;
    break;
  case 'test':
    level = 'error';
    silent = true;
    colorize = false;
    break;
  default:
    level = 'debug';
    silent = false;
    colorize = true;
    break;
}

const logger = new createLogger({ // eslint-disable-line new-cap
  level,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({
      stack: true
    }),
    format.splat()
  ),
  transports: [
    new transports.Console({
      level,
      silent,
      handleExceptions: true,
      format: format.prettyPrint({
        colorize
      })
    })
  ]
});

// Log to Timber if API token provided
if (process.env.TIMBER_TOKEN) {
  const timber = new Timber(process.env.TIMBER_TOKEN, process.env.TIMBER_SOURCE);
  logger.add(new TimberTransport(timber));
}

module.exports = logger;
