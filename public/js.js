const socket = io();

document
    .getElementById("tidForm")
    .addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const tidInput = document.getElementById("tidInput");
        const tid = tidInput.value.trim(); // Get the tid value from the input field
        // const topicInput = document.getElementById("topic");
        // const topic = topicInput.value.trim(); // Get the topic value from the input field
        console.log(tid);
        // console.log(topic);

        // Send the tid to the server using a POST request
        fetch("/term", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tid }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to submit tid");
                }
                console.log("Tid submitted successfully");
            })
            .catch((error) => {
                console.error("Error submitting tid:", error);
            });
    });

// Stop Consumer button click event
document
    .getElementById("stopConsumerBtn")
    .addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default button click behavior

        // Send a request to the server to stop the Kafka consumer
        fetch("/stop-consumer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to stop consumer");
                }
                console.log("Consumer stopped successfully");
            })
            .catch((error) => {
                console.error("Error stopping consumer:", error);
            });
    });
document
    .getElementById("logBtn")
    .addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const tidInput = document.getElementById("tidInput");
        const tid = tidInput.value.trim(); // Get the tid value from the input field
        console.log(tid);

        fetch("/term", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tid }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to submit tid");
                }
                console.log("Tid submitted successfully");
            })
            .catch((error) => {
                console.error("Error submitting tid:", error);
            });
    });

// Function to update the message list in the DOM
const updateMessageList = (backend_msg) => {
    const messageList = document.getElementById("accordionExample");
    const listItem = document.createElement("div");


    // Construct message content
    const messageContent = `
    <span class="key">Tid: ${backend_msg.key}</span>
    <span class='level message bold'>LvL: ${backend_msg.message.level}</span>
        <span class="bold source">Source: ${backend_msg.message.source}</span>
        <pre class="message">${JSON.stringify(backend_msg, null, 2)}</pre>
        `;
    // <span class="message">${backend_msg.message.message}</span>
    // <span class="message">${JSON.stringify(backend_msg, ',', '<br>')}</span>
    // <span class="message">${JSON.stringify(backend_msg.message)}</span>
    // <span class="bold source">Timestamp: ${JSON.stringify(backend_msg.message.timestamp)}</span>
    // <span class="message">${JSON.stringify(backend_msg.message.message)}</span>
    // <span class="message">${JSON.stringify(backend_msg)}</span>

    // Add message content to list item
    listItem.innerHTML += messageContent;
    // Check if screenCapture is available
    if (backend_msg.message.properties && backend_msg.message.properties.screenCapture) {
        let image = backend_msg.message.properties.screenCapture;
        const img = document.createElement("img");
        img.src = `data:image/png;base64,${image}`;
        img.alt = "Image";
        img.className = "image";
        listItem.appendChild(img);
    }

    // Add list item to message list
    if (messageList.firstChild) {
        messageList.insertBefore(listItem, messageList.firstChild);
    } else {
        messageList.appendChild(listItem);
    }
};


// Listen for 'message' events from the server
socket.on("message", (backend_msg) => {
    updateMessageList(backend_msg); // Update the message list
    console.log(backend_msg);
});