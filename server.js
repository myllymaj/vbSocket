//chatgpt
//chatgpt
//chatgpt


const WebSocket = require('ws')
const jwt = require('jsonwebtoken');
require('dotenv').config()

const PORT = process.env.PORT || 5000
const wss = new WebSocket.Server({ port: PORT })

// Set: datatyp "med bara nycklar", Wikipedia: Unlike most other collection types, rather than retrieving a specific element from a set, one typically tests a value for membership in a set. 
const boards = {};
const messageHistory = {};
// URL example: ws://my-server?token=my-secret-token
wss.on('connection', (ws, req) => {
    



    // Check valid token (set token in .env as WS_TOKEN=my-secret-token )
    const urlParams = new URLSearchParams(req.url.slice(1));
    const token = urlParams.get('token');
    const boardId = urlParams.get('board_id');

    
    // Verify the JWT token here
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Invalid token:', err);
            ws.send(JSON.stringify({
                type: 'error',
                msg: 'ERROR: Invalid token.'
            }));
            ws.close();
        } else {
            // Token is valid, you can access its contents in the 'decoded' variable
            console.log('Valid token for user:', decoded.username);

            if (!boards[boardId]) {
                boards[boardId] = new Set();
            }
   
            boards[boardId].add(ws);

            console.log('Client connected:',
                'client count:', boards[boardId].size);

                if (messageHistory[boardId]) {
                    messageHistory[boardId].forEach(message => {
                        ws.send(JSON.stringify({
                            type: 'paste',
                            text: message.text
                        }));
                    });
                }
                ws.on('message', (rawMessage) => {

                    ws.lastMessage = new Date()
                
                    // Vi konverterar vår råa JSON till ett objekt
                    const message = JSON.parse(rawMessage.toString())
            
                    if (!messageHistory[boardId]) {
                        messageHistory[boardId] = [];
                    }
                    messageHistory[boardId].push(message);
                    message.clientId = req.headers['sec-websocket-key']
            
                    console.log('Received message:', message)
               

                    
                    boards[boardId].forEach(client => {
            
                        // Skicka inte till vår egen klient (ws)
                        if (client === ws) return
            
                        client.send(JSON.stringify({
                            type: 'paste',
                            text: message.text
                        }));
                    })
            
                });
            

            ws.on('close', () => {
                console.log('Client disconnected');
                boards[boardId].delete(ws);
            });
        }
    });
    
});
