const express = require('express')
const app = express()
require("dotenv").config()
const bodyParser = require('body-parser')
const pino = require('express-pino-logger')()
const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)
const { MessagingResponse } = require('twilio').twiml;

const port = 3001

app.listen(port, () => {
    console.log(`server started on port ${port}`);
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(pino)

app.post('/api/messages', (req, res) => {
    console.log('Received data:', req.body)

    res.header('Content-Type', 'application/json')
    client.messages
      .create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.PHONE_NUMBER,
        body: req.body.message
      })
      .then(() => {
        res.send(JSON.stringify({ success: true }))
      })
      .catch(err => {
        console.log(err);
        res.send(JSON.stringify({ success: false }))
      })
    client.calls
      .create({
         twiml: `<Response><Say>${req.body.message}</Say></Response>`,
         to: process.env.PHONE_NUMBER,
         from: process.env.TWILIO_PHONE_NUMBER
       })
      .then(call => console.log(call.sid))
  });
  
app.post('/api/sms', (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message('Sustainble agriculture is the new cool!');

  res.type('text/xml').send(twiml.toString())    

})

app.get('/api/greeting', (req, res) => {
    const name = req.query.name || 'World';
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
  });