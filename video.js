var net = require('net')
const url = require('url');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs');
var hexy = require("hexy");


const npmPackage = require(path.resolve(__dirname, 'package.json'));
const currentVersion = npmPackage.version;

var log = console

let port = 10001;
let host = '127.0.0.1';

const WEB_SOCKET_PATH = `/video`;

var webSockets = [];
var lastWebSocket;
const writFile = false;



createWebSocket();

var client = new net.Socket()
// client.setEncoding('binary');

function startTcp() {
  // if(client.closed == false){
  //    client.close();
  // }
  client = new net.Socket();

  client.on('error', function(err) {
    console.log("error")
  })
  
  client.on('close', function(err) {
    console.log("error")
  })
  
  client.on('data', function (data) {
      if (lastWebSocket != null) {    
          console.log(`will send data length = ${data.length}`)
          b = Buffer.from(data)
        // console.log('from server: \n' + data.toString('hex'))
          // console.log(hexy.hexy(data))
          // receiveAndSend(data)
          lastWebSocket.send(data);
      }
    });
  
  client.connect(port,host,function() {
   
    console.log("connect the server")
  });
  

}

var bufferSize = 0;
var big = new Uint8Array(1024 * 1024); // 1 MB

var i = 0;
const maxCount = 30; 
function receiveAndSend(buffer) {
    i++;
    big.set(buffer,bufferSize);
    bufferSize = bufferSize + buffer.length;
    if(i >= maxCount) {
        lastWebSocket.send(big);
        console.log(hexy.hexy(big))
       if(writFile){
         fs.appendFileSync("./test.h264",big);
        }
        i = 0;
        bufferSize = 0        
    }
}

client.on('error',function(data) {
    console.log('tcp server got error')
    client.destroy();
})

client.on('close',function() {
    console.log('connection close')
})

function createWebSocket() {
    
        let self = this;
        httpServer = http.createServer(function(req,res) {
          const pathname =  url.parse(req.url).pathname;
          if(pathname === `/json`) {
            (async() => {
              res.writeHead(200, {'Content-Type': 'application/json'});
              let responseString = await self.getWebViewHandlers();
              log.debug(`Call getAllPages: \n ${responseString}`)
              res.write(responseString);
              res.end();
            })();

          } 
          else if(pathname === `/audio`) {
            (async() => {
              fs.readFile('test.html',function (err, data){
                res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
                res.write(data);
                res.end();
             });
              
            })();

          }
          else if(pathname == `/h264.html`) {
            fs.readFile(path.join(__dirname,'video', 'h264.html'), 'utf-8', (err, data) => {
              if (err) {
                res.statusCode = 500;
                res.end('Error reading HTML file');
                return;
              }
        
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html');
              res.end(data);
            }); 
         } 
          else {
            log.debug(`not support  request: ${req.url}`);
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.write("not support action");
            res.end();
          }
      });
    
      httpServer.listen(9000); // use 3000 as the port

        log.debug('create new server');
        const wss = new WebSocket.Server({
          server: httpServer,
          // port: this.serverPort,
          path: WEB_SOCKET_PATH,
          perMessageDeflate: {
            zlibDeflateOptions: {
              // See zlib defaults.
              chunkSize: 1024,
              memLevel: 7,
              level: 3
            },
            zlibInflateOptions: {
              chunkSize: 10 * 1024
            },
            // Other options settable:
            clientNoContextTakeover: true, // Defaults to negotiated value.
            serverNoContextTakeover: true, // Defaults to negotiated value.
            serverMaxWindowBits: 10, // Defaults to negotiated value.
            // Below options specified as default values.
            concurrencyLimit: 10, // Limits zlib concurrency for perf.
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed.
          }
        });


        wss.on('connection', function connection(ws) {
        lastWebSocket = ws
        webSockets.push(ws)
        startTcp()
          
        ws.on('message', function incoming(message) {
          log.debug('websocket received message: and we need forward it to socket');
          ws.send(message)
        });

        // TBD we need remove the closed webSocket
        ws.on('close',function close(){
          log.debug('webSocket disconnected');
          sockets.pop(ws)
        });
          
          log.debug(`Welcome to UFTM audiostreaming test tool: ${currentVersion}`);
        });
     
}