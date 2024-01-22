const express = require('express');
const bodyParser = require('body-parser');
const TeleBot = require('telebot');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Replace 'YOUR_BOT_TOKEN' with your Telegram bot token
const botToken = process.env.BOT_TOKEN || '6589095056:AAHIrMnVqYk6MOSLoaQTy3z4DK0OTT6k1Ok'; // Use environment variable
const bot = new TeleBot(botToken);

// Replace 'USER_CHAT_ID' with the actual chat ID of the user you want to send messages to
const userChatId = '5947023314';

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Handle both GET and POST requests for the '/report' endpoint
app.route('/report')
    .get((req, res) => {
        // Serve the report.html file
        res.sendFile(path.join(__dirname, 'public', 'report.html'));
    })
    .post(async (req, res) => {
      console.log('Received data:', req.body);

      const { name, email, subject, message } = req.body;

        // Construct the report message
        const reportMessage = `Name: ${name} \nEmail: ${email} \nSubject: ${subject} \nMessage: ${message}`;

        try {
            // Send the report message to the user's chat
          const formattedResponse = reportMessage.match(/```(\w+)\n([\s\S]+)```/) ?
              reportMessage : "API Report Recieved:\n```\n" + reportMessage + "\n```";

          bot.sendMessage(userChatId, formattedResponse, { parseMode: 'Markdown' });

            // Send the same response back to the user
            res.send(reportMessage);
        } catch (error) {
            console.error('Error sending Telegram message:', error);
            res.status(500).send('Failed to submit report. Please try again later.');
        }
    });

// Start the bot
bot.start();

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Telegram Bot is using token: ${botToken}`);
    console.log(`Telegram Bot is configured to send messages to chat ID: ${userChatId}`);
});
