const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('bodyParser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth({
        dataPath: 'data'
    })
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();

// Listening to all incoming messages
client.on('message_create', message => {
	console.log(message.body);
});

client.on('message_create', message => {
	if (message.body === '!ping') {
		// send back "pong" to the chat the message was sent in
		client.sendMessage(message.from, 'pong');
	}
});

app.post('/send-message', async(req, res) => {
    const { groupChatId, message } = req.body;
    try{
        const chat = await client.getChatById(groupChatId);
        await chat.sendMessage(message);
        res.status(200).send({ success: true, message: 'Message sent!' });
    } catch(error){
        console.error('Error sending message:', error);
        res.status(500).send({ success: false, error: error.message});
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});