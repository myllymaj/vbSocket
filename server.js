//chatgpt
//chatgpt
//chatgpt


const WebSocket = require('ws')
const jwt = require('jsonwebtoken');
require('dotenv').config()

const PORT = process.env.PORT || 5000
const wss = new WebSocket.Server({ port: PORT })


const boards = {};


wss.on('connection', (ws, req) => {
    



   
    const urlParams = new URLSearchParams(req.url.slice(1));
    const token = urlParams.get('token');
    const boardId = urlParams.get('board_id');

    
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Invalid token:', err);
            ws.send(JSON.stringify({
                type: 'error',
                msg: 'ERROR: Invalid token.'
            }));
            ws.close();
        } else {
            
            console.log('Valid token for user:', decoded.username);

            if (!boards[boardId]) {
                boards[boardId] = new Set();
            }
   
            boards[boardId].add(ws);

            console.log('Client connected:',
                'client count:', boards[boardId].size);


                ws.on('message', (rawMessage) => {

                    ws.lastMessage = new Date()
                
                   
                    const message = JSON.parse(rawMessage.toString())
            
       
                    message.clientId = req.headers['sec-websocket-key']
            
                    //console.log('Received message:', message)
               

                    switch (message.type) {
                        case 'paste':
                          
                            boards[boardId].forEach(client => {
                         
                                if (client === ws) return
    
                                client.send(JSON.stringify({
                                    type: 'paste',
                                    left: message.left,
                                    top: message.top,
                                    backgroundColor: message.backgroundColor,
                                    text: message.text,
                                    id: message.id,
                                    boardId: message.boardId,
                                }));
                            });
                            break;
    
                        case 'deleteNote':
                     
                            const noteIdToDelete = message.id;
    
                        
                            boards[boardId].forEach(client => {
                           
                                if (client === ws) return
    
                                client.send(JSON.stringify({
                                    type: 'deleteNote',
                                    id: noteIdToDelete,
                                    boardId: boardId,
                                }));
                            });
                            break;
    
                            case 'createNote':
                    
                                boards[boardId].forEach(client => {
                                    if (client === ws) return;
                        
                                    client.send(JSON.stringify({
                                        type: 'createNote',
                                        left: message.left,
                                        top: message.top,
                                        backgroundColor: message.backgroundColor,
                                        text: message.text,
                                        id: message.id,
                                        boardId: message.boardId,
                                    }));
                                });
                                break;
                        
                            default:
                                break;
                        }
                });
            

            ws.on('close', () => {
                console.log('Client disconnected');
                boards[boardId].delete(ws);
            });
        }
    });
    
});
