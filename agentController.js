//@Agent controller
// Globals
if (!LS.Globals)
  LS.Globals = {};
  



this.onStart = function(){
  
  if (window.BMLPlanner !== undefined)
  	LS.Globals.BMLPlanner = new BMLPlanner();
  else
    console.log("BML Planner not included");
  if (window.BMLTimeManager !== undefined)
  	LS.Globals.BMLManager = new BMLTimeManager();
  else
    console.log("BML Manager not included");

  LS.Globals.ws = {};
  LS.Globals.ws.send = function(e){console.log("WS should send ", e)};
  
  // Resources
  // Pre-load audio files. Contains blocks with lg content
  LS.Globals.pendingResources = [];
   
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
	
  
  // Check pending audio resources to load
  if (LS.Globals.pendingResources.length != 0){  
    var sendPendingLG = true;
    var audioError = false;
    
    for (var i = 0; i<LS.Globals.pendingResources.length; i++){
      sendPendingLG = false;
      audioError = false;
      
      var block = LS.Globals.pendingResources[i];
      var bml = block.lg;
      if (bml.constructor === Array){
        for (var j = 0; j<bml.length; j++){
          // Audio error
          if (bml[j].audio.error != null)
            audioError = true;
          // Audio is not loaded yet
          else if (bml[j].audio.readyState == 4)
            sendPendingLG = true;
        }
      } else {
        // Audio error
        if (bml.audio.error != null)
          audioError = true;
        // Audio is not loaded yet
        else if (bml.audio.readyState == 4)
          sendPendingLG = true;
      }
      
      // Remove blocks with audio errors
      if (audioError){
        // Send post response
        LS.Globals.ws.send(block.id + ": true"); 
        // Remove from pending stack
        LS.Globals.pendingResources.splice(i,1);
        i--;
      }
      // Send block
      else if (sendPendingLG){
        LS.Globals.processMsg(JSON.stringify(block), block.fromWS);
        LS.Globals.pendingResources.splice(i,1);
        i--;
      }
    }
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
// Messages can come from inner processes. "fromWS" indicates if a reply to the server is required in BMLManager.js
LS.Globals.processMsg = function(msg, fromWS){
  
  msg = JSON.parse(msg);
  if (fromWS)
  	msg.fromWS = fromWS;
  console.log("Processing message: ", msg);
  
  // Input msg KRISTINA
  LS.Globals.inputMSG = msg;
  // This is here for the KRISTINA Web GUI
  if (typeof LS.Globals.msgCallback == "function"){
  	LS.Globals.msgCallback(msg);
  }
  
  
  // Client id -> should be characterId?
  if (msg.clientId !== undefined && !LS.Globals.ws.id){
    LS.Globals.ws.id = msg.clientId;
    
    console.log("Client ID: ", msg.clientId);
    LS.infoText = "Client ID: " + msg.clientId;
    
    return;
  }
  
  // Load audio files
  if (msg.lg){
    var hasToLoad = LS.Globals.loadAudio(msg);
    if (hasToLoad){
      LS.Globals.pendingResources.push(msg);
      console.log("Needs to preload audio files.");
      return;
    }
  }
  
  if (!msg){
    console.error("An undefined msg has been received.", msg);
    return;
  }

  // Process block
  // Create new bml if necessary
  if (LS.Globals.BMLPlanner)
  	LS.Globals.BMLPlanner.newBlock(msg);
  
  if (!msg){
    console.error("An undefined block has been created by BMLPlanner.", msg);
  	return;
	}
  
  // Update to remove aborted blocks
  if (!LS.Globals.BMLManager)
    return;
  LS.Globals.BMLManager.update(LS.Globals.processBML, LS.GlobalScene.time);
  
  if (!msg){
    console.error("An undefined block has been created due to the update of BMLManager.", msg);
  	return;
	}
 
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
      // All "lg" go through pending resources and are called when the audio is loaded.
      // If I assign again the audioURL is the audio already loaded?
      break;
  }
}


// Preloads audios to avoid loading time when added to BML stacks
LS.Globals.loadAudio = function(block){
  var output = false;
  if (block.lg.constructor === Array){
    for (var i = 0; i<block.lg.length; i++){
      if (!block.lg[i].audio){
        block.lg[i].audio = new Audio();
        block.lg[i].audio.src = block.lg[i].audioURL;
        output = true;
      }
    }
  }
  else {
    if (!block.lg.audio){
      block.lg.audio = new Audio();
      block.lg.audio.src = block.lg.audioURL;
      output = true;
    }
  }
  
  return output;    
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