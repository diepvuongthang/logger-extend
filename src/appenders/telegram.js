"use strict";

var _request = _interopRequireDefault(require("request"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable quotes */
// This is the function that generates an appender function
function stdoutAppender(layout, levels, config) {
  var silentLevel = levels.getLevel(config.silentAlertLevel);
  var audioLevel = levels.getLevel(config.audioAlertLevel);
  var botchat_params = {
    method: "GET",
    uri: "https://api.telegram.org/bot" + config.bottoken + "/sendMessage",
    qs: {
      chat_id: config.botchatid,
      parse_mode: config.parseMode
    }
  }; // This is the appender function itself

  const appender = loggingEvent => {
    var params = JSON.parse(JSON.stringify(botchat_params));

    if (silentLevel.isLessThanOrEqualTo(loggingEvent.level.levelStr)) {
      // console.log(`===== silentAlertLevel is less than loggingEvent level.`);
      if (audioLevel.isLessThanOrEqualTo(loggingEvent.level.levelStr)) {
        // console.log(`===== log telegram with sound`);
        Object.assign(params.qs, {
          text: layout(loggingEvent),
          disable_notification: false
        });

        if (params.qs.text.length > 4096) {
          params.qs.text = params.qs.text.substr(0, 4080) + '...';
        }

        (0, _request.default)(params, (error, response, body) => {
          if (error) {
            console.log("Error sending to telegram:");
            console.log(error);
          }
          /* else {
                      console.log("Message sent to telegram:");
                      console.log(body);
                  }*/

        });
      } else {
        // console.log(`===== log telegram quietly`);
        Object.assign(params.qs, {
          text: layout(loggingEvent),
          disable_notification: true
        });

        if (params.qs.text.length > 4096) {
          params.qs.text = params.qs.text.substr(0, 4080) + '...';
        }

        (0, _request.default)(params, (error, response, body) => {
          if (error) {
            console.log("Error sending to telegram:");
            console.log(error);
          }
          /* else {
                      console.log("Message sent to telegram:");
                      console.log(body);
                  } */

        });
      }
    }
    /* else {
          console.log(`===== silentAlertLevel is greater than or equal to loggingEvent level.\n===== don't log telegram`);
      } */
    // process.stdout.write(`test: ${layout(loggingEvent)}\n`);

  }; // add a shutdown function.

  /*
  appender.shutdown = (done) => {
      process.stdout.write('appender shutdown', done);
  };
  */


  return appender;
}

function configure(config, layouts, findAppender, levels) {
  // the default custom layout for this appender, not using the layouts module
  var default_layout = function (loggingEvent) {
    var header = `<b>${loggingEvent.categoryName}: ${loggingEvent.level}</b>\n`;
    var timestamp = `[${loggingEvent.startTime.toISOString()}]\n`;
    var body = loggingEvent.data.map(d => {
      try {
        if (typeof d === 'object') return JSON.stringify(d);
      } catch (e) {// ignore
      }

      return d.toString();
    }).join("\n");
    return header + timestamp + body;
  };

  var use_layout = config.layout ? layouts.layout(config.layout.type, config.layout) : default_layout; // create a new appender instance

  return stdoutAppender(use_layout, levels, config);
} // export the only function needed


exports.configure = configure;