//@Agent controller
// Globals
if (!LS.Globals)
  LS.Globals = {};
  



this.onStart = function(){
  
  if (window.BMLPlanner !== undefined)
    LS.Globals.BMLPlanner = new BMLPlanner();
  else
    console.error("BML Planner not included");
  
  if (window.BMLTimeManager !== undefined)
    LS.Globals.BMLManager = new BMLTimeManager();
  else
    console.error("BML Manager not included");

  LS.Globals.ws = {};
  LS.Globals.ws.send = function(e){console.log("WS should send ", e)};
   
}


this.onUpdate = function(dt)
{
  var newBlock = null;
  if (LS.Globals.BMLPlanner)
    newBlock = LS.Globals.BMLPlanner.update(dt);
  
  if (LS.Globals.BMLManager)
    LS.Globals.BMLManager.update(LS.Globals.processBML, LS.GlobalScene.time);
  
  if (newBlock !== null){
    //console.log(newBlock);
    LS.Globals.BMLManager.newBlock(newBlock, LS.GlobalScene.time);
  }
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
  
  
  // Client id -> should be characterId?
  if (msg.clientId !== undefined && !LS.Globals.ws.id){
    LS.Globals.ws.id = msg.clientId;
    
    console.log("Client ID: ", msg.clientId);
    LS.infoText = "Client ID: " + msg.clientId;
    
    return;
  }

  // Process block
  // Create new bml if necessary

  if (LS.Globals.BMLPlanner)
    LS.Globals.BMLPlanner.newBlock(msg);
  // Update to remove aborted blocks
  if (!LS.Globals.BMLManager)
    return;
  LS.Globals.BMLManager.update(LS.Globals.processBML, LS.GlobalScene.time);
 
  // Add new block to stack
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
      thatFacial._blinking = true;
      thatFacial.newBlink(bml);
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