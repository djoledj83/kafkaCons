const socket = io();

// Submit the TID form
document.getElementById("tidForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const tidInput = document.getElementById("tidInput").value.trim();
    console.log("Submitted TID:", tidInput);

    fetch("/term", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ tid: tidInput }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to submit TID");
            }
            console.log("TID submitted successfully");
        })
        .catch((error) => {
            console.error("Error submitting TID:", error);
        });
});

// Stop Consumer Button
document.getElementById("stopConsumerBtn").addEventListener("click", function (event) {
    event.preventDefault();

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

// Log Button (optional functionality, modify as needed)
document.getElementById("logBtn").addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Log button clicked");
});

// Function to update the message list and update screenshot image
const updateMessageList = (backend_msg) => {
    const screenshotImage = document.querySelector(".screenshotImage img");

    const image = backend_msg.message.properties?.screenCapture;
    if (image) {
        console.log("Base64 image data received:", image);
        screenshotImage.src = `data:image/png;base64,${image}`;
    } else {
        console.log("No screenshot available.");
    }

    // Continue with the rest of the message handling...
    const accordionId = `accordion_${backend_msg.key}_${Date.now()}`;
    const result = backend_msg.message.properties?.result || {};
    const termResponse = result.terminalResponse || '';
    const code = result.code || 'N/A';
    const messageText = result.message || 'No message';
    const accordionClass = termResponse === "000" ? "bg-success" : "bg-danger";

    const newAccordionItem = `
    <div class="accordion-item">
        <h2 class="accordion-header" id="heading_${backend_msg.key}">
            <button class="accordion-button collapsed ${accordionClass} text-white align-content-around" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${accordionId}" aria-expanded="false" aria-controls="collapse_${accordionId}">
                <strong>TID:&nbsp;${backend_msg.key}</strong> | <strong>Timestamp:</strong>&nbsp;${backend_msg.message.timestamp} | <strong>Status:</strong>&nbsp;${code} | <strong>Message:</strong>&nbsp;${messageText} | <strong>Term_Resp:</strong>&nbsp;${termResponse}
            </button>
        </h2>
        <div id="collapse_${accordionId}" class="accordion-collapse collapse w-auto" aria-labelledby="heading_${backend_msg.key}" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <pre>${JSON.stringify(backend_msg, null, 2)}</pre>
            </div>
        </div>
    </div>`;

    // Insert the accordion item into the DOM
    document.querySelector('.accordion').insertAdjacentHTML('afterbegin', newAccordionItem);
};

// Listen for 'message' events from the server
socket.on("message", (backend_msg) => {
    console.log("Received backend message:", backend_msg);
    updateMessageList(backend_msg);
});
