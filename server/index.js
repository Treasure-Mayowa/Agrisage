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

  var raw = `{\n    \"temperature\": 0.6,\n    \"messages\": [\n      {\n        \"role\": \"system\",\n        \"content\": \"${process.env.CONTENT}\"\n      },\n      {\n        \"role\": \"user\",\n        \"content\": \"Respond to this message${user_message}\"\n      }\n    ],\n    \"model\": \"llama-2-chat-70b-4k\",\n    \"stream\": false,\n    \"max_tokens\": 1000\n  }`

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
  twiml.say({ voice: 'alice' }, "Welcome to Agrisage! Feel free to message this number to begin this journey. I'll be here to guide you towards becoming more sustainable, just message me now")
  res.type('text/xml').send(twiml.toString())
})

app.post('/api/generate', (req, res) => {

  var raw = `{\n    \"temperature\": 0.7,\n    \"messages\": [\n      {\n        \"role\": \"system\",\n        \"content\": \"${process.env.ROLE}\"\n      },\n      {\n        \"role\": \"user\",\n        \"content\": \"${process.env.MESSAGING_CONTENT}\"\n      }\n    ],\n    \"model\": \"llama-2-chat-70b-4k\",\n    \"stream\": false,\n    \"max_tokens\": 1000\n  }`

  var requestOptions = {
    method: 'POST',
    body: JSON.stringify({
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: process.env.ROLE
        },
        {
          role: "user",
          content: process.env.MESSAGING_CONTENT
        }
      ],
      model: "llama-2-chat-70b-4k",
      stream: true,
      max_tokens: 1000
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": process.env.API_KEY
    }
  };

  fetch("https://chat.nbox.ai/api/chat/completions", requestOptions)
    .then(response => response.json())
    .then(result => {
      let message = result.choices[0].message.content
      res.send(JSON.stringify({ "message": message })) 
    })
    .catch(error => { 
      console.log('error', error)
      res.send(JSON.stringify({ "message": "An error occurred while generating a message. Try again"}))
    })
})

app.post('/api/weather-alerts', async (req, res) => {
  try {
    const requestOptions = {
       method: 'GET',
    }
  
      const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${req.body.location}&apiKey=1289b92071ca4745a4f18b3efa33e9fa`, requestOptions)
      const result = await response.json()
  
      console.log(result)

      if (result.features) {
        const lat = result.features[0].properties.lat
        const lon = result.features[0].properties.lon
  
        const alert = await checkAlert(lon, lat)
        console.log(alert)
        res.send(JSON.stringify({ result: alert }))
      } else {
        res.send(JSON.stringify({ result: "Location not found." }))
      }
    } catch (error) {
      console.error('Error in /api/weather-alerts:', error)
      res.send(JSON.stringify({ result: "An error occurred. Try again." }))
    }
})

async function checkAlert (lon, lat) {
  try {
    let response = await fetch(`https://api.weatherbit.io/v2.0/alerts?lat=${lat}&lon=${lon}&key=${process.env.ALERT_API_KEY}`)
    let result = await response.json()
    return result.alerts
  }
  catch (error) {
    console.error(error)
    return "An error occurred"
  } 
}