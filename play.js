

let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let gainNode;
var time = 0;

function initAudioContext() {
    audioCtx = new AudioContext({ sampleRate: 44100 });
}

function onClick() {
    // socket to it 
    let host = "127.0.0.1"
    let port = 3000
 
    var ws = new WebSocket("ws://localhost:3000/audiostreaming");

    ws.onopen = function() {
       // Web Socket 已连接上，使用 send() 方法发送数据
       ws.send("发送数据");
       console.log("数据发送中...");
    };
     
    ws.onmessage = function (evt) 
    { 
       var message = evt.data;
       console.log(evt);
       console.log("数据已接收... start to play");
       playAudio(message, 50);
    };
     
    ws.onclose = function()
    { 
       // 关闭 websocket
       console.log("连接已关闭..."); 
    };

}


async function playAudio(audioChunk, volume) {
    if (!audioCtx) {
        initAudioContext();
        gainNode = audioCtx.createGain();
        gainNode.gain.value = volume / 100;
    }

    const arrayBuffer = await audioChunk.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start(time);
    time += source.buffer.duration;
}