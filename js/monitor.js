var socket;
var previous_throttle = 0;

$(function () {
  initChart();
  start_socket_io();
});

var t = 0;
var dps = [], dps2 = [], dps3 = [];
var chart;

const dataLength = 100; // number of dataPoints visible at any point

function initChart() {

  chart = new CanvasJS.Chart("chartContainer",{
    title :{
      text: "Live Random Data"
    },	    
    data: [{
      type: "line",
      legendText: "Yaw",
      showInLegend: true,
      dataPoints: dps
    }, {
      type: "line",
      legendText: "Pitch",
      showInLegend: true,
      dataPoints: dps2
    }, {
      type: "line",
      legendText: "Roll",
      showInLegend: true,
      dataPoints: dps3
    }]
  });

  for (var j = 0; j < dataLength; j++) {
    dps.push({x: t, y: 0});
    dps2.push({x: t, y: 0});
    dps3.push({x: t, y: 0});
    t++;
  }

  chart.render();	
}

function start_socket_io() {
  socket = io();

  window.lasttime = new Date();
  socket.on('message', function () {
    var args = Array.prototype.slice.call(arguments);
    var N = args.length;
    var timestamp = args[0];
    //console.log("[Received]", args.slice(1, N), "{timestamp: " + timestamp + "}");

    var msgs = JSON.parse(args.slice(1, N));
    draw(msgs, timestamp);
  });
}

function draw(data, timestamp) {
  if (!lasttime)
    lasttime = timestamp;

  if (timestamp - lasttime > 20) {
    dps.push({ x: t, y: data.yaw });
    dps2.push({ x: t, y: data.pitch });
    dps3.push({ x: t, y: data.roll });

    t++;

    if (dps.length > dataLength) dps.shift();
    if (dps2.length > dataLength) dps2.shift();
    if (dps3.length > dataLength) dps3.shift();

    chart.render();

    lasttime = timestamp;
  }
}

function send() {
  var msgs = Array.prototype.slice.call(arguments);
  if (msgs.length == 0)
    return;

  var timestamp = new Date().getTime();

  msgs.unshift(timestamp);
  msgs.unshift('message');

  socket.emit.apply(socket, msgs);
}
