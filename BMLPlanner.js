//@BMLPlanner

// Or could be also called Gesture Generation.
// Adds new bml instructions according to the dialogue act and speech


var BMLPlanner = function(){

	this.conversation = "New dialogue\n";
}



BMLPlanner.prototype.newBlock = function(block){

	// If langauge-generation
	if (block.lg){
		// List of bml instructions
		if (block.lg.constructor === Array)
         for (var i = 0; i <block.lg.length; i++){
         	var isLast = false;
         	if (i == block.lg.length-1) isLast = true;
           this.processSpeechBlock(block.lg[i], block, isLast);
         }
    	// No array
    	else
    		this.processSpeechBlock(block.lg, block, true);

	}

	// If non-verbal -> inside mode-selection.nonverbal
	else if (block.nonVerbal){
		// Add gesture

	}

}


// Process language generation message
BMLPlanner.prototype.processSpeechBlock = function(bmlLG, block, isLast){
  // Add to dialogue
  this.conversation += "KRISTINA" + bmlLG.text + "\n";
  
	// Raise eyebrows using longest word
	var faceBrows = this.createBrowsUp(bmlLG);

	// Valence face end of speech
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
	block.blink = [];
	block.face = faceBrows;
	block.faceShift = faceShiftsEnd;
	block.head = head;

	if (isLast){
		block.headDirectionShift = gazeblinkEnd[2];
		block.gazeShift = gazeblinkEnd[0];
		block.blink.push(gazeblinkEnd[1]);
	} else
    block.push(gazeblinkEnd);

	if (gazeblinkStart[0] != null){
		block.gaze = gazeblinkStart[0];
		block.blink = block.blink.push(gazeblinkStart[1]);
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
	faceLongestWord.start = Math.max(0, Math.random()*0.4 - bmlLG.textTiming[1][maxInd]); // Substract <0.4 from start of longest word
	faceLongestWord.attackPeak = Math.random()*maxT +  bmlLG.textTiming[1][maxInd]; // Add <wordTime to start of word
	faceLongestWord.relax = Math.min(endOfSentence-0.5, faceLongestWord.attackPeak + Math.random()*maxT/2); // Add <wordTime/2 to attackPeak
	faceLongestWord.end = Math.min(endofSentence, faceLongestWord.relax + 0.2 + Math.random()*0.5); // Add 0.2 + <0.5 to relax
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
		bmlLG.valence = 0;
	}
  
	// Generate two faceShifts
	var faceValence0 = {
		id: "toFace" + parseInt(Math.random()*1000),
    valAro: [bmlLG.valence, 0],
		start: endOfSentence,
		end: 0.2 + Math.random()*bmlLG.valence // If valence is high, should take more time?
	}

	// Add offset start
	this.fixSyncStart(faceValence0, bmlLG.start);

	// Generate two faceShifts
	var faceValence1 = {
		id: "toNeutral" + parseInt(Math.random*1000),
    valAro: [0.25, 0], // TODO - default face is 0.25,0?
		start: faceValence0.end,
		end: (faceValence0.id + ":end") + "+" +(0.2 + Math.random()*bmlLG.valence) // If valence is high, should take more time?
	}

	return [faceValence0, faceValence1];
}



// Create a head nod at the beggining
BMLPlanner.prototype.createHeadNodStart = function(bmlLG){

	var start = Math.random()*1;
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
		var start = Math.random()*1; // One second max to start movement
		var ready = start + 0.5 + Math.random();
		var relax = ready + 0.2 + Math.random()*0.5;
		var end = ready + 0.5 + Math.random();

		var offsetDirections = ["LEFT, RIGHT, DOWN-LEFT, DOWN-RIGHT"]; // TODO: Sure about these directions??
		var randOffset = offsetDirections[Math.floor(Math.random() * offsetDirections.length)];

		gaze0 = {
      id: "gazeStart" + parseInt(Math.random()*1000),
			start: start,
			ready: ready,
			relax: relax,
			end: end,
			influence: "HEAD",
			target: "CAMERA",
			offsetAngle: 5 * Math.random()*15, // TODO: angle magnitude?

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
	var start = end - Math.random()*1;
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
	var startBlink = -Math.random()*0.2;
	var blink = {
    start: gazeShift.id + ":start" + "+" + startBlink,
		end: gazeShift.id + ":start" + "+" + (startBlink + Math.random()*0.7)
	}

	// headDirectionShift
	var startDir = -Math.random()*0.3;
	var headDir = {
		start: gazeShift.id + ":start" + "+" + startDir,
		end: gazeShift.id + ":end" + "+" + Math.random()*0.3,
		target: "CAMERA"
	}

	return [gazeShift, blink, headDir];
}




BMLPlanner.prototype.fixSyncStart = function(bml, offsetStart){
	// Find which sync attributes exist
	var syncAttrs = ["start", "end"];
	var possibleSyncAttrs = ["attackPeak", "relax", "ready", "strokeStart", "strokeEnd", "stroke"];
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
		var str = bmlLG.start.split("+");
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