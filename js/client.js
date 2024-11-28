let userHasInteracted = false;

// Listen for the first interaction (click, keypress, etc.)
document.addEventListener('click', () => {
    userHasInteracted = true;
});
document.addEventListener('keydown', () => {
    userHasInteracted = true;
});
document.addEventListener('touchstart', () => {
    userHasInteracted = true;
});

const socket = io('https://chatsite-xzbs.onrender.com');
const joinedSound = new Audio('/js/sounds/joined.mp3');
const receivedSound = new Audio('/js/sounds/received.mp3');
const sendSound = new Audio('/js/sounds/sendsound.mp3');

// Preload the sounds
joinedSound.load();
receivedSound.load();
sendSound.load();

// When the user joins, send their name to the server
const userName = prompt("Enter your name: ");
socket.emit('new-user-joined', userName);

document.getElementById('welcome-message').innerText = `Welcome, ${userName}`;

// Listen for incoming messages
socket.on('receive-message', (data) => {
    const messageContainer = document.getElementById('message-container');
    const messageDiv = document.createElement('div');

    const senderName = typeof data.name === 'string' ? data.name : 'Unknown'; // Ensure it's a string
    const messageText = typeof data.message === 'string' ? data.message : '';    // Ensure it's a string

    console.log('senderName:', senderName);
    console.log('messageText:', messageText);

    if (senderName === userName) {
        messageDiv.classList.add('message', 'right');
        messageDiv.innerText = messageText; // Show only the message for the sender
    } else {
        messageDiv.classList.add('message', 'left');
        messageDiv.innerText = `${senderName}: ${messageText}`; // Show name + message for others
    }

    messageContainer.append(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    
    // Play sound only after user interaction has happened
    if (userHasInteracted) {
        sendSound.play().catch((error) => {
            console.error('Error playing sound:', error);
        });
    }
});

// Listen for the no-one-joined event
socket.on('no-one-joined', (data) => {
    const messageContainer = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'server-message');
    messageDiv.innerText = data.message;
    messageContainer.append(messageDiv);
});

// Listen for user-joined event (new user joined)
socket.on('user-joined', (data) => {
    const messageContainer = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'server-message');
    messageDiv.innerText = data.message;
    messageContainer.append(messageDiv);

    // Play sound only after user interaction
    if (userHasInteracted) {
        joinedSound.play().catch((error) => {
            console.error('Error playing sound:', error);
        });
    }
});

// Listen for user-left event (user disconnected)
socket.on('user-left', (data) => {
    const messageContainer = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'server-message');
    messageDiv.innerText = data.message;
    messageContainer.append(messageDiv);

    // Play sound only after user interaction
    if (userHasInteracted) {
        receivedSound.play().catch((error) => {
            console.error('Error playing sound:', error);
        });
    }
});

// Send message when form is submitted
const messageForm = document.getElementById('send-container');
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('messageInp');
    const message = messageInput.value;
    if (message.trim()) {
        socket.emit('send-message', { message, name: userName }); // Send the message with name
        messageInput.value = ''; // Clear input field after sending the message
    }
});
