const socket = io();

// Submit the tid form
document.getElementById("tidForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const tidInput = document.getElementById("tidInput");
    const tid = tidInput.value.trim();
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

// Function to update the message list
const updateMessageList = (backend_msg) => {
    const messagesContainer = document.querySelector(".messages");
    const accordionId = `accordion_${backend_msg.key}_${Date.now()}`; // Add timestamp to make IDs unique

    // Determine the color based on term response
    const termResponse = backend_msg.message.properties?.result?.terminalResponse || ''; // Fetch the terminal response value
    const accordionClass = termResponse === "000" ? "bg-success" : "bg-danger"; // Assign the class based on the response


    const newAccordionItem = `
    <div class="accordion-item">
        <h2 class="accordion-header" id="heading_${backend_msg.key}">
            <button class="accordion-button collapsed ${accordionClass} text-white align-content-around" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${accordionId}" aria-expanded="false" aria-controls="collapse_${accordionId}">
                <strong>Tid:&nbsp;${backend_msg.key}</strong> <- || -> <strong>Timestamp:</strong>&nbsp;${backend_msg.message.timestamp} <- || -> <strong>Status:</strong>&nbsp;${backend_msg.message.properties.result.code}<- || -> <strong>Messsage:</strong>&nbsp;${backend_msg.message.properties.result.message}<- || -> <strong>Term_Resp:</strong>&nbsp;${backend_msg.message.properties.result.terminalResponse}
            </button>
        </h2>
        <div id="collapse_${accordionId}" class="accordion-collapse collapse" aria-labelledby="heading_${backend_msg.key}" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <pre>${JSON.stringify(backend_msg, null, 2)}</pre>
            </div>
        </div>
    </div>`;

    // messagesContainer.querySelector('.accordion').insertAdjacentHTML('beforeend', newAccordionItem); Ovo ispisuje gresku na kraju
    messagesContainer.querySelector('.accordion').insertAdjacentHTML('afterbegin', newAccordionItem); // Ovo ispisuje najnovije  poruke na vrh.

    // Check if there is a screenCapture and add image
    if (backend_msg.message.properties && backend_msg.message.properties.screenCapture) {
        const image = backend_msg.message.properties.screenCapture;
        const img = document.createElement("img");
        img.src = `data:image/png;base64,${image}`;
        img.alt = "Screen Capture";
        img.className = "image";
        document.querySelector(".messages").appendChild(img);
    }
};

// Listen for 'message' events from the server
socket.on("message", (backend_msg) => {
    updateMessageList(backend_msg);
    console.log(backend_msg);
});
