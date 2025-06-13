var net = require('net')
const url = require('url');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs');


const npmPackage = require(path.resolve(__dirname, 'package.json'));
const currentVersion = npmPackage.version;

var log = console

let port = 12345;
let host = '127.0.0.1';

const WEB_SOCKET_PATH = `/audiostreaming`;

var webSockets = [];
var lastWebSocket;
const writeAAC2File = false;



createWebSocket();

var client = new net.Socket();
// client.setEncoding('binary');

function startTcp() {
  client = new net.Socket();

  client.on('error', function(err) {
    console.log("error")
  })
  
  client.on('close', function(err) {
    console.log("error")
  })
  
  client.on('data', function (data) {
      if (lastWebSocket != null) {
        console.log('from server: \n' + data.toString('hex'))
    
          // let buffer = data;
          // console.log(buffer);
          // console.log(`${buffer[14]} , ${buffer[15]}`)
          // let high = ( buffer[14] << 5) & 0x1fe0;
          // let low = ( buffer[15] >> 3) & 0x1f;
          // let length = high | low;
          console.log(`length = ${data.length}`)
    
          // var body = buffer.slice(16,buffer.length )
          // receiveAndSend(body,length)
          lastWebSocket.send(data);
      }
    });
  
  client.connect(port,host,function() {
   
    console.log("connect the server")
  });
  

}


var bufferSize = 0;
var big = new Uint8Array(1024 * 1024);


var i = 0;
const maxCount = 1; 
function receiveAndSend(buffer,length) {
    i++;
    big.set(buffer,bufferSize);
    bufferSize = bufferSize + length;
    if(i >= maxCount) {
        lastWebSocket.send(big);
        // if(writeAAC2File){
        //  fs.appendFileSync("./test.aac",big);
        // }
        i = 0;
        bufferSize = 0        
    }
}

client.on('error',function(data) {
    console.log('error')
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
          else {
            log.debug(`not support  request: ${req.url}`);
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.write("not support action");
            res.end();
          }
      });
    
      httpServer.listen(3000); // use 3000 as the port

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
         webSockets.push(ws);
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