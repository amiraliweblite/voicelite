// const WebSocketServer = require('ws').Server
//
// const wss = new WebSocketServer({ port: 8080 })
//
// const users = {}
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

var express = require("express")
 var app = express()

 /* serves main page */
 app.get("/", function(req, res) {
    res.sendfile('index.htm')
 })

  app.post("/user/add", function(req, res) {
	/* some server side logic */
	res.send("OK")
  })

 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){
     console.log('static file request : ' + req.params)
     res.sendfile( __dirname + req.params[0])
 })

 var port = process.env.PORT || 8080
 app.listen(port, function() {
   console.log("Listening on " + port)
 })
