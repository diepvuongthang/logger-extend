"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _log4js = _interopRequireDefault(require("log4js"));

var _telegram = _interopRequireDefault(require("./appenders/telegram"));

var _slack = _interopRequireDefault(require("./appenders/slack"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let instance;

const createLogger = defaultAppName => {
  if (instance) {
    return instance;
  }

  const logFolder = process.env.LOG_FOLDER || './public/logs';
  const defaultAppenders = (process.env.LOG_DEFAULT_APPENDERS || 'CONSOLE,FILE,ERROR_ONLY').split(',').map(name => _lodash.default.trim(name));
  const config = {
    app: {
      name: process.env.APP_NAME || defaultAppName
    },
    logger: {
      level: process.env.LOG_LEVEL || 'debug',
      console: {
        enable: true,
        level: process.env.LOG_LEVEL || 'debug'
      },
      defaultLevel: 'debug',
      file: {
        compress: false,
        app: `${logFolder}/app.log`,
        error: `${logFolder}/error.log`,
        access: `${logFolder}/access.log`,
        format: '.yyyy-MM-dd'
      },
      appenders: defaultAppenders
    },
    hangoutError: {
      isEnabled: process.env.HANGOUT_ERROR_IS_ENABLED === 'true',
      logLevel: process.env.HANGOUT_ERROR_LOG_LEVEL || 'error',
      webhookUrl: process.env.HANGOUT_ERROR_CHANEL_WEBHOOK_URL
    },
    telegramAlert: {
      isEnabled: process.env.TELEGRAM_ALERT_IS_ENABLED === 'true',
      chatId: process.env.TELEGRAM_ALERT_CHAT_ID,
      token: process.env.TELEGRAM_ALERT_TOKEN,
      parseMode: process.env.TELEGRAM_ALERT_PARSE_MODE || 'markdown'
    },
    telegram: {
      isEnabled: process.env.LOG_TELEGRAM_IS_ENABLED === 'true',
      chatId: process.env.LOG_TELEGRAM_CHAT_ID,
      token: process.env.LOG_TELEGRAM_TOKEN,
      parseMode: process.env.LOG_TELEGRAM_PARSE_MODE || 'html',
      level: process.env.LOG_TELEGRAM_LOG_LEVEL || 'info'
    },
    slack: {
      isEnabled: process.env.LOG_SLACK_IS_ENABLED === 'true',
      channelId: process.env.LOG_SLACK_CHANNEL_ID,
      token: process.env.LOG_SLACK_TOKEN,
      level: process.env.LOG_SLACK_LOG_LEVEL || 'info',
      webhookUrl: process.env.LOG_SLACK_WEB_HOOK_URL,
      maxLength: process.env.LOG_SLACK_MAX_LENGTH || 1000,
      timezoneOffset: process.env.LOG_SLACK_TIMEZONE_OFFSET
    }
  };
  const logLayout = {
    type: 'pattern',
    pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} %p %z %c %m'
  };
  const appenders = {
    FILE: {
      type: 'dateFile',
      filename: config.logger.file.app,
      pattern: config.logger.file.format,
      level: 'trace',
      layout: logLayout,
      compress: config.logger.file.compress,
      daysToKeep: 90
    },
    CONSOLE: {
      type: 'console',
      layout: logLayout,
      level: 'trace'
    },
    FILE_ERROR: {
      type: 'dateFile',
      filename: config.logger.file.error,
      pattern: config.logger.file.format,
      level: 'trace',
      layout: logLayout,
      compress: config.logger.file.compress,
      daysToKeep: 90
    },
    ERROR_ONLY: {
      type: 'logLevelFilter',
      appender: 'FILE_ERROR',
      level: 'error'
    }
  };

  if (config.hangoutError.isEnabled) {
    appenders.HANGOUT = {
      type: '@kevit/log4js-hangout',
      webhookUrl: config.hangoutError.webhookUrl,
      layout: {
        type: 'pattern',
        pattern: `%h - \`${config.app.name}\` %n\`\`\`%d{yyyy-MM-dd hh:mm:ss.SSS} %p %z %m\`\`\``
      },
      level: 'warn'
    };
    appenders.HANGOUT_FILTER = {
      type: 'logLevelFilter',
      appender: 'HANGOUT',
      level: config.hangoutError.logLevel
    };
    config.logger.appenders.push('HANGOUT_FILTER');
  }

  if (config.telegramAlert.isEnabled) {
    appenders.TELEGRAM = {
      type: _telegram.default,
      silentAlertLevel: 'info',
      audioAlertLevel: 'error',
      bottoken: config.telegramAlert.token,
      botchatid: config.telegramAlert.chatId,
      parseMode: config.telegramAlert.parseMode,
      layout: {
        type: 'pattern',
        pattern: `%h - \`${config.app.name}\` %n\`\`\`%d{yyyy-MM-dd hh:mm:ss.SSS} %p %z %m\`\`\``
      }
    };
    appenders.TELEGRAM_FILTER = {
      type: 'logLevelFilter',
      appender: 'TELEGRAM',
      level: 'error'
    };
    config.logger.appenders.push('TELEGRAM_FILTER');
  }

  if (config.telegram.isEnabled) {
    appenders.TELEGRAM_APPENDER = {
      // type: 'log4js-telegram-appender',
      type: _telegram.default,
      silentAlertLevel: 'info',
      audioAlertLevel: 'error',
      bottoken: config.telegram.token,
      botchatid: config.telegram.chatId,
      parseMode: config.telegram.parseMode,
      layout: {
        type: 'pattern',
        pattern: `%h - ${config.app.name} %n%d{yyyy-MM-dd hh:mm:ss.SSS} %p %m`
      }
    };
    appenders.TELEGRAM_APPENDER_FILTER = {
      type: 'logLevelFilter',
      appender: 'TELEGRAM_APPENDER',
      level: config.telegram.level
    };
    config.logger.appenders.push('TELEGRAM_APPENDER_FILTER');
  }

  if (config.slack.isEnabled) {
    appenders.SLACK = {
      type: _slack.default,
      // channel_id: config.slack.channelId,
      // token: config.slack.token,
      // username: config.app.name,
      webhook: config.slack.webhookUrl,
      maxLength: config.slack.maxLength,
      timezoneOffset: config.slack.timezoneOffset,
      layout: {
        type: 'pattern',
        pattern: `%h - \`${config.app.name}\` %n\`\`\`%d{yyyy-MM-dd hh:mm:ss.SSS} %p %z %m\`\`\``
      },
      level: 'info'
    };
    appenders.SLACK_FILTER = {
      type: 'logLevelFilter',
      appender: 'SLACK',
      level: config.slack.level
    };
    config.logger.appenders.push('SLACK_FILTER');
  }

  _log4js.default.configure({
    pm2: true,
    appenders,
    categories: {
      default: {
        appenders: config.logger.appenders,
        level: config.logger.defaultLevel
      }
    }
  });

  instance = _log4js.default.getLogger('Logger');

  const getAxiosError = obj => {
    if (!obj) {
      return obj;
    }

    if (obj.inner) {
      obj.inner = getAxiosError(obj.inner);
    }

    if (!obj.isAxiosError) {
      return obj;
    } // Remove some properties on axios response


    const {
      response,
      config,
      request
    } = obj;

    const host = _lodash.default.get(request, 'connection._host');

    const result = {
      message: obj.message,
      stack: obj.stack,
      request: {
        host
      }
    };

    if (obj.code) {
      result.code = obj.code;
    }

    if (obj.httpCode) {
      result.httpCode = obj.httpCode;
    }

    if (!response) {
      return result;
    }

    const {
      config: requestConfig
    } = response;
    result.response = {
      status: response.status,
      statusText: response.statusText,
      config: {
        url: requestConfig ? requestConfig.url : null,
        method: requestConfig ? requestConfig.method : null
      },
      data: JSON.stringify(response.data)
    };
    return result;
  };

  const mapParams = args => {
    const params = _lodash.default.toArray(args).map(item => {
      return getAxiosError(item);
    });

    return params;
  };

  const methods = ['error', 'warn', 'info', 'debug', 'trace', 'fatal', 'mark'];
  methods.forEach(method => {
    const originalFunctionName = 'original' + _lodash.default.upperFirst(method);

    instance[originalFunctionName] = instance[method];

    instance[method] = function () {
      const params = mapParams(arguments);
      instance[originalFunctionName].apply(instance, params);
    };
  });
  return instance;
};

var _default = createLogger;
exports.default = _default;