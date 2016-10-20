//@Agent controller
// Globals
if (!LS.Globals)
  LS.Globals = {};
  
  


this.onStart = function(){
  
  LS.Globals.BMLManager = new BMLTimeManager();

  LS.Globals.ws = {};
  LS.Globals.ws.send = function(e){console.log("WS should send ", e)};
}


this.onUpdate = function(dt)
{
  LS.Globals.BMLManager.update(LS.Globals.processBML, LS.GlobalScene.time);
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
  
  
  // Client id -> should be characterId?
  if (msg.clientId !== undefined && !LS.Globals.ws.id){
    LS.Globals.ws.id = msg.clientId;
    
    console.log("Client ID: ", msg.clientId);
    LS.infoText = "Client ID: " + msg.clientId;
    
    return;
  }

  LS.Globals.BMLManager.newBlock(msg, LS.GlobalScene.time);
  
  /*
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
  */
}


// Process message
LS.Globals.processBML = function(key, bml){
  
  switch (key){
    case "blink":
      thatFacial.newBlink(bml);
      thatFacial._blinking = true;
      break;
    case "gaze":
      thatFacial.newGaze(bml, false);
      break;
    case "gazeShift":
      thatFacial.newGaze(bml, true);
      break;
    case "head":
      thatFacial.newHeadBML(bml);
      break;
    case "headDirectionShift":
      bml.influence = "HEAD";
      thatFacial.newGaze(bml, true, null, true);
      break;
    case "face":
      thatFacial.newFA(bml, false);
      break;
    case "faceShift":
      thatFacial.newFA(bml, true);
      break;
    case "speech":
      thatFAcial.newSpeech(bml);
      break;
    case "gesture":
      break;
    case "pointing":
      break;
    case "lg":
      thatFacial._visSeq.sequence = bml.sequence;
      thatFacial._audio.src = bml.audioURL; // When audio loads it plays
      console.log("HEEEEEEEEEEEERRRRRRRRRRRRRRRREEEEEEEEEE");
      break;
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
        "blink": {
          "start": 0,
          "end": 0.5
        },
        "composite": "APPEND"
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