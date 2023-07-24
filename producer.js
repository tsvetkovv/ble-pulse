const {WebSocketServer} = require("ws");

class Producer {
  /**
   *
   * @param emitter{NodeJS.EventEmitter}
   */
  constructor(emitter) {
    this.ws =  new WebSocketServer({ noServer: true, clientTracking: true });

    this.ws.on('connection', function (ws, request) {
      const boundEventHandler = (value) => ws.send(value);

      ws.on('close', function () {
        emitter.off('value', boundEventHandler);
      });
      emitter.on('value', boundEventHandler)
    });
  }
}


exports.Producer = Producer;
