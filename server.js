var express = require("express");
var http = require("http");
var browserify = require("browserify-middleware");
var babelify = require("babelify");
var socketIO = require("socket.io");

// lets use es6 client side
browserify.settings({
  transform: [babelify]
});

var app = express();
var server = http.createServer(app)
var io = socketIO(server);

app.use(express.static("public"));
app.get("/client.js", browserify(__dirname + "/js/client.js"));
server.listen(process.env.PORT || 3000);
