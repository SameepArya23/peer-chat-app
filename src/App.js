import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, Paper, Typography, TextField, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/system';
import Peer from 'peerjs';

const ChatContainer = styled(Container)({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const ChatArea = styled(Paper)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const MessageList = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
}));

const MessageInput = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderTop: '1px solid #e0e0e0',
}));

const Header = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid #e0e0e0',
}));

function App() {
  const [peerId, setPeerId] = useState('');
  const [conn, setConn] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const peerInstance = useRef(null);

  useEffect(() => {
    const peer = new Peer('', {
      host: 'localhost',
      port: 9000,
      path: '/myapp',
    });

    peer.on('open', id => {
      setPeerId(id);
    });

    peer.on('connection', connection => {
      setConn(connection);
      connection.on('data', data => {
        setMessages(prevMessages => [...prevMessages, { sender: 'peer', text: data }]);
      });
    });

    peerInstance.current = peer;

    return () => peer.destroy();
  }, []);

  const handleConnect = () => {
    const connection = peerInstance.current.connect(peerId);
    connection.on('open', () => {
      setConn(connection);
    });
    connection.on('data', data => {
      setMessages(prevMessages => [...prevMessages, { sender: 'peer', text: data }]);
    });
  };

  const handleSendMessage = () => {
    if (conn && message) {
      conn.send(message);
      setMessages(prevMessages => [...prevMessages, { sender: 'me', text: message }]);
      setMessage('');
    }
  };

  return (
    <ChatContainer maxWidth="md">
      <Header>
        <Typography variant="h6">PeerJS Chat</Typography>
        <Typography variant="body2">Your ID: {peerInstance.current?.id}</Typography>
        <TextField
          label="Peer ID"
          value={peerId}
          onChange={e => setPeerId(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleConnect}>
          Connect
        </Button>
      </Header>
      <ChatArea>
        <MessageList>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={msg.text}
                  secondary={msg.sender === 'me' ? 'You' : 'Peer'}
                  align={msg.sender === 'me' ? 'right' : 'left'}
                />
              </ListItem>
            ))}
          </List>
        </MessageList>
        <MessageInput>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Write your message"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage}>
            Send
          </Button>
        </MessageInput>
      </ChatArea>
    </ChatContainer>
  );
}

export default App;
