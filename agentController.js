//@Agent controller
// Globals
if (!LS.Globals)
  LS.Globals = {};
  
  


this.onStart = function(){

  LS.Globals.ws = {};
  LS.Globals.ws.send = function(e){console.log("WS should send ", e)};
}


this.onUpdate = function(dt)
{
  //node.scene.refresh();
}


LS.Globals.changeVolume = function(vol){
  if (thatFacial)
    if (thatFacial._audio)
      thatFacial._audio.volume = vol;
}

// Process message
LS.Globals.processMsg = function(msg){
  
  msg = JSON.parse(msg);
  console.log("Processing message: ", msg);
  
  
  // Id
  if (msg.clientId !== undefined && !LS.Globals.ws.id){
    LS.Globals.ws.id = msg.clientId;
    
    console.log("Client ID: ", msg.clientId);
    LS.infoText = "Client ID: " + msg.clientId;
  }
  
  
  // Text
  if (msg.text)
    LS.Globals.transcript = msg.text;
  
  
  // Blink
  if (msg.blink)
    if (LS.Globals.blink)
      LS.Globals.blink(msg.blink, msg.id);
  
  
  
  // Gaze
  if (msg.gaze)
    LS.Globals.gaze(msg.gaze, msg.id);
  
  if (msg.gazeShift)
    LS.Globals.gazeShift(msg.gazeShift, msg.id);
  

  // Head
  if (msg.head)
    LS.Globals.head(msg.head, msg.id);
  
  if (msg.headDirectionShift)
    LS.Globals.headDirectionShift(msg.headDirectionShift, msg.id);
  
  
  // Facial expression
  if (msg.face){
    // Apply Whissel Wheel
    LS.Globals.face(msg.face, msg.id);
  }
  if (msg.faceShift){
    // Apply Whissel Wheel
    LS.Globals.faceShift(msg.faceShift, msg.id);
  }
  
  
  
  // Lipsync
  if (msg.audioURL){
    LS.Globals.lipsync(msg);
  }
  
  
  
  // Gestures
  if (msg.animation){
    
  }
  
}






/*
// How to send POST messages through webglstudio.org:8080
var msg = {
    "type": "idle",
    "uuid": 100,
    "meta": {
        "user": "Anna",
        "avatar": "KRISTINA",
        "scenario": "babycare",
        "language": "pl"
    },
    "data": {
        "blink": true,
          "blinkDuration":0.5
    }
}


req = new XMLHttpRequest();
req.open('POST', 'https://webglstudio.org:8080/idle', true);
req.setRequestHeader("Content-type", "application/json;charset=UTF-8");
req.send(JSON.stringify(msg));

req.onreadystatechange = function () { //Call a function when the state changes.
    if (req.readyState == 4 && req.status == 200) {
        console.log(req.responseText);
    }
}




*/