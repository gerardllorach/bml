//@BMLTimeManager

// Message gets to BMLTimeManager -> then to facial control -> then to BMLRealizer

// Needs to synchronize BML actions of the same block
// [MERGE,APPEND,REPLACE,OVERWRITE]
// Warnings and feedback
// wait, synchronize, constraints, before, after


function BMLTimeManager(){

	// BML stack
	this.blinkStack = [];
	this.gazeStack = [];
	this.faceStack = [];
	this.headStack = [];
	this.headDirStack = [];
	this.speechStack = [];
	this.gestureStack = [];
	this.poitingStack = [];

	this.lg = [];


	this.BMLStacks = [this.blinkStack, this.gazeStack, this.faceStack, this.headStack,
						this.headDirStack, this.speechStack, this.lg,
						this.gestureStack, this.poitingStack];

	// Block stack
	this.stack = [];

	// Active blocks
	this.activeBlocks = [];
}


// TODO: UPDATE, CALL ACTIONS AND PROVIDE FEEDBACK
BMLTimeManager.prototype.update = function(actionCallback){
	// Time now
	var d = new Date();
	this.time = d.getSeconds() + 0.001*d.getMilliseconds();

	// Several blocks can be active (MERGE composition)
	for (var i = 0; i<this.stack.length; i++){
		// If it is not active
		if (this.stack[i].isActive === undefined){
			// Block starts
			if (this.stack[i].startGlobalTime < this.time){
				this.stack[i].isActive = true;
				this.activeBlocks.push(this.stack[i]);
			}
		}
		// Block has ended
		else if (this.stack[i].isActive == false){
			this.removeFromStacks(this.stack[i]);
			this.stack.splice(i, 1);
			i--;
			// TODO -> send feedback
		}
	}

	// Check active BML and blocks
	for (var i = 0; i < this.activeBlocks.length; i++){
		var block = this.activeBlocks[i];
		var keys = keys(this.activeBlocks[i]);
		for (var j = 0; j < keys.length; j++){
			var bml = block[keys[i]];
			// If it is not active
			if (bml.isActive === undefined){
				// Check start time and call it
				if (bml.startGlobalTime < this.time){
					bml.isActive = true;
					actionCallback(keys[i], bml); // CALL BML INSTRUCTION
					// TODO -> Call to do action
				}
			} 
			// Check when it ends
			else if (bml.isActive == true){
				if (bml.endGlobalTime < this.time){
					bml.isActive = false;
					// TODO -> Send feedback? Not needed for bml individual instructions?
				}
			}
		}
	}

	// Clean stacks
	for (var i = 0; i < this.activeBlocks.length; i++){
		if (this.activeBlocks[i].endGlobalTime < this.time){
			this.activeBlocks[i].isActive = false;
			this.activeBlocks.splice(i, 1);
		}
	}

	
}




BMLTimeManager.prototype.newBlock = function(block){

	// Time now
	var d = new Date();
	this.time = d.getSeconds() + 0.001*d.getMilliseconds();

	// Fix and Sychronize (set missing timings) (should substitute "start:gaze1:end + 1.1" by a number)
	this.fixBlock(block);

	// TODO: constraint (synchronize, after, before) and wait

	// Add to stack
	this.addToStack(block);

	// Check timing errors
	this.check();

}



BMLTimeManager.prototype.fixBlock = function(block){
	// Define block start (in BML this is not specified, only in bml instructions, not in blocks)
	block.start = block.start || 0.0;
	// Check if it is a number
	block.start = this.checkSync(block.start, block);

	// Define timings and find sync attributes
	// Blink
	if (block.blink) fixBML(block.blink, block, {start: 0, attackPeak: 0.2, relax: 0.2, end: 0.5});
	// Gaze
	if (block.gaze) fixBML(block.gaze, block, {start: 0, ready: 0.33, relax: 0.66, end: 2.0});
	// GazeShift
	if (block.gazeShift) fixBML(block.gazeShift,{start: 0, end: 2.0});
	// Head
	if (block.head) fixBML(block.head, block, {start: 0, ready: 0.3, strokeStart: 0.3, stroke: 0.4, strokeEnd: 0.6, relax: 0.7, end: 1.0});
	// HeadDirection
	if (block.headDirectionShift) fixBML(block.headDirectionShift, block, {start: 0, end: 2.0});
	// Face
	if (block.face) fixBML(block.face, block, {start: 0, attackPeak: 0.4, relax: 0.6, end: 1});
	// FaceShift
	if (block.faceShift) fixBML(block.faceShift, block, {start: 0, end: 1});
	// Speech (several instructions not implemented)
	if (block.speech) fixBML(block.speech, block, {start: 0, end: 4});
	// Gesture
	if (block.gesture) fixBML(block.gesture, block,  {start: 0, ready: 0.3, strokeStart: 0.3, stroke: 0.4, strokeEnd: 0.6, relax: 0.7, end: 1.0});
	// Pointing
	if (block.pointing) fixBML(block.pointing, block,  {start: 0, ready: 0.3, strokeStart: 0.3, stroke: 0.4, strokeEnd: 0.6, relax: 0.7, end: 1.0});

	// Language-generation
	if (block.lg) fixBML(block.lg, block, {start: 0, end: 4});


	// Check particular properties?

	// Constraint element

	// Check coherence?

	// Find end of block
	block.end = this.findEndOfBlock(block);
}


BMLTimeManager.prototype.fixBML = function(bml, block, sync){
	// Several instructions inside
	if (bml.length !== undefined){
		for (var i = 0; i < bml.length; i++)
			this.fixBML(bml[i], block, sync);
	}
	// Define timings
	var keys = keys(sync);
	
	// START
	// Check sync
	bml.start = this.checkSync(bml.start, block);
	// Define start
	bml.start = bml.start || 0.0;

	// END
	// Check sync
	bml.end = this.checkSync(bml.end, block);
	// If no "end", apply default sync attributes
	if (bml.end === undefined){
		for (var i = 0; i < keys.length; i++)
			bml[keys[i]] = sync[keys[i]];
		return;
	}

	// OTHER SYNC
	// If start and end are defined, fill other sync points.
	for (var i = 0; i < keys.length; i++){
		// Check sync (returns the number if it is already defined)
		if (bml[keys[i]] !== undefined)
			bml[keys[i]] = this.checkSync(bml[keys[i]], block);
		// If undefined fill default sync points (represented in portions between 0-1)
		if (bml[keys[i]] === undefined)
			 bml[keys[i]] = (bml.end - bml.start)*sync[keys[i]] + bml.start;
	}
}


BMLTimeManager.prototype.checkSync = function(syncAttr, block, it){
	
	// Check if undefined
	if (syncAttr === undefined){
		console.log("Sync attr undefined.", syncAttr, block, it);
		return undefined;
	}

	// Limit recursive iterations
	if (it === undefined)
		it = 0;
	else if (it > 5){
		console.error("Six iterations without finding syncAttr.", syncAttr, block, it);
		return undefined;
	}


	// Parse number
	var tNumber = parseFloat(syncAttr);

	// Needs sync
	if (isNaN(tNumber)){
		tNumber =  null;
		// Find sync value
		str = syncAttr.replace(/\s+/g, '');
		str = str.split("+");
		ids = str[0].split(":");
		// Two ids -> look inside block (gaze1:end)
		if (ids.length == 2)
			tNumber = this.findTime(ids[0], ids[1], block, it);
		// Three ids -> look inside block stack (bml1:gaze1:end) and compensate global times
		else if (ids.length == 3){
			for (var i = 0; i<this.stack.length; i++){
				if (this.stack[i].id == ids[0]){ // Find block
					tNumber = this.findTime(ids[1], ids[2], this.stack[i], it);
					// The number is a reference to another block
					// This number is not usable until the current block is placed according
					// to composite. To mark it, the global time stamp is found and set to
					// negative, in order to fix it later, once the current block is placed.
					if (!isNaN(tnumber)){
						tNumber += this.stack[i].startGlobalTime; // Global timestamp
						tNumber *= -1; // Negative flag
					}
					break;
				}
			}
		}

		// If sync attr not found
		if (tNumber === null){
			console.error ("Sync attr not found.", syncAttr, block, it);
			return tNumber;
		}
		// Add offset
		if (str.length == 2)
			tNumber += parseFloat(str[1]) * Math.sign(tNumber); // This last part is to compensate
																// the negative flag (ref to other blocks)
	}

	return tNumber;

}


BMLTimeManager.prototype.findTime = function(id, syncName, block, it){

	var result = null;
	// Check all keys
	keys = keys(block);

	for (var i = 0; i<keys.length; i++){
		if (block[keys[i]].id == id){
			result = block[keys[i]][syncName];
			break;
		}
	}

	// Check that result is valid
	if (result == null)
		console.error("Sync attr "+ id + ":" + syncName +" not found.", block);
	// Sync attr is another sync reference
	else if (isNaN(result)){
		console.log("Synchronization: looking for: ", result);
		it++;
		return this.checkSync(result, block, it)
	} 
	// Sync attr found
	else
		return result;


}



BMLTimeManager.prototype.addToStack = function(block){

	if (block.composition == "OVERWRITE"){
		// Substitute in stack
		block.startGlobalTime = this.time + block.start;
		block.endGlobalTime = this.time + block.end;
		// If next block starts in the middle of the other
		for (var i = 1; i<this.stack.length; i++){
			if (block.endGlobalTime >= this.stack[i].startGlobalTime){
				this.removeFromStacks(this.stack[i]);
				this.stack.shift();
				i--;
			}
		}
		if (this.stack[0])
			this.removeFromStacks(this.stack[0]);

		this.stack[0] = block;
	}

	else if (block.composition == "APPEND"){
		// No actions in the stack
		if (this.stack.length == 0){
			block.startGlobalTime = this.time + block.start;
			block.endGlobalTime = this.time + block.end;
			stack[0] = block;
		}
		// Last action in the stack (if start != 0 waiting time?)
		else {
			block.startGlobalTime = this.stack[this.stack.length-1].endGlobalTime + block.start;
			block.endGlobalTime = block.end + this.stack[this.stack.length-1].endGlobalTime;
			this.stack.push (block);
		}
	}
	// REPLACE
	else if (block.composition == "REPLACE"){
		// No actions in the stack
		if (this.stack.length == 0){
			block.startGlobalTime = this.time + block.start;
			block.endGlobalTime = this.time + block.end;
			this.stack[0] = block;
		}
		// Second action in the stack (if start != 0 waiting time?)
		else {
			block.startGlobalTime = this.stack[0].endGlobalTime;
			block.endGlobalTime = block.startGlobalTime + block.end;

			// Remove following blocks
			for (var i = 1; i<tmp.length; i++)
				this.removeFromStacks(this.stack[i]);
			
			this.stack[1] = block;
		}
	}
	// MERGE
	else {
		// No actions in the stack
		if (this.stack.length == 0){
			block.startGlobalTime = this.time + block.start;
			block.endGlobalTime = this.time + block.end;
			this.stack[0] = block;
		}
		// Merge and add to BML stacks
		else{ // Try to merge, if not, add "del" variable to bml
			if (block.blink) block.blink.del = 							!this.mergeBML(block.blink, this.blinkStack, this.time + block.start);
			if (block.gaze) block.gaze.del = 							!this.mergeBML(block.gaze, this.gazeStack, this.time + block.start); // This could be managed differently (gazeManager in BMLRealizer.js)
			if (block.gazeShift) gazeShift.blink.del = 					!this.mergeBML(block.gazeShift, this.gazeStack, this.time + block.start);
			if (block.face) block.face.del = 							!this.mergeBML(block.face, this.faceStack, this.time + block.start);
			if (block.faceShift) block.faceShift.del = 					!this.mergeBML(block.faceShift, this.faceStack, this.time + block.start);
			if (block.head) block.head.del = 							!this.mergeBML(block.head, this.headStack, this.time + block.start);
			if (block.headDirectionShift) block.headDirectionShift.del = !this.mergeBML(block.headDirectionShift, this.headDirStack, this.time + block.start);
			if (block.speech) block.speech.del = 						!this.mergeBML(block.speech, this.speechStack, this.time + block.start);
			if (block.gesture) block.gesture.del = 						!this.mergeBML(block.gesture, this.gestureStack, this.time + block.start);
			if (block.pointing) block.pointing.del = 					!this.mergeBML(block.head, this.pointingStack, this.time + block.start);
			
			//TODO - Send feedback

			// Clean block
			this.cleanBlock(block);
			// Add to block stack
			block.startGlobalTime = this.time + block.start;
			block.endGlobalTime = this.time + block.end;
			for (var i = 0; this.stack.length; i++){
				if (this.stack[i].startGlobalTime < block.startGlobalTime){
					var tmp = this.stack.splice(i+1);
					this.stack.push(block);
					this.stack.concat(tmp);
					break;
				}		
			}
			return;
		}
	}

	// Add to stacks
	this.addToBMLStack(block);

}


BML.TimeManager.prototype.removeFromStacks = function(block){
	var keys = keys(block);
	// Add delete variable in block to bml instructions
	for (var i = 0; i < keys.length; i++){ // Through bml instructions
		var kk = keys(block[keys[i]]);
		if (kk.length != 0) // If is an object, add del variable
			block[keys[i]].del = true;
	}
	// Remove from stacks bml with del
	for (var i = 0; i<this.BMLStacks.length; i++){ // Through list of stacks
		for (var j = 0; j<this.BMLStacks[i].length; j++) // Through stack
			if (this.BMLStacks[i][j].del) // Find del variable in stack
				this.BMLStacks[i].splice(j, 1); // Remove from stack
	}
}


BML.TimeManager.prototype.cleanBlock = function(block){
	var keys = keys(block);
	for (var i = 0; i<keys.length; i++){
		if (block[keys[i]].del)
			delete block[keys[i]];
	}
}


BML.TimeManager.prototype.mergeBML = function(bml, stack, globalStart){
	var merged = false;

	// Refs to another block (negative global timestamp)
	if (bml.start < 0) bml.start = (-bml.start) - globalStart; // The ref timestamp should be always bigger than globalStart
	if (bml.end < 0) bml.end = (-bml.end) - globalStart;

	bml.startGlobalTime = globalStart + bml.start;
	bml.endGlobalTime = globalStart + bml.end;

	// Check errors
	if (bml.start < 0 ) console.error ("BML start is negative", bml.start, stack, globalStart);
	if (bml.start < 0 ) console.error ("BML end is negative", bml.end, stack, globalStart);

	// Modify all sync attributes to remove non-zero starts (offsets)
	// Also fix refs to another block (negative global timestamp)
	bml.end -= bml.start;
	if (bml.attackPeak) this.mergeBMLSyncFix(bml.attackPeak, bml.start, globalStart);
	if (bml.ready)		this.mergeBMLSyncFix(bml.ready, bml.start, globalStart);
	if (bml.strokeStart)this.mergeBMLSyncFix(bml.strokeStart, bml.start, globalStart);
	if (bml.stroke) 	this.mergeBMLSyncFix(bml.stroke, bml.start, globalStart);
	if (bml.strokeEnd) 	this.mergeBMLSyncFix(bml.strokeEnd, bml.start, globalStart);
	if (bml.relax)		this.mergeBMLSyncFix(bml.relax, bml.start, globalStart);
	bml.start = 0;

	// Empty
	if (stack.length == 0){
		stack[0] = bml;
		merged = true;
	}
	else{
		// Fits between
		if (stack.length > 1){
			for (var i = 0; i<stack.length-1; i++){
				if (bml.startGlobalTime >= stack[i].endGlobalTime && bml.endGlobalTime <= stack[i+1].startGlobalTime){
					tmp = stack.splice(i, stack.length);
					stack.push(bml);
					stack.concat(tmp);
					merged = true;
				}
			}
		}
		// End of stack
		if (!merged){
			if (stack[stack.length-1].endGlobalTime < bml.startGlobalTime){
				stack.push(bml);
				merged = true;
			}
		}
	}

	return merged;
}
// Fix ref to another block (negative global timestamp) and remove start offset
BMLTimeManager.prototype.mergeBMLSyncFix = function(syncAttr, start, globalStart){
	// Ref to another block
	if (syncAttr < 0) syncAttr = (-syncAttr) - globalStart;
	// Remove offset
	syncAttr -= start;

	// Check error
	if (syncAttr < 0)
		console.error ("BML sync attribute is negative.", syncAttr, start, globalStart);

	return syncAttr;
}



// Add bml actions to stacks with global timings
BMLTimeManager.prototype.addToBMLStack = function(block){

	var globalStart = block.startGlobalTime;

	// Blink
	if (block.blink)
		this.processIntoBMLStack(block.blink, this.blinkStack, globalStart, block.composition);

	// Gaze
	if (block.gaze)
		this.processIntoBMLStack(block.gaze, this.gazeStack, globalStart, block.composition);
	if (block.gazeShift)
		this.processIntoBMLStack(block.gazeShift, this.gazeStack, globalStart, block.composition);

	// Head
	if (block.head)
		this.processIntoBMLStack(block.head, this.headStack, globalStart, block.composition);
	if (block.headDirectionShift)
		this.processIntoBMLStack(block.headDirectionShift, this.headDirStack, globalStart, block.composition);

	// Face
	if (block.face)
		this.processIntoBMLStack(block.face, this.faceStack, globalStart, block.composition);
	if (block.faceShift)
		this.processIntoBMLStack(block.faceShift, this.faceStack, globalStart, block.composition);

	// Speech
	if (block.speech)
		this.processIntoBMLStack(block.speech, this.speechStack, globalStart, block.composition);
	

}



BMLTimeManager.prototype.findEndOfBlock = function(bml){
	var keys = keys(bml);
	var latestEnd = 0;
	for (var i = 0; i < keys.length; i++){
		if (bml.keys[i].end !== undefined)
			latestEnd = Math.max(bml.keys[i].end, latestEnd);
		else // several instructions inside class
			for (var j = 0; j < bml.keys[i].length; j++)
				latestEnd = Math.max(bml.keys[i][j].end, latestEnd);

	}
	return latestEnd;
}


// Add bml action to stack
BMLTimeManager.prototype.processIntoBMLStack = function(bml, stack, globalStart){
	

	// Several instructions
	if (bml.length !== undefined){
		for (var i = 0; i < bml.length; i++)
			this.processIntoBMLStack(bml[i], stack, globalStart);
	}

	// Could be called directly? Should always return true
	var merged = this.mergeBML(bml,stack,globalStart);

	// First, we check if the block fits between other blocks, thus all bml instructions
	// should fit in the stack.
	if (!merged)
		console.error("Could not add to stack, but it should've been possible. Bug!", bml, stack, globalStart);
	
}

// Checks that all stacks are ordered according to the timeline (they should be as they are insterted in order)
BMLTimeManager.prototype.check = function(){
	if (this.errorCheck(this.blinkStack)) console.error("Previous error is in blink stack");
	if (this.errorCheck(this.gazeStack)) console.error("Previous error is in gaze stack");
	if (this.errorCheck(this.faceStack)) console.error("Previous error is in face stack");
	if (this.errorCheck(this.headStack)) console.error("Previous error is in head stack");
	if (this.errorCheck(this.headDirStack)) console.error("Previous error is in headDir stack");
	if (this.errorCheck(this.speechStack)) console.error("Previous error is in speech stack");
	if (this.errorCheck(this.gestureStack)) console.error("Previous error is in gesture stack");


	if (this.errorCheck(this.stack)) console.error("Previous error is in block stack");
}

BMLTimeManager.prototype.errorCheck = function(stack){
	// Check timings
	for (var i = 0; i<stack.length-1; i++){
		if (stack[i].endGlobalTime > stack[i+1].startGlobalTime){
			console.error("Timing error in stack: ", stack);
			return true;
		}
	}
}