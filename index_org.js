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
    brokers: [process.env.BROKER_1, process.env.BROKER_2, process.env.BROKER_3, process.env.BROKER_4, process.env.BROKER_5, process.env.BROKER_6, process.env.BROKER_7, process.env.BROKER_8] //prod
    // brokers: process.env.BROKER_2
})
// Kafka consumer setup
const consumer = kafka.consumer({ groupId: process.env.GROUP_ID });



// Route to render the index page
let topic;
let tid;

// Function to stop the Kafka consumer
const stopConsumer = async () => {
    try {
        // Disconnect the consumer
        await consumer.disconnect();
        console.log('Consumer stopped successfully.');
    } catch (error) {
        console.error('Error stopping consumer:', error);
    }
};
// Handle the POST request to store the tid
app.post('/term', (req, res) => {
    // Store the tid as needed
    // For example, you can store it in a global variable
    // or save it to a database
    // In this example, I'm storing it in a global variable
    tid = req.body.tid;
    // topic = req.body.topic;
    // const topics = ['event-log', 'mdm-response', 'event-system'];
    const topics = ['event-transaction'];
    // const topics = ['event-system'];
    res.sendStatus(200); // Respond with a success status

    // Function to run the Kafka consumer
    const runConsumer = async () => {
        await consumer.connect();

        for (const topic of topics) {
            // await consumer.subscribe({ topic, fromBeginning: true });
            await consumer.subscribe({ topic });
        }

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    if (!message || !message.key || !message.value) {
                        console.error('Invalid message:', message);
                        return;
                    }
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
                        console.log({
                            key: key,
                            // fwVersion: value.properties.installedFiles,
                            // scModule: value.properties.firmwareModuleVersion,
                            orgMsg: value,
                            // message: value.properties.screenCapture,
                            message: value.message,
                            level: value.level,
                            source: value.source,
                            timestamp: value.timestamp,
                        })


                        // Emit the message to all connected clients
                        io.emit('message', { key, message: value });
                        // io.emit('message', { key, message: value.message, level: value.level, source: value.source, timestamp: value.timestamp });
                        // io.emit('message', { key, message: value.properties.screenCapture, level: value.level, source: value.source, timestamp: value.timestamp });
                        // io.emit('message', { key, message: value, level: value.level, source: value.source, timestamp: value.timestamp });
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            },
        });
    };
    runConsumer().catch(console.error);
});

app.post('/log', (req, res) => {
    // Store the tid as needed
    // For example, you can store it in a global variable
    // or save it to a database
    // In this example, I'm storing it in a global variable
    tid = req.body.tid;
    // topic = req.body.topic;
    const topic = 'event-log';
    // const topics = ['event-system'];
    res.sendStatus(200); // Respond with a success status

    // Function to run the Kafka consumer
    const runConsumer = async () => {
        await consumer.connect();

        // await consumer.subscribe({ topic, fromBeginning: true });
        await consumer.subscribe({ topic });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    if (!message || !message.key || !message.value) {
                        console.error('Invalid message:', message);
                        return;
                    }
                    const key = message.key.toString();
                    const value = JSON.parse(message.value);

                    if (key === tid && value.type === 'log') {
                        // Add log message to the array in the dataStore
                        dataStore.messages.push({
                            key: key,
                            message: value.message,
                        });

                        console.log('Received log message for tid:', tid);

                        // Emit the log messages to all connected clients
                        io.emit('logUpdate', { key, message: value.message });
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            },
        });
    };
    runConsumer().catch(console.error);
});


app.post('/stop-consumer', async (req, res) => {
    try {
        // Stop the Kafka consumer (assuming stopConsumer() is a function that stops the consumer)
        await stopConsumer();
        await consumer.stop();

        console.log("Consumer stopped");

        // Redirect to the home page or any other page as needed
        res.redirect('/');
    } catch (error) {
        console.error("Error stopping consumer and pausing consumption:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/', (req, res) => {
    // Render the 'index' page with the current data
    res.render('index', { messages });
});





// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});