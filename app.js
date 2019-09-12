var express = require('express')

var app = express()
var isClientConnected = false;
var isAmazonConnected = false;

// Just a littel Status Front End
app.get('/', function (req, res) {
  var statusMQTT = (isClientConnected) ? 'Connesso' : 'Non Connesso';
  var statusAMAZON = (isAmazonConnected) ? 'Connesso' : 'Non Connesso';
  res.send('ViksTech - Amazon Broker Bridge! <br/> MQTT Status: ' + statusMQTT + '<br/> AMAZON Status: ' + statusAMAZON )
})

// Launch listening server on port 8081 (if using with container and traefik, like me)
app.listen(8081, function () {
  console.log('app listening on port 8081!')
})

// Load Std Mosquitto 
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org')

client.on('connect', function () {
  client.subscribe('mytopic', function (err) {
    if (!err) {
      client.publish('mytopic', 'Hello mqtt')
        isClientConnected = true;
        console.log('connesso');
    }
  })
})

client.on('message', function (topic, message) {
  console.log(message.toString())
})
client.on('disconnect', function (topic, message) {
  isClientConnected = false;
})

Load AWS MQTT
var awsIot = require('aws-iot-device-sdk');

//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts
// to connect with a client identifier which is already in use, the existing
// connection will be terminated.
//
var device = awsIot.device({
   keyPath: 'certs/privateKey.pem',
   certPath: 'certs/cert.pem',
   caPath: 'certs/ca.pem',
   clientId: 'YOUR_CLIENT_ID',
   host: 'XXXXXXXXXXXXXXXXXXXXX.amazonaws.com'
});

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
device
  .on('connect', function() {
    console.log('connect');
    isAmazonConnected = true;
    device.subscribe('AMAZON_TOPIC');
    device.publish('AMAZON_TOPIC', JSON.stringify({ test_data: 'ViksTech Bridge connected...'}));
  });

device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
    if (isClientConnected){
        client.publish('presence', payload.toString());
    }
  });
device.on('error',function(a,b){isAmazonConnected = false; console.log(a,b);});


