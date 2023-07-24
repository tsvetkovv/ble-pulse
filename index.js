const express = require('express');
const http = require('http');
const {Producer} = require("./producer");
const {Consumer} = require("./consumer");
const app = express();
const EventEmitter = require('events');
const open = require('open');

app.use(express.static(__dirname + '/public'));

const server = http.createServer(app);

const myEmitter = new EventEmitter();
const producer = new Producer(myEmitter);
const consumer = new Consumer(myEmitter);

// HTTP Server ==> WebSocket upgrade handling:
server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = request.url

  if (pathname === '/consumer') {
    consumer.ws.handleUpgrade(request, socket, head, function done(ws) {
      consumer.ws.emit('connection', ws, request);
    });
  } else if (pathname === '/producer') {
    producer.ws.handleUpgrade(request, socket, head, function done(ws) {
      producer.ws.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(3000, function () {
  open('http://localhost:3000/chrome');
  console.log('Listening on http://localhost:3000');
});
