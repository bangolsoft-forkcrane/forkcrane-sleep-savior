const { WebClient } = require('@slack/web-api');

// Initialize a new WebClient with your bot token
const web = new WebClient("xoxb-3912921742950-4648961863476-ugpcaSFnYfV4jVOKbZ2IDqt3");
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
