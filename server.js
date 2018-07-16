'use strict'

const express = require('express')
const SocketServer = require('ws').Server
const path = require('path')

const users = {}

const PORT = process.env.PORT || 8080
const INDEX = path.join(__dirname, 'index.html')

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const wss = new SocketServer({ server })


wss.on('connection', function(connection) {

   connection.on('message', function(message) {

      let data

      // accepting only JSON messages
      try {
         data = JSON.parse(message)
      } catch (e) {
         // invalid JSON
         data = {}
      }

      switch (data.type) {
         case 'login': {
           users[data.name] = connection
           connection.name = data.name

           sendTo(connection, {
             type: 'login',
             success: true
           })

           // send data name to others
           Object.values(users).forEach(function (conn) {
             console.log(conn)
             console.log(name)
             sendTo(conn, {
               type: 'newUser',
               name: data.name
             })
           })

           break
         }

         case 'offer': {
           const conn = users[data.name]

           if(conn != null) {
              connection.otherName = data.name

              sendTo(conn, {
                 type: 'offer',
                 offer: data.offer,
                 name: connection.name
              })
           }

           break
         }

         case 'answer': {
           const conn = users[data.name]

           if(conn != null) {
              connection.otherName = data.name
              sendTo(conn, {
                 type: 'answer',
                 answer: data.answer
              })
           }

           break
         }

         case 'candidate': {
           const conn = users[data.name]

           if(conn != null) {
              sendTo(conn, {
                 type: 'candidate',
                 candidate: data.candidate
              })
           }

           break
         }

         case 'leave': {
           const conn = users[data.name]
           conn.otherName = null

           if(conn != null) {
              sendTo(conn, {
                 type: 'leave'
              })
           }

           break
         }

         default:
            sendTo(connection, {
               type: 'error',
               message: 'Command not found: ' + data.type
            })

            break
      }
   })

   // in case of closing browser tab
   connection.on('close', function() {

      if(connection.name) {
         delete users[connection.name]

         if(connection.otherName) {

            const conn = users[connection.otherName]
            conn.otherName = null

            if(conn != null) {
               sendTo(conn, {
                  type: 'leave'
              })
            }
         }
      }
   })

})

function sendTo(connection, message) {
   connection.send(JSON.stringify(message))
}
