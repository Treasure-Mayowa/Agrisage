const express = require('express')
const path = require('path')
const app = express()
require("dotenv").config()
const fetch = require('node-fetch')
const bodyParser = require('body-parser')
const { twiml } = require('twilio')
const pino = require('express-pino-logger')()
const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)
const { MessagingResponse, VoiceResponse } = require('twilio').twiml

const port = 3001

app.listen(port, () => {
    console.log(`server started on port ${port}`)
})

app.use(express.static(path.join(__dirname, '..', 'build')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(pino)

app.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

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
  var twiml = new MessagingResponse()

  var user_message = req.body.Body

  var raw = `{\n    \"temperature\": 0.6,\n    \"messages\": [\n      {\n        \"role\": \"system\",\n        \"content\": \"You are a bot designed to educate farmers on sustainable agriculture\"\n      },\n      {\n        \"role\": \"user\",\n        \"content\": \"${user_message}\"\n      }\n    ],\n    \"model\": \"llama-2-chat-70b-4k\",\n    \"stream\": false,\n    \"max_tokens\": 1000\n  }`

  var requestOptions = {
    method: 'POST',
    body: raw,
    headers: {
      "Content-Type": "application/json",
      "Authorization": process.env.API_KEY
    },
    redirect: 'follow'
  };

  fetch("https://chat.nbox.ai/api/chat/completions", requestOptions)
    .then(response => response.json())
    .then(result => {
      let message = result.choices[0].message.content
      twiml.message(message)
      res.type('text/xml').send(twiml.toString())    
    })
    .catch(error => console.log('error', error))  
})

app.post('/api/call', (req, res) => {
  var twiml = new VoiceResponse()
  twiml.say({ voice: 'alice' }, "Welcome to Farmer's SMS! Feel free to message this number to begin this journey. I'll be here to guide you towards becoming more sustainable, just message me now")
  res.type('text/xml').send(twiml.toString())
})