const {WebSocketServer} = require("ws");

class Consumer {
  /**
   *
   * @param emitter{NodeJS.EventEmitter}
   */
  constructor(emitter) {
    this.ws =  new WebSocketServer({ noServer: true, clientTracking: true });

    this.ws.on('connection', function (ws, request) {
      const boundEventHandler = (value) => ws.send(value);

      ws.on('message', function (message) {
        emitter.emit('value', message);
      });

      ws.on('close', function () {
        emitter.off('value', boundEventHandler);

        console.log('consumer Closed');
      });

      ws.send('ok');
    });
  }
}


exports.Consumer = Consumer;
