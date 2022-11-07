'use strict'

var request = require("request");

function slackAppender(config, layout) {
    return (loggingEvent) => {
        let text = layout(loggingEvent, config.timezoneOffset);
        let maxLength = config.maxLength;
        if (text.length > maxLength) {
            text = text.substring(0, maxLength) + '...```';
        }
        request.post(config.webhook, {
            json: { text: text }
        }, (error, res, body) => {
            if (error) {
                console.error('log4js:slack - Error sending log to slack: ', error) //eslint-disable-line
                return
            }
        })
    }
}

function configure(config, layouts) {
    let layout = layouts.basicLayout
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout)
    }

    return slackAppender(config, layout)
}

exports.configure = configure;