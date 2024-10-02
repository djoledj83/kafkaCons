const express = require('express');
const http = require('http');
const { Kafka } = require('kafkajs');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Parse JSON bodies
app.use(bodyParser.json());

// Array to store messages
let messages = [];

// Kafka configuration
const kafka = new Kafka({
    brokers: [
        process.env.BROKER_1, process.env.BROKER_2, process.env.BROKER_3,
        process.env.BROKER_4, process.env.BROKER_5, process.env.BROKER_6,
        process.env.BROKER_7, process.env.BROKER_8
    ]
});

// Kafka consumer setup
const consumer = kafka.consumer({ groupId: process.env.GROUP_ID });
// Kafka producer setup
const producer = kafka.producer();

let tid; // Global tid variable

// Function to start the Kafka consumer
const startConsumer = async (topics) => {
    try {
        await consumer.connect();
        for (const topic of topics) {
            await consumer.subscribe({ topic });
        }

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                if (message && message.key && message.value) {
                    const key = message.key.toString();
                    const value = JSON.parse(message.value);

                    if (key === tid) {
                        // Add the message to the array
                        messages.push({
                            key: key,
                            message: value.message,
                        });

                        console.log('Received tid:', tid);
                        console.log('Received topic:', topic);

                        // Emit the message to all connected clients
                        io.emit('message', { key, message: value });
                    }
                }
            },
        });
    } catch (error) {
        console.error('Error running Kafka consumer:', error);
    }
};

// Function to stop the Kafka consumer
const stopConsumer = async () => {
    try {
        await consumer.disconnect();
        console.log('Consumer stopped successfully.');
    } catch (error) {
        console.error('Error stopping consumer:', error);
    }
};

// Function to send a Kafka message (producer)
const sendKafkaMessage = async (topic, message) => {
    try {
        await producer.connect();
        await producer.send({
            topic: topic,
            acks: -1, // acks=all
            messages: [{ value: JSON.stringify(message) }],
        });
        console.log(`Message sent successfully to ${topic}`);
    } catch (error) {
        console.error('Error sending message:', error);
    } finally {
        await producer.disconnect();
    }
};

// Handle the POST request to store the tid and start consumer
app.post('/term', (req, res) => {
    tid = req.body.tid;
    const topics = ['event-transaction', 'event-log', 'mdm-response', 'event-system'];
    startConsumer(topics);
    res.sendStatus(200);
});

// Handle message sending with Kafka producer
app.post('/sendMessage', (req, res) => {
    const message = req.body.message;
    sendKafkaMessage('mdm-request', message);
    res.sendStatus(200);
});

// Handle screenshot requests
app.post('/doScreenShot', (req, res) => {
    const message = req.body.message;
    sendKafkaMessage('mdm-request', message);
    res.sendStatus(200);
});

// Stop Kafka consumer and handle consumer stopping
app.post('/stop-consumer', async (req, res) => {
    try {
        await stopConsumer();
        res.redirect('/');
    } catch (error) {
        console.error('Error stopping consumer:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Render the index page with messages
app.get('/', (req, res) => {
    res.render('index', { messages });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
