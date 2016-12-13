
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

server.listen(port, function () {
 console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/'));

// import chance (http://chancejs.com)
var chance = require('chance').Chance(); // npm install --save chance

var COLORS = [
    '#f3f781', '#f5a9f2', '#81bef7', '#cef6e3',
    '#a9f5a9', '#a9bcf5', '#cecef6', '#d0f5a9',
    '#f78181', '#f7be81', '#e2a9f3', '#e0e0f8',
    '#81f7be', '#81daf5', '#da81f5', '#f4fa58',
    '#eccef5', '#819ff7', '#d8d8d8', '#cecef6'
  ];


  function choice(array) {
    var index = chance.natural({'min': 0, 'max': array.length - 1});  // **** NOTE: 'max': array.length - 1
    return array[index];
  }


// Chatroom

var numUsers = 0;

var loginned = false;

io.on('connection', function (socket) {
 var addedUser = false;

 // when the client emits 'new message', this listens and executes
 socket.on('new message', function (data) {
   // we tell the client to execute 'new message'
   console.log(data);
   socket.broadcast.emit('new message', {
     username: socket.username,
     message: data,
     color: socket.color
   });
 });


 // when the client emits 'add user', this listens and executes
socket.on('add user', function (username) {
  if (addedUser) return;

   // we store the username in the socket session for this client
  socket.username = username;
  socket.color = choice(COLORS);

  ++numUsers;
  addedUser = true;
  socket.emit('login', {
    numUsers: numUsers
  });
   // echo globally (all clients) that a person has connected
  socket.emit('user joined', {
    username: socket.username,
    numUsers: numUsers
  });
});



 // when the user disconnects.. perform this
socket.on('disconnect', function () {
  if (addedUser) {
    --numUsers;

     // echo globally that this client has left
    socket.broadcast.emit('user left', {
       username: socket.username,
       numUsers: numUsers
    });
    }
  });
});