const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

let clientReady = false; // Variable to track if the client is ready

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth({
        dataPath: 'data'
    })
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');
    clientReady = true; // Set to true when client is ready

    try {
        // Fetch all chats
        const chats = await client.getChats();
        
        // Log each chat's ID and name
        chats.forEach(chat => {
            console.log(`Chat ID: ${chat.id._serialized}, Name: ${chat.name || 'No Name'}`);
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
    }
});

client.on('disconnected', () => {
    console.log('Client has disconnected!');
    clientReady = false; // Set to false when the client disconnects
});

// Listening to all incoming messages
client.on('message_create', message => {
    console.log(message.body);
});

client.on('message_create', message => {
    if (message.body === '!ping') {
        // Send back "pong" to the chat the message was sent in
        client.sendMessage(message.from, 'pong');
    }
});

app.post('/send-message', async (req, res) => {
    const { groupChatId, message } = req.body;

    if (!clientReady) {
        return res.status(500).send({ success: false, error: 'Client is not ready yet. Try again later.' });
    }

    try {
        const chat = await client.getChatById(groupChatId);
        if (!chat) {
            throw new Error('Chat not found');
        }
        await chat.sendMessage(message);
        res.status(200).send({ success: true, message: 'Message sent!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
