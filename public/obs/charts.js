const canvas = document.querySelector('canvas');
const statusText = document.querySelector('#statusText');



function handleHeartRateMeasurement(heartRate) {
    statusText.innerHTML = heartRate + ' &#x2764;';
    heartRates.push(heartRate);
    drawWaves();
}

let heartRates = [];
let mode = 'bar';

canvas.addEventListener('click', event => {
  mode = mode === 'bar' ? 'line' : 'bar';
  drawWaves();
});

function drawWaves() {
  requestAnimationFrame(() => {
    canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
    canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;

    const context = canvas.getContext('2d');
    const margin = 2;
    const max = Math.max(0, Math.round(canvas.width / 11));
    const offset = Math.max(0, heartRates.length - max);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#00796B';
    if (mode === 'bar') {
      for (let i = 0; i < Math.max(heartRates.length, max); i++) {
        const barHeight = Math.round(heartRates[i + offset] * canvas.height / 200);
        context.rect(11 * i + margin, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }
    } else if (mode === 'line') {
      context.beginPath();
      context.lineWidth = 6;
      context.lineJoin = 'round';
      context.shadowBlur = '1';
      context.shadowColor = '#333';
      context.shadowOffsetY = '1';
      for (let i = 0; i < Math.max(heartRates.length, max); i++) {
        const lineHeight = Math.round(heartRates[i + offset] * canvas.height / 200);
        if (i === 0) {
          context.moveTo(11 * i, canvas.height - lineHeight);
        } else {
          context.lineTo(11 * i, canvas.height - lineHeight);
        }
        context.stroke();
      }
    }
  });
}

window.onresize = drawWaves;

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
        console.log("Result: " + reader.result);
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

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    drawWaves();
  }
});
