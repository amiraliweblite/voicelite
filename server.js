'use strict'

const express = require('express')
const SocketServer = require('ws').Server
const path = require('path')
const R = require('ramda')

var users = {}

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
           users = R.assocPath([data.wisId, data.name], connection, users)
           // users[data.wisId][data.name] = connection
           connection.name = data.name

           sendTo(connection, {
             type: 'login',
             success: true
           })

           // send current users to user
           sendTo(connection, {
             type: 'newUser',
             name: Object.keys(users[data.wisId]).filter(function (name) {
               if (name === data.name) return false
               return true
             })
           })

           // send data name to others
           Object.keys(users[data.wisId]).forEach(function (name) {
             if (name !== data.name && R.path([data.wisId, name], users)) {
               sendTo(users[data.wisId][name], {
                 type: 'newUser',
                 name: [data.name]
               })
             }
           })

           break
         }

         case 'offer': {
           const conn = R.path([data.wisId, data.name])(users)
           // users[data.wisId][data.name]

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
           const conn = R.path([data.wisId, data.name])(users)
           // users[data.wisId][data.name]

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
           const conn = R.path([data.wisId, data.name])(users)
           // users[data.wisId][data.name]

           if(conn != null) {
              sendTo(conn, {
                 type: 'candidate',
                 candidate: data.candidate
              })
           }

           break
         }

         case 'leave': {
           const conn = R.path([data.wisId, data.name])(users)
           // users[data.wisId][data.name]
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
            if (conn) {
              conn.otherName = null
            }

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


// 'use strict'
//
// const express = require('express')
// const SocketServer = require('ws').Server
// const path = require('path')
//
// const users = {}
//
// const PORT = process.env.PORT || 8080
// const INDEX = path.join(__dirname, 'index.html')
//
// const server = express()
//   .use((req, res) => res.sendFile(INDEX) )
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`))
//
// const wss = new SocketServer({ server })
//
//
// wss.on('connection', function(connection) {
//
//    connection.on('message', function(message) {
//
//       let data
//
//       // accepting only JSON messages
//       try {
//          data = JSON.parse(message)
//       } catch (e) {
//          // invalid JSON
//          data = {}
//       }
//
//       switch (data.type) {
//          case 'login': {
//            users[data.name] = connection
//            connection.name = data.name
//
//            sendTo(connection, {
//              type: 'login',
//              success: true
//            })
//
//            sendTo(connection, {
//              type: 'newUser',
//              name: Object.keys(users).filter(function (name) {
//                if (name === data.name) return false
//                return true
//              })
//            })
//
//            // send data name to others
//            Object.keys(users).forEach(function (name) {
//              if (name !== data.name) {
//                sendTo(users[name], {
//                  type: 'newUser',
//                  name: [data.name]
//                })
//              }
//            })
//
//            break
//          }
//
//          case 'offer': {
//            const conn = users[data.name]
//
//            if(conn != null) {
//               connection.otherName = data.name
//
//               sendTo(conn, {
//                  type: 'offer',
//                  offer: data.offer,
//                  name: connection.name
//               })
//            }
//
//            break
//          }
//
//          case 'answer': {
//            const conn = users[data.name]
//
//            if(conn != null) {
//               connection.otherName = data.name
//               sendTo(conn, {
//                  type: 'answer',
//                  answer: data.answer
//               })
//            }
//
//            break
//          }
//
//          case 'candidate': {
//            const conn = users[data.name]
//
//            if(conn != null) {
//               sendTo(conn, {
//                  type: 'candidate',
//                  candidate: data.candidate
//               })
//            }
//
//            break
//          }
//
//          case 'leave': {
//            const conn = users[data.name]
//            conn.otherName = null
//
//            if(conn != null) {
//               sendTo(conn, {
//                  type: 'leave'
//               })
//            }
//
//            break
//          }
//
//          default:
//             sendTo(connection, {
//                type: 'error',
//                message: 'Command not found: ' + data.type
//             })
//
//             break
//       }
//    })
//
//    // in case of closing browser tab
//    connection.on('close', function() {
//
//       if(connection.name) {
//          delete users[connection.name]
//
//          if(connection.otherName) {
//
//             const conn = users[connection.otherName]
//             conn.otherName = null
//
//             if(conn != null) {
//                sendTo(conn, {
//                   type: 'leave'
//               })
//             }
//          }
//       }
//    })
//
// })
//
// function sendTo(connection, message) {
//    connection.send(JSON.stringify(message))
// }
