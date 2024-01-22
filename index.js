const express = require('express');
const bodyParser = require('body-parser');
const TeleBot = require('telebot');
const path = require('path');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;
// ... ( Your Telegram Bot Token Must Here)
const botToken = process.env.BOT_TOKEN || 'TELEGRAM_BOT_TOKEN';
const bot = new TeleBot(botToken);
// ... ( Your Telegram Chat ID Must Here)
const authChatID = 'YOUR_CHAT_ID';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.route('/report')
  .get((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'report.html'));
  })
  .post(upload.single('image'), async (req, res) => {
    console.log('Received data:', req.body);

    const { name, email, subject, message } = req.body;
    const image = req.file ? req.file.buffer : null;

    const reportMessage = `Name: ${name} \nEmail: ${email} \nSubject: ${subject} \nMessage: ${message}`;

    const reportss = `API Report Recieved: \n\n${reportMessage}`;

    try {
      // Send the report message to the user's chat
      const formattedResponse = reportMessage.match(/```(\w+)\n([\s\S]+)```/) ?
        reportMessage : "API Report Received:\n```\n" + reportMessage + "\n```";

      if (image) {
        // If an image is present, send it along with the message
        bot.sendPhoto(authChatID, image, { caption: reportss });
      } else {
        // Otherwise, send the text message
        bot.sendMessage(authChatID, formattedResponse, { parseMode: 'Markdown' });
      }

      // Send the same response back to the user
      res.send(reportMessage);
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      res.status(500).send('Failed to submit report. Please try again later.');
    }
  });

bot.start();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Report Sender Running Through: ${botToken}`);
  console.log(`Serving Report To: ${authChatID}`);
});
