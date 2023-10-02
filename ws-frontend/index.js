
if (!localStorage.getItem('pastebin_token')) {
    localStorage.setItem('pastebin_token', prompt('Enter token'));
}

WS_TOKEN = localStorage.getItem('pastebin_token') || 'my-secret-token';

// wss = SSL-krypterad
WS_URL = `ws://localhost:5000?token=${WS_TOKEN}` 
// WS_URL = ``ws://localhost:5000?token=${WS_TOKEN}`

console.log(WS_URL)

// Create a WebSocket connection
const socket = new WebSocket(WS_URL);

// Connection established 
socket.onopen = function (event) {
    console.log('Connected to WebSocket server');
};

// Message listener
socket.onmessage = function (event) {
    console.log('Received message:', event.data);
    const data = JSON.parse(event.data);

    if (data.type == 'paste') {
        document.querySelector('#out').innerText = data.text;
        document.querySelector('#err').innerText = '';
    } else if (data.type == 'error') {
        document.querySelector('#err').innerText = data.msg;
    }
    
};

// Connection closed 
socket.onclose = function (event) {
    console.log('Connection closed');
};

document.querySelector('#in').addEventListener('input', (evt) => {
    socket.send(JSON.stringify({
        type: 'paste',
        text: evt.target.value
    }));
});