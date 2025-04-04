const socket = io();

// Function to handle submitting a TID
const submitTid = (tid) => {
    fetch("/term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tid }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((err) => {
                    throw new Error(err.message || "Failed to submit TID");
                });
            }
            console.log("TID submitted successfully");
        })
        .catch((error) => console.error("Error submitting TID:", error));
};

// TID form submission handler
document.getElementById("tidForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const tid = document.getElementById("tidInput").value.trim();
    if (tid) {
        submitTid(tid);
    } else {
        console.error("TID input is empty");
    }
});

// Log button click handler
// document.getElementById("logBtn").addEventListener("click", () => {
//     const tid = document.getElementById("tidInput").value.trim();
//     if (tid) {
//         submitTid(tid);
//     } else {
//         console.error("TID input is empty");
//     }
// });

// Stop Consumer button click handler
document.getElementById("stopConsumerBtn").addEventListener("click", (event) => {
    event.preventDefault();
    fetch("/stop-consumer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((err) => {
                    throw new Error(err.message || "Failed to stop consumer");
                });
            }
            console.log("Consumer stopped successfully");
        })
        .catch((error) => console.error("Error stopping consumer:", error));
});

// Produce Notification Message
document.getElementById("sendButton").addEventListener("click", function (event) {
    event.preventDefault();

    const tidInput = document.getElementById("tidInput").value.trim();
    const messageInput = document.getElementById("messageInput").value.trim();

    const logMessage = {
        type: "MDM",
        profileId: tidInput,
        command: "pushNotification",
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        properties: {
            type: "yesNoQuestion",
            title: "Notification",
            message: messageInput,
            ttl: 30,
            image: { content: "" },
            ignorable: false
        }
    };
    fetch("/sendMessage", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ tid: tidInput, message: logMessage }),
    })
        .then(response => {
            if (response.ok) {
                console.log("Notification sent successfully");
            } else {
                console.error("Failed to send notification", response.status);
            }
        })
        .catch(error => {
            console.error("Error sending notification:", error);
        });
});


// Function to parse backend message
const parseMessage = (msg) => {
    const { key, message } = msg;
    const { level, source, message: text, properties } = message;
    return { key, level, source, text, image: properties?.screenCapture };
};

// Function to update the message list in the DOM
const updateMessageList = (parsedMsg) => {
    const { key, level, source, text, image } = parsedMsg;

    // Get the message list element
    const messageList = document.getElementById("accordionExample");
    const listItem = document.createElement("div");
    listItem.className = "poruka";

    // Construct the message content
    listItem.innerHTML = `
        <span class="key">Tid: ${key}</span>
        <span class='level'>LvL: ${level}</span>
        <span class="source">Source: ${source}</span>
        <span class="message">${text}</span>
    `;

    // Add image if available
    if (image) {
        const img = document.createElement("img");
        img.src = `data:image/png;base64,${image}`;
        img.alt = "Image";
        img.className = "image";
        listItem.appendChild(img);
    }

    // Add the new message to the top of the list
    messageList.prepend(listItem);
};

// Listen for 'message' events from the server
socket.on("message", (backend_msg) => {
    const parsedMsg = parseMessage(backend_msg);
    updateMessageList(parsedMsg);
    console.log("Received message:", parsedMsg);
});
