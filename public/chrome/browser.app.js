const statusText = document.querySelector('#statusText');
let connection = null;

statusText.addEventListener('click', function() {
  statusText.textContent = 'Breathe...';
  connectWebSocket()
    .then(() => heartRateSensor.connect())
    .catch(error => {
      if (error.toString().includes('Bluetooth Device is no longer in range.')) {
        return heartRateSensor.connect({ reset: true})
      }
      console.error(error);
    })
    .then(() => heartRateSensor.startNotificationsHeartRateMeasurement())
    .then(handleHeartRateMeasurement)
    .catch(error => {
      console.error(error);
      statusText.textContent = error;
    })
});

async function handleHeartRateMeasurement(heartRateMeasurement) {
  heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
    const heartRateMeasurement = heartRateSensor.parseHeartRate(event.target.value);
    statusText.innerHTML = heartRateMeasurement.heartRate + ' &#x2764;';
    sendHR(heartRateMeasurement.heartRate)
  });
}

/**
 *
 * @return {Promise<void>}
 */
async function connectWebSocket() {
  return new Promise((resolve => {
    const serverUrl = "ws://" + document.location.hostname + ":3000/consumer";

    connection = new WebSocket(serverUrl);

    connection.onopen = function(evt) {
      resolve();
    };

    connection.onclose = function(e) {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
        connectWebSocket();
      }, 1000);
    };

    connection.onerror = function(err) {
      console.error('Socket encountered error: ', err.message, 'Closing socket');
      connection.close();
    };
  }));
}

function sendHR(value) {
  const msg = {
    value,
    date: Date.now()
  };
  connection.send(JSON.stringify(msg));
}

statusText.dispatchEvent(new Event('click'));
