const statusText = document.querySelector('#statusText');
const TIMEOUT = 5000; // ms
let lastUpdate;


function handleHeartRateMeasurement(heartRate) {
    lastUpdate = Date.now();
    statusText.textContent = heartRate;
}
setInterval(() => {
  if ((Date.now() - lastUpdate) > TIMEOUT) {
    handleHeartRateMeasurement('-');
    console.error('No updates')
  }
}, 1000)

function connect() {
  const ws = new WebSocket('ws://localhost:3000/producer');
  ws.binaryType = 'blob';

  ws.onopen = function() {
    // subscribe to some channels
    ws.send('hi from OBS');
  };

  ws.onmessage = function(e) {
    if (e.data instanceof Blob) {
      const reader = new FileReader();

      reader.onload = () => {
        const { result } = reader;
        const data = JSON.parse(result.toString());
        handleHeartRateMeasurement(data.value);
      };

      reader.readAsText(e.data);
    } else {
      console.log("Result: " + e.data);
    }
  };

  ws.onclose = function(e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function() {
      connect();
    }, 1000);
  };

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };
}

connect();
