require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const web = new WebClient(process.env.slackToken);
const channel = '#sleep-savior'

// Send message to a channel
function normal(text, attachmentText) {
  (async () => {
    try {
      const result = await web.chat.postMessage({
        channel,
        text: text,
        attachments: [
          {
            text: attachmentText
          }
        ]
      });
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  })();
}
function warn(text, attachmentText) {
  (async () => {
    try {
      const result = await web.chat.postMessage({
        channel,
        text,
        attachments: [
          {
            color: '#ffff00',
            text: attachmentText
          }
        ]
      });
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  })();
}
function alert(text, attachmentText) {
  (async () => {
    try {
      const result = await web.chat.postMessage({
        channel,
        text,
        attachments: [
          {
            color: '#ff0000',
            text: attachmentText
          }
        ]
      });
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  })();
}
module.exports = {
  normal, warn, alert
}
