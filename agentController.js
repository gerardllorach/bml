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
  if (LS.Globals.ws)
    LS.Globals.BMLManager.update(LS.Globals.processBML, LS.GlobalScene.time, LS.Globals.ws.send);
  else
    LS.Globals.BMLManager.update(LS.Globals.processBML, LS.GlobalScene.time);
  //node.scene.refresh();
}


LS.Globals.changeVolume = function(vol){
  var thatFacial = LS.Globals.Facial;
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
    
    console.log("Character ID: ", msg.clientId);
    LS.infoText = "Character ID: " + msg.clientId;
    
    return;
  }
  
  //console.log(JSON.stringify(msg));
  
  LS.Globals.BMLManager.newBlock(msg, LS.GlobalScene.time);
  
}



// Process message
LS.Globals.processBML = function(key, bml){
  //console.log("PROCESS BML\n", key, JSON.stringify(bml));
  if(!LS.Globals.Facial)
    return;
  
  var thatFacial = LS.Globals.Facial;
  
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
      thatFacial.newSpeech(bml);
      break;
    case "gesture":
      break;
    case "pointing":
      break;
    case "lg":
      thatFacial._visSeq.sequence = bml.sequence;
      thatFacial._audio.src = bml.audioURL; // When audio loads it plays
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
        "composition": "APPEND"
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