//@BMLPlanner

// Or could be also called Gesture Generation.

// TODO: change automatically to WAITING when SPEAKING finishes.
// TODO: automatic blink, saccades, breathing, head and body movement.


var BMLPlanner = function(){

	this.conversation = "--- New dialogue---\n\n";
  this.state = "WAITING";
  this.stateTime = 0;
  this.nextBlockIn =  1 + Math.random() * 2;
  
  // Default state
  this.defaultValence = 0.4;
  this.currentArousal = 0;
}

BMLPlanner.prototype.update = function(dt){
  this.stateTime += dt;
  
  // Automatic state update
  if (this.nextBlockIn < this.stateTime){
    this.stateTime = 0;
    return this.createBlock();
  }
  
  // Automatic blink and saccades
  return null;//this.updateBlinksAndSaccades();
}

BMLPlanner.prototype.transition = function(block){
  if (block.control == "UNDERSTANDING" || block.control == "PLANNING")
    block.control = "PROCESSING";
  
  var nextState = block.control;
  
  if (nextState == this.state)
    return;
  console.log("PREV STATE:", this.state, "\nNEXT STATE:", block.control);

  // Reset state time
  this.stateTime = 0;
  
  // Transitions
  // Waiting can only come after speaking
  if (nextState == "WAITING"){
    // Look at user for a while, then start gazing around
    this.nextBlockIn = 2 + Math.random() * 3;
  }
  // Can start speaking at any moment
  else if (nextState == "LISTENING"){
    // Force to overwrite existing bml
    block.composition = "OVERWRITE";
    if (this.state == "SPEAKING"){
      // Abort speech
      this.abortSpeech();
    } 
    // Look at user and default face
    this.attentionToUser(block);
    // Back-channelling
    this.nextBlockIn = 1 +  Math.random()*2;

  }
  // Processing always after listening
  else if (nextState == "PROCESSING"){
    this.nextBlockIn = 0;
  }
  // Speaking always after processing
  else if (nextState == "SPEAKING"){
    // Already done in newBlock() if language-generation present
    this.nextBlockIn = 100;
  }
  
  this.state = nextState;
  
}


// Create blocks during a state
BMLPlanner.prototype.createBlock = function(){
  var state = this.state;
  var block = {id: state, composition: "OVERWRITE"};
  
  // LISTENING
  if (state == "LISTENING"){
    this.nextBlockIn = 1.5 + Math.random()*3;
    // head -> link with this.currentArousal
    if (Math.random() * 0.6)
    block.head = {
      start: 0,
      end: 1.5 + Math.random()*2,
      lexeme: "NOD",
      amount: 0.05 + Math.random()*0.1
    }
    // Random blink
    if (Math.random() < 0.8)
      block.blink = {start: 0.3, end: 0.5+Math.random()*0.5};
    
    // Esporadic raising eyebrows
    if (Math.random() < 0.5){
      var start = Math.random();
      var end = start + 1 + Math.random();
      block.face = {
        start: start,
        attackPeak: start + (end-start)*0.2,
        relax: start + (end-start)*0.5,
        end: end,
        lexeme: {lexeme: "RAISE_BROWS", amount: 0.1 + Math.random()*0.2}
      }
    }
    
    // Gaze should already be towards user
    
    return block;
  } 
  // PROCESSING
  else if (state == "PROCESSING"){
  	this.nextBlockIn = 2 + Math.random() * 2;
    // gaze
    var offsetDirections = ["UPRIGHT", "UPLEFT", "LEFT", "RIGHT"]; // Upper and sides
  	var randOffset = offsetDirections[Math.floor(Math.random() * offsetDirections.length)];
    if(Math.random() < 0.8){
      block.gazeShift = {
        start: 0,
        end: 1 + Math.random(),
        influence: "EYES",
        target: "CAMERA",
        offsetDirection: randOffset,
        offsetAngle: 10 + 5*Math.random()
      }
      // blink
      block.blink = {start: 0, end: 0.2 + block.gazeShift.end*Math.random()};
    }
    
    // head nods
    if (Math.random() < 0.3){
      block.head = {
        start: 0,
        end: 1.5 + Math.random()*2,
        lexeme: Math.random() < 0.2 ? "TILT" : "NOD",
        amount: 0.05 + Math.random()*0.1
      }
    }
    
    // frown
    if (Math.random() < 0.6){
      block.face = {
        start: 0,
        end: 1 + Math.random(),
        lexeme: [{lexeme: "LOWER_BROWS", amount: 0.2 + Math.random()*0.5}]
      }
    }
    
    // press lips
    if (Math.random() < 0.3){
      var lexeme = {lexeme: "PRESS_LIPS", amount: 0.1 + 0.3 * Math.random()};
      if(block.face)
        block.face.lexeme.push(lexeme)
      else
        block.face = {
          start: 0,
          end: 1 + Math.random(),
          lexeme: lexeme
      }
    }
    
    return block;
  }
  // WAITING
  else if (state == "WAITING"){
    this.nextBlockIn = 2 + Math.random() * 3;
    // gaze
    var offsetDirections = ["DOWN", "DOWNRIGHT", "DOWNLEFT", "LEFT", "RIGHT"]; // Upper and sides
  	var randOffset = offsetDirections[Math.floor(Math.random() * offsetDirections.length)];
    block.gazeShift = {
      start: 0,
      end: 1 + Math.random()*3,
      target: "CAMERA",
      influence: Math.random()>0.5 ? "HEAD":"EYES",
      offsetDirection: randOffset,
      offsetAngle: 5 + 10*Math.random()
		}
    // Blink
    if(Math.random() < 0.8)
    block.blink = {start: 0, end: 0.2 + Math.random()*0.5};
    
    // Set to neutral face
    block.faceShift = {start: 0, end: 2, valaro: [0,0]};
    
    return block;
  }
}








// New block arrives. It could be speech or control.
BMLPlanner.prototype.newBlock = function(block){
  
  // State
  if (block.control)
    this.transition(block);

	// User input
  if (block.userText)
    this.conversation = "USER: " + block.userText + "\n";

	// If langauge-generation
	if (block.lg){
    block.blink = [];
    block.face = [];
    
		// List of bml instructions
		if (block.lg.constructor === Array)
         for (var i = 0; i <block.lg.length; i++){
           this.processSpeechBlock(block.lg[i], block, (i == block.lg.length-1));
           this.addUtterancePause(block.lg[i]);
         }
    	// No array
    	else
    		this.processSpeechBlock(block.lg, block, true);
	}

	// If non-verbal -> inside mode-selection.nonverbal
	if (block.nonVerbal){
		// Add gesture
	}
}



BMLPlanner.prototype.abortSpeech = function(){
  // Cancel audio and lipsync in Facial
  if (LS.Globals.Facial){
    var facial = LS.Globals.Facial;
    if (!facial._audio.paused){
    	facial._audio.pause(); // Then paused is true and no facial actions
      // Go to neutral face? Here or somewhere else?
    }
  }
  // End all blocks in BMLManager
  if (LS.Globals.BMLManager){
    var manager = LS.Globals.BMLManager;
    for (var i =0 ; i < manager.stack.length; i++){
      manager.stack[i].endGlobalTime = 0;
    }
  }
}


BMLPlanner.prototype.attentionToUser = function(block){
  // If gazeShift already exists, modify
  // TODO

	var end = 0.5 + Math.random();
	var startHead = 0;
  var startGaze = startHead + Math.random()*0.5; // Late start
  
	// gazeShift
	var gazeShift = {
    id: "gazeEnd",
		start: startGaze,
		end: end,
		influence: "EYES",
		target: "CAMERA"
	}
  
	// blink
	var startBlink = -Math.random()*0.2;
	var blink = {
    start: startHead,
		end: end
	}

	// headDirectionShift
	var offsetDirections = ["DOWN", "DOWNLEFT", "DOWNRIGHT"]; // Submissive? Listening?
  var randOffset = offsetDirections[Math.floor(Math.random() * offsetDirections.length)];
	var startDir = -Math.random()*0.3;
	var headDir = {
		start: startHead,
		end: end,
		target: "CAMERA",
    offsetDirection: randOffset,
    offsetAngle: 2 + 5*Math.random()
	}
  
  var faceShift = {
    start: startHead,
    end: end,
    valaro: [this.defaultValence, Math.random*0.2],
  }
  
  // Force and remove existing bml instructions
  block.blink = blink;
  block.faceShift = faceShift;
  block.gazeShift = gazeShift;
  block.headDirectionShift = headDir;
}












// ---------------------------- UTTERANCE MANAGEMENT ----------------------------
// Process language generation message
// Adds new bml instructions according to the dialogue act and speech
BMLPlanner.prototype.processSpeechBlock = function(bmlLG, block, isLast){
  
  // Check if there is content
  if (bmlLG.start === undefined){
    console.error("Wrong language generation format.", JSON.stringify(bmlLG));
  	block.lg = [];
  	return;
  }
  
  
  // Add to dialogue
  this.conversation += "KRISTINA: " + bmlLG.text + "\n";
  
	// Raise eyebrows using longest word
  var faceBrows = undefined;
  if (bmlLG.textTiming)
	 faceBrows = this.createBrowsUp(bmlLG);

	// Valence face end of speech
  if (!bmlLG.valence) bmlLG.valence = this.defaultValence;
	var faceShiftsEnd = this.createEndFace(bmlLG);

	// Head nod at start
	var head = this.createHeadNodStart(bmlLG);

	// Gaze behaviors and blinking
	// Gaze start
	var gazeblinkStart = this.createGazeStart(bmlLG);

	// Gaze end (only for the last speech to give turn)
	var gazeblinkEnd = null;
	if (isLast)
		gazeblinkEnd = this.createGazeEnd(bmlLG); // gaze, blink, headDir
  else{
    gazeblinkEnd = {start: bmlLG.duration}; // blink at the end of every sentence
    this.fixSyncStart(gazeblinkEnd, bmlLG.start);
  }

	// Add to block
  if (faceBrows)
  	block.face.push(faceBrows);
  if (isLast){
    
		block.faceShift = faceShiftsEnd;
    // Arrange ending
    var lastFaceBrow = block.face[block.face.length-1];
    if (lastFaceBrow.end > block.faceShift[0].start)
   		block.face.pop();
  }
	block.head = head;

	if (isLast){
		block.headDirectionShift = gazeblinkEnd[2];
		block.gazeShift = gazeblinkEnd[0];
		block.blink.push(gazeblinkEnd[1]);
  } else
   block.blink.push(gazeblinkEnd);
  

	if (gazeblinkStart[0] != null){
		block.gaze = gazeblinkStart[0];
		block.blink.push(gazeblinkStart[1]);
	}

}






// Use longest word as prosody mark
BMLPlanner.prototype.createBrowsUp = function(bmlLG){
	var numWords = bmlLG.textTiming[0].length;

	// Find prosody marks
	// Use longer words for now (should be speech rate)
	var maxT = 0; var maxInd = 0;
	for (var i = 0; i < numWords; i++){
		var diff = bmlLG.textTiming[2][i] - bmlLG.textTiming[1][i];
		if (diff > maxT){
			maxT = diff;
			maxInd = i;
		}
	}

	// Create eyebrow lexeme
	var lexLongestWord = {
		lexeme: "RAISE_BROWS",
		amount: 0.25 + Math.random()*0.4 // min-max (0.25, 0.65)
	}
	// Create bml face
	var faceLongestWord = {
		id: "longestWord",
		lexeme: lexLongestWord
	}
	// Add sync attrs
	var endOfSentence = bmlLG.duration;//bmlLG.textTiming[2][numWords-1];
	faceLongestWord.start = Math.max(0, bmlLG.textTiming[1][maxInd]-Math.random()*0.4); // Substract <0.4 from start of longest word
	//faceLongestWord.attackPeak = Math.random()*maxT +  bmlLG.textTiming[1][maxInd]; // Add <wordTime to start of word
	//faceLongestWord.relax = Math.max(faceLongestWord.attackPeak, Math.min(endOfSentence-0.2, faceLongestWord.attackPeak + Math.random()*maxT/2)); // Add <wordTime/2 to attackPeak
	faceLongestWord.end = endOfSentence;Math.min(endOfSentence, faceLongestWord.relax + 0.2 + Math.random()*0.5); // Add 0.2 + <0.5 to relax
	// Add offset start
	this.fixSyncStart(faceLongestWord, bmlLG.start);

	return faceLongestWord;
}





// Generate two faceShifts at the end of speech
BMLPlanner.prototype.createEndFace = function(bmlLG){
	var endOfSentence = bmlLG.duration;//bmlLG.textTiming[2][bmlLG.textTiming[2].length-1]; 

	// If no valence
	if (bmlLG.valence === undefined){
		console.log("Error: no valence in langauge-generation (lg)");
		bmlLG.valence = 0.5;
	}
 
	// Generate two faceShifts
  var randomTiming = 0.2 + bmlLG.valence*(0.5 + Math.random());
	var faceValence0 = {
		id: "toFace" + parseInt(Math.random()*1000),
    valaro: [bmlLG.valence, 0],
		start: endOfSentence - 0.5 * Math.random(),
		end: endOfSentence + randomTiming// // If valence is high, should take more time?
	}

	// Add offset start
	this.fixSyncStart(faceValence0, bmlLG.start);

	// Generate two faceShifts
  randomTiming = 3*Math.abs(bmlLG.valence - this.defaultValence)*(0.5 + Math.random());
	var faceValence1 = {
		id: "toNeutral" + parseInt(Math.random()*1000),
    valaro: [this.defaultValence, 0], // TODO - default face is 0.25,0?
    start: faceValence0.id + ":end",
		end: (faceValence0.id + ":end") + "+" + randomTiming // If valence is high, should take more time?
	}

	return [faceValence0, faceValence1];
}



// Create a head nod at the beggining
BMLPlanner.prototype.createHeadNodStart = function(bmlLG){

	var start = 0;
	var ready = Math.random()*0.4 + start + 0.2;
	var stroke = Math.random()*0.4 + ready + 0.2;
	var relax = Math.random()*0.4 + stroke + 0.2;
	var end = Math.random()*0.4 + relax + 0.2;

	var headNod = {
		start: start,
		ready: ready,
		stroke: stroke,
		relax: relax,
		end: end,
		lexeme: "NOD",
		amount: 0.1 - Math.random()*0.08
	}

	// Add offset start
	this.fixSyncStart(headNod, bmlLG.start);

	return headNod;
}


// Create gaze (one at start to look away and back to user)
BMLPlanner.prototype.createGazeStart = function(bmlLG){
	var endOfSentence = bmlLG.duration;//bmlLG.textTiming[2][bmlLG.textTiming[2].length-1]; 

	// Random probability that a start gaze will happen on short-med speeches.
	var gaze0 = null;
	var blink0 = null;
  if (endOfSentence > 3 + Math.random()*4){
		var start = Math.random()*0.2; // One second max to start movement
		var ready = start + 0.5 + Math.random();
		var relax = ready + 0.2 + Math.random()*0.5;
		var end = ready + 0.5 + Math.random();

		var offsetDirections = ["LEFT, RIGHT", "DOWNLEFT", "DOWNRIGHT"]; // TODO: Sure about these directions??
		var randOffset = offsetDirections[Math.floor(Math.random() * offsetDirections.length)];

		gaze0 = {
      id: "gazeStart" + parseInt(Math.random()*1000),
			start: start,
			ready: ready,
			relax: relax,
			end: end,
			influence: "HEAD",
			target: "CAMERA",
			offsetAngle: 5 + Math.random()*15, // TODO: angle magnitude?

			offsetDirection: randOffset
		}
    
    // Add offset start
    this.fixSyncStart(gaze0, bmlLG.start);

    blink0 = { // TODO OPTIONAL: add another blink when coming back
      start: gaze0.start,
      end: gaze0.ready
		}

	}

	return [gaze0, blink0]
}




// Look at the camera at the end
BMLPlanner.prototype.createGazeEnd = function(bmlLG){
	var endOfSentence = bmlLG.duration;//bmlLG.textTiming[2][bmlLG.textTiming[2].length-1]; 

	var end = endOfSentence - Math.random();
	var start = end - Math.random();
  // Fix negative timings
  if (start < 0) start = 0;
  if (end < 0) end = 1 + Math.random()*0.5;
  
	// gazeShift
	var gazeShift = {
    id: "gazeEnd" + parseInt(Math.random()*1000),
		start: start,
		end: end,
		influence: "EYES",
		target: "CAMERA"
	}
  
  // Add offset
  this.fixSyncStart(gazeShift, bmlLG.start);
  
	// blink
	var startBlink = Math.random()*0.2;
	var blink = {
    start: gazeShift.id + ":start" + "+" + startBlink,
		end: gazeShift.id + ":start" + "+" + (startBlink + Math.random()*0.7)
	}

	// headDirectionShift
	var offsetDirections = ["DOWN", "DOWNLEFT", "DOWNRIGHT"]; // Submissive
  var randOffset = offsetDirections[Math.floor(Math.random() * offsetDirections.length)];
	var startDir = Math.random()*0.3;
	var headDir = {
		start: gazeShift.id + ":start" + "+" + startDir,
		end: gazeShift.id + ":end" + "+" + (0.5+Math.random()*0.3),
		target: "CAMERA",
    offsetDirection: randOffset,
    offsetAngle: 2 + 5*Math.random()
	}

  
  
	return [gazeShift, blink, headDir];
}



// Change offsets of new bml instructions
BMLPlanner.prototype.fixSyncStart = function(bml, offsetStart){
	// Find which sync attributes exist
	var syncAttrs = ["start"];
	var possibleSyncAttrs = ["end", "attackPeak", "relax", "ready", "strokeStart", "strokeEnd", "stroke"];
	for (var i = 0; i<possibleSyncAttrs.length; i++)
		if (bml[possibleSyncAttrs[i]] !== undefined)
			syncAttrs.push(possibleSyncAttrs[i]);
	

	// Is a reference to another bml?
	var start = parseFloat(offsetStart);
	var isRef = false;
	if (isNaN(start))
		isRef = true;


	// Add start
	// Reference to another bml -> start: "bml1:end + 1"
	if (isRef){
		// If ref already has an offset
		var str = offsetStart.split("+");
		var offset = str[1] === undefined ? 0 : parseFloat(offset);
		// Add start ref to bml start
		for (var i = 0; i<syncAttrs.length; i++){
			var syncName = syncAttrs[i];
			bml[syncName] = str[0] + "+" + (bml[syncName] + offset);
		}
	}
	// Not a reference, just a number
	else {
		// Add start offset to bml start
		for (var i = 0; i<syncAttrs.length; i++){
			var syncName = syncAttrs[i];
			bml[syncName] = start + bml[syncName];
		}
	}
}



// Add a pause between speeches

BMLPlanner.prototype.addUtterancePause = function(bmlLG){
  // Pause time
  var pauseTime = 0.2 + Math.random()*0.4;
  
	// Is a reference to another bml?
	var end = parseFloat(bmlLG.end);
	var isRef = false;
	if (isNaN(end))
		isRef = true;
  
  if (isRef){
    // If ref already has an offset
		var str = bmlLG.end.split("+");
		var offset = str[1] === undefined ? 0 : parseFloat(str[1]);
    offset += pauseTime;
    bmlLG.end = str[0] + "+" + offset;
  }
  else
    bmlLG.end += pauseTime;
  
}