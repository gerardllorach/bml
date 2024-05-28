//@Facial GUI
// Globals
if (!LS.Globals)
  LS.Globals = {};

//LS.Globals.showGUI = true;

this.onStart = function(){
  //this.lipsyncHTML();
}



// --------------------- GUI ---------------------

this.onRenderGUI = function(){
	
  if (!LS.Globals.showGUI)
    return;
  
  width = gl.viewport_data[2];
  height = gl.viewport_data[3];
  
  
  if (!gl.mouse.left_button){
		this._clicked = false;
  }
  gl.start2D();
  
  // Whissel Wheel
  // Mouse
  var dist = Math.sqrt((-gl.mouse.x + width - 130)*(-gl.mouse.x + width - 130) + (-gl.mouse.y + height - 130)*(-gl.mouse.y + height - 130));

  if (dist<100){
    gl.fillStyle = "rgba(255,0,0,0.8)";
    
    if (gl.mouse.dragging){
    	this._targetValAro[0] = (gl.mouse.x - width + 130)/100;
    	this._targetValAro[1] = (gl.mouse.y - height + 130)/100;
      
      faceObj = {"valaro": this._targetValAro};
      
      LS.Globals.faceShift(faceObj);
      this.changingFace = true;
    }
  }
  else
  	gl.fillStyle = "rgba(255,0,0,0.5)";
  
  gl.strokeStyle = "rgba(255,255,255,0.8)";
  gl.lineWidth = 2;
  
  gl.beginPath();
	gl.arc(width-130,130,100,0,2*Math.PI);
  gl.fill();
	gl.stroke();
  

  // Show val-aro text
  gl.font = "15px Arial";
  gl.fillStyle = "rgba(255,255,255,0.8)";
  gl.textAlign = "center";
  var FEText = "";
  if(this._targetValAro)
  	FEText = "Arousal "+ this._targetValAro[1].toFixed(2) +"\nValence "+ this._targetValAro[0].toFixed(2);
  gl.fillText(FEText, width-130, 145);

  
  
  
  // ---------- BML ----------
  var comp = this._composition[this._selComposition];
  // Blink button
  var rect={x:width-200,y:250,w:150,h:30};
  
  if (gl.mouse.x < rect.x + rect.w && gl.mouse.x > rect.x &&
      height-gl.mouse.y < rect.y + rect.h && height-gl.mouse.y > rect.y){
    gl.fillStyle = "rgba(255,255,255,0.5)";
    
    if (gl.mouse.left_button  && !this._clicked){
      this._clicked = true;
      if (LS.Globals.BMLManager)
        LS.Globals.BMLManager.newBlock({"id": "blink","blink":true, composition: comp});
      else
      	LS.Globals.blink({"blink":"true"});
      gl.fillStyle = "rgba(127,255,127,0.8)";
    }
  } else
    gl.fillStyle = "rgba(255,255,255,0.3)";
  
  gl.fillRect(rect.x,rect.y,rect.w,rect.h);
  gl.fillStyle = "rgba(255,255,255,0.9)";
  gl.fillText("Blink", rect.x + rect.w/2, rect.y +3*rect.h/4);
  
  
  // LipSync Play button
  rect={x:width-200,y:290,w:150,h:30};
  
  if (gl.mouse.x < rect.x + rect.w && gl.mouse.x > rect.x &&
      height-gl.mouse.y < rect.y + rect.h && height-gl.mouse.y > rect.y){
    gl.fillStyle = "rgba(255,255,255,0.5)";
    
    if (gl.mouse.left_button  && !this._clicked){
      this._clicked = true;
      if (LS.Globals.BMLManager)
        LS.Globals.BMLManager.newBlock({"id": "lg","lg":this.newLG(), composition: comp});
      else
      	LS.Globals.lipsync(this._lipSyncMsg);
      gl.fillStyle = "rgba(127,255,127,0.8)";
    }
  } else
    gl.fillStyle = "rgba(255,255,255,0.3)";
  
  gl.fillRect(rect.x,rect.y,rect.w,rect.h);
  gl.fillStyle = "rgba(255,255,255,0.9)";
  gl.fillText("Lip sync", rect.x + rect.w/2, rect.y +3*rect.h/4);
  
  
  // Random face
  rect={x:width-220,y:330,w:190,h:30};
  
  if (gl.mouse.x < rect.x + rect.w && gl.mouse.x > rect.x &&
      height-gl.mouse.y < rect.y + rect.h && height-gl.mouse.y > rect.y){
    gl.fillStyle = "rgba(255,255,255,0.5)";
    
    if (gl.mouse.left_button  && !this._clicked){
      this._clicked = true;
      
      var val1 = Math.random()*2 -1;
      var val2 = Math.random()*2 -1;
      this._targetValAro[0] = val1;
      this._targetValAro[1] = val2;
      var obj = {"attackPeak": 0.5, relax: 1, end: 1.5, "valaro": this._targetValAro}
      if (LS.Globals.BMLManager)
        LS.Globals.BMLManager.newBlock({"id": "face","face":obj, composition: comp});
      else
      	LS.Globals.face(obj);
      gl.fillStyle = "rgba(127,255,127,0.8)";
    }
  } else
    gl.fillStyle = "rgba(255,255,255,0.3)";
  
  gl.fillRect(rect.x,rect.y,rect.w,rect.h);
  gl.fillStyle = "rgba(255,255,255,0.9)";
  gl.fillText("Random face (" + this._targetValAro[0].toFixed(2) + ", " + this._targetValAro[1].toFixed(2) + ")"
              , rect.x + rect.w/2, rect.y +3*rect.h/4);
  
  
  
  // Random gaze
  rect={x:width-200,y:370,w:150,h:30};
  
  if (gl.mouse.x < rect.x + rect.w && gl.mouse.x > rect.x &&
      height-gl.mouse.y < rect.y + rect.h && height-gl.mouse.y > rect.y){
    gl.fillStyle = "rgba(255,255,255,0.5)";
    
    if (gl.mouse.left_button && !this._clicked){
      this._clicked = true;
      

      var opts = ["RIGHT", "LEFT", "UP", "DOWN", "UPRIGHT", "UPLEFT", "DOWNRIGHT", "DOWNLEFT"];
      var opts2 =  ["HEAD", "EYES"];
      
      var val = opts[Math.floor(Math.random()*8)];
      var val2 = Math.random()*45;
      var val3 = opts2[Math.floor(Math.random()*2)];

      // TODO -> IF APP RUNNING
      var obj = {"influence":val3, "offsetDirection":val, "offsetAngle": val2};
      if (LS.Globals.BMLManager)
        LS.Globals.BMLManager.newBlock({"id": "gaze","gaze":obj, composition: comp});
      else
      	LS.Globals.gaze(obj);
      
      gl.fillStyle = "rgba(127,255,127,0.8)";
    }
    
  } else
    gl.fillStyle = "rgba(255,255,255,0.3)";
  
  
  
  gl.fillRect(rect.x,rect.y,rect.w,rect.h);
  gl.fillStyle = "rgba(255,255,255,0.9)";
  
 
  
  gl.fillText("Gaze", rect.x + rect.w/2, rect.y + 0.75*rect.h);/*   (" + this.gaze.influence + ", " 
              + this.gaze.offsetAngle.toFixed(2) + ", " 
              + this.gaze.offsetDirection + ")"
              , rect.x + rect.w/2, rect.y +3*rect.h/4);*/
  
  
  // Random gaze shift
  rect={x:width-200,y:410,w:150,h:30};
  
  if (gl.mouse.x < rect.x + rect.w && gl.mouse.x > rect.x &&
      height-gl.mouse.y < rect.y + rect.h && height-gl.mouse.y > rect.y){
    gl.fillStyle = "rgba(255,255,255,0.5)";
    
    if (gl.mouse.left_button && !this._clicked){

      this._clicked = true;

      var opts = ["RIGHT", "LEFT", "UP", "DOWN", "UPRIGHT", "UPLEFT", "DOWNRIGHT", "DOWNLEFT"];
      var opts2 =  ["HEAD", "EYES"];
      
      var val = opts[Math.floor(Math.random()*8)];
      var val2 = Math.random()*45;
      var val3 = opts2[Math.floor(Math.random()*2)];
			
      // TODO--> ONLY WHEN APP IS RUNNING - why? problem fixed?
      var obj = {"influence":val3, "offsetDirection":val, "offsetAngle": val2};
      if (LS.Globals.BMLManager)
        LS.Globals.BMLManager.newBlock({"id": "gazeShift","gazeShift":obj, composition: comp});
      else
      	LS.Globals.gazeShift(obj);
      
      gl.fillStyle = "rgba(127,255,127,0.8)";
    }

  } else
    gl.fillStyle = "rgba(255,255,255,0.3)";
  
  gl.fillRect(rect.x,rect.y,rect.w,rect.h);
  gl.fillStyle = "rgba(255,255,255,0.9)";
  
  gl.fillText("GazeShift" , rect.x + rect.w/2, rect.y + 0.75*rect.h);/*   (" + this.gaze.influence + ", " 
              + this.gaze.offsetAngle.toFixed(2) + ", " 
              + this.gaze.offsetDirection + ")"
              , rect.x + rect.w/2, rect.y +3*rect.h/4);*/
  
  
  
  
  // Head
  rect={x:width-200,y:450,w:150,h:30};
  if (gl.mouse.x < rect.x + rect.w && gl.mouse.x > rect.x &&
      height-gl.mouse.y < rect.y + rect.h && height-gl.mouse.y > rect.y){
    gl.fillStyle = "rgba(255,255,255,0.5)";
    
    if (gl.mouse.left_button&& !this._clicked){
      
      this._clicked = true;

			var opts =  ["NOD", "SHAKE", "TILT"];
      var val = opts[Math.floor(Math.random()*opts.length)];
      
      if (LS.Globals.BMLManager)
        LS.Globals.BMLManager.newBlock({"id": "head","head":{"lexeme": val}, composition: comp});
      else
      	LS.Globals.head({"lexeme": val});
      
      gl.fillStyle = "rgba(127,255,127,0.8)";
    }

  } else
    gl.fillStyle = "rgba(255,255,255,0.3)";
  
  gl.fillRect(rect.x,rect.y,rect.w,rect.h);
  gl.fillStyle = "rgba(255,255,255,0.9)";
  
  gl.fillText("Head nod/shake/tilt" , rect.x + rect.w/2, rect.y + 0.75*rect.h);
  
  
  
  // Face lexeme
  rect={x:width-200,y:490,w:150,h:30};
  if (gl.mouse.x < rect.x + rect.w && gl.mouse.x > rect.x &&
      height-gl.mouse.y < rect.y + rect.h && height-gl.mouse.y > rect.y){
    gl.fillStyle = "rgba(255,255,255,0.5)";
    
    if (gl.mouse.left_button && !this._clicked){
      
      this._clicked = true;

      var opts =  ["RAISE_BROWS", "RAISE_MOUTH_CORNERS", "LOWER_MOUTH_CORNERS", "OPEN_LIPS",
                  "OPEN_MOUTH", "LOWER_BROWS", "CLOSE_EYES", "OBLIQUE_BROWS", "WIDEN_EYES"];
      var val = opts[Math.floor(Math.random()*opts.length)];

      var obj = {"lexeme": val, amount: 1, end: 2}
      if (LS.Globals.BMLManager)
        LS.Globals.BMLManager.newBlock({"id": "face", "face":obj, composition: comp});
      else
      	LS.Globals.face(obj);
      
      gl.fillStyle = "rgba(127,255,127,0.8)";
    }

  } else
    gl.fillStyle = "rgba(255,255,255,0.3)";
  
  gl.fillRect(rect.x,rect.y,rect.w,rect.h);
  gl.fillStyle = "rgba(255,255,255,0.9)";
  
  gl.fillText("Face lexeme" , rect.x + rect.w/2, rect.y + 0.75*rect.h);
  
  
  
  // Composition mode
  if (LS.Globals.BMLManager){
    rect={x:width-270,y:530,w:60,h:30};
    gl.font = "10px Arial";
    for (var i = 0; i<this._composition.length; i++){
      // Selected
      if (this._selComposition == i) // ii
        gl.fillStyle = "rgba(255,255,255,0.7)";
      // Mouse click
      else if (gl.mouse.x < rect.x + rect.w + (i*rect.w) && gl.mouse.x > rect.x + (i*rect.w) &&
          height-gl.mouse.y < rect.y + rect.h && height-gl.mouse.y > rect.y){

        if (gl.mouse.left_button && !this._clicked){
          this._clicked = true;
          this._selComposition = i;
          gl.fillStyle = "rgba(127,255,127,0.8)";
        }

      } else
        gl.fillStyle = "rgba(255,255,255,0.3)";


      gl.fillRect(rect.x + (i*rect.w),rect.y,rect.w,rect.h);
      gl.fillStyle = "rgba(255,255,255,0.9)";

      gl.fillText(this._composition[i] , rect.x + rect.w/2 + (i*rect.w), rect.y + 0.75*rect.h);
    }
  }
  
  /*
  // Show transcript
  if (LS.Globals.transcript){
    gl.font = "20px Arial";
    gl.fillStyle = "white";
    gl.textAlign = "left";
    var posX = 50;
    var posY = height- 50;
    var maxWidth = width;
    var lineHeight = 25;
    var words = LS.Globals.transcript.split(" ");
    var line = "";
    for (var n = 0; n < words.length; n++){
      var testLine = line + words[n] + " ";
      var metrics = gl.measureText(testLine);
      if (metrics.width > maxWidth){
        gl.fillText (line, posX, posY);
        line = words[n] + " ";
        posY += lineHeight;
      } else
        line = testLine;
    }

  	gl.fillText(line, posX, posY);

  }
  */
  
  
  gl.finish2D();
}
this._clicked = false;
//this.gaze.influence = "NECK";
//this.gaze.offsetAngle = 0.0;
//this.gaze.offsetDirection = "RIGHT";

this._targetValAro = [0,0];
this._lipSyncMsg = {"text":"La temperatura óptima para bañar a un bebé es 38 grados.","audioURL":"http://kristina.taln.upf.edu/demo/resources/voice/test_02.wav","duration":3.8106875,"valence":0.5,"arousal":0.5,"sequence":[[0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.045135416,0.09,0.31,0.0,0.0,0.0,0.18],[0.12075,0.25,0.27,0.0,0.22,0.57,0.15],[0.18573958,0.15,0.45,0.0,0.0,0.0,0.15],[0.24328125,0.12,0.18,0.0,0.0,0.0,0.1],[0.2966146,0.1,0.27,0.0,0.3,0.15,0.1],[0.3519271,0.15,0.25,0.17,0.3,0.0,0.0],[0.3969271,0.12,0.18,0.0,0.0,0.0,0.1],[0.43691665,0.09,0.2,0.0,0.0,0.0,0.18],[0.49691665,0.25,0.27,0.0,0.22,0.57,0.15],[0.5719271,0.15,0.45,0.0,0.0,0.0,0.15],[0.62692714,0.12,0.14,0.0,0.45,0.4,0.06],[0.6670313,0.09,0.2,0.0,0.0,0.0,0.18],[0.7149688,0.25,0.27,0.0,0.22,0.57,0.15],[0.77511466,0.12,0.27,0.0,0.37,0.3,0.12],[0.8421146,0.15,0.25,0.17,0.3,0.0,0.0],[0.89361465,0.15,0.45,0.0,0.0,0.0,0.15],[0.9304271,0.1,0.36,0.0,0.75,0.0,0.15],[0.99284375,0.1,0.27,0.0,0.3,0.15,0.1],[1.0652604,0.25,0.27,0.0,0.22,0.57,0.15],[1.1149375,0.0,0.92,0.0,0.0,0.33,0.0],[1.1479584,0.12,0.18,0.0,0.0,0.0,0.1],[1.191698,0.09,0.31,0.0,0.0,0.0,0.18],[1.2568854,0.25,0.27,0.0,0.22,0.57,0.15],[1.3393333,0.0,0.87,0.0,0.0,0.33,0.0],[1.4121354,0.12,0.14,0.0,0.45,0.45,0.06],[1.4617292,0.25,0.27,0.0,0.22,0.57,0.15],[1.521125,0.15,0.25,0.17,0.3,0.0,0.0],[1.5810626,0.25,0.27,0.0,0.22,0.57,0.15],[1.6209792,0.09,0.2,0.0,0.0,0.0,0.18],[1.6591876,0.25,0.27,0.0,0.22,0.57,0.15],[1.7075833,0.0,0.1,0.17,0.2,0.0,0.1],[1.754,0.25,0.27,0.0,0.22,0.57,0.15],[1.8446875,0.25,0.2,0.0,0.0,0.1,0.05],[1.9488542,0.25,0.27,0.0,0.22,0.57,0.15],[1.9986563,0.09,0.2,0.0,0.0,0.0,0.18],[2.0415416,0.25,0.27,0.0,0.22,0.57,0.15],[2.0951145,0.12,0.14,0.0,0.45,0.4,0.06],[2.1457605,0.2,0.3,0.1,0.0,0.0,0.2],[2.1906877,0.0,0.18,0.17,0.2,0.0,0.0],[2.2361667,0.12,0.18,0.0,0.0,0.0,0.1],[2.2867396,0.0,0.1,0.17,0.2,0.0,0.1],[2.3421144,0.12,0.18,0.0,0.0,0.0,0.1],[2.3923855,0.12,0.18,0.0,0.0,0.0,0.1],[2.4623752,0.15,0.25,0.0,0.15,0.0,0.15],[2.582396,0.15,0.45,0.0,0.0,0.0,0.15],[2.6773958,0.09,0.2,0.0,0.0,0.0,0.18],[2.7173855,0.12,0.18,0.0,0.0,0.0,0.1],[2.7523751,0.1,0.46,0.0,0.75,0.0,0.15],[2.8073854,0.2,0.3,0.1,0.0,0.0,0.2],[2.8623958,0.15,0.45,0.0,0.0,0.0,0.15],[2.9073958,0.25,0.27,0.0,0.22,0.57,0.15],[2.9873958,0.1,0.36,0.0,0.75,0.0,0.15],[3.0623856,0.12,0.27,0.0,0.37,0.3,0.12],[3.1767292,0.1,0.0,0.0,0.0,0.33,0.0],[3.3037813,0.12,0.27,0.0,0.37,0.3,0.12],[3.3565729,0.0,0.87,0.0,0.0,0.33,0.0],[3.4016666,0.09,0.2,0.0,0.0,0.0,0.18],[3.4761562,0.25,0.27,0.0,0.22,0.57,0.15],[3.555646,0.0,0.92,0.0,0.0,0.33,0.0],[3.6256561,0.12,0.27,0.0,0.37,0.3,0.12],[3.738177,0.15,0.25,0.0,0.15,0.0,0.15],[3.8106875,0.0,0.0,0.0,0.0,0.0,0.0]]}
this._composition = ["MERGE", "REPLACE", "APPEND", "OVERWRITE"];
this._selComposition = 0;

this.newLG = function(){
  var lg = {"text":"La temperatura óptima para bañar a un bebé es 38 grados.","audioURL":"http://kristina.taln.upf.edu/demo/resources/voice/test_02.wav","duration":3.8106875,"valence":0.5,"arousal":0.5,"sequence":[[0.0,0.0,0.0,0.0,0.0,0.0,0.0],[0.045135416,0.09,0.31,0.0,0.0,0.0,0.18],[0.12075,0.25,0.27,0.0,0.22,0.57,0.15],[0.18573958,0.15,0.45,0.0,0.0,0.0,0.15],[0.24328125,0.12,0.18,0.0,0.0,0.0,0.1],[0.2966146,0.1,0.27,0.0,0.3,0.15,0.1],[0.3519271,0.15,0.25,0.17,0.3,0.0,0.0],[0.3969271,0.12,0.18,0.0,0.0,0.0,0.1],[0.43691665,0.09,0.2,0.0,0.0,0.0,0.18],[0.49691665,0.25,0.27,0.0,0.22,0.57,0.15],[0.5719271,0.15,0.45,0.0,0.0,0.0,0.15],[0.62692714,0.12,0.14,0.0,0.45,0.4,0.06],[0.6670313,0.09,0.2,0.0,0.0,0.0,0.18],[0.7149688,0.25,0.27,0.0,0.22,0.57,0.15],[0.77511466,0.12,0.27,0.0,0.37,0.3,0.12],[0.8421146,0.15,0.25,0.17,0.3,0.0,0.0],[0.89361465,0.15,0.45,0.0,0.0,0.0,0.15],[0.9304271,0.1,0.36,0.0,0.75,0.0,0.15],[0.99284375,0.1,0.27,0.0,0.3,0.15,0.1],[1.0652604,0.25,0.27,0.0,0.22,0.57,0.15],[1.1149375,0.0,0.92,0.0,0.0,0.33,0.0],[1.1479584,0.12,0.18,0.0,0.0,0.0,0.1],[1.191698,0.09,0.31,0.0,0.0,0.0,0.18],[1.2568854,0.25,0.27,0.0,0.22,0.57,0.15],[1.3393333,0.0,0.87,0.0,0.0,0.33,0.0],[1.4121354,0.12,0.14,0.0,0.45,0.45,0.06],[1.4617292,0.25,0.27,0.0,0.22,0.57,0.15],[1.521125,0.15,0.25,0.17,0.3,0.0,0.0],[1.5810626,0.25,0.27,0.0,0.22,0.57,0.15],[1.6209792,0.09,0.2,0.0,0.0,0.0,0.18],[1.6591876,0.25,0.27,0.0,0.22,0.57,0.15],[1.7075833,0.0,0.1,0.17,0.2,0.0,0.1],[1.754,0.25,0.27,0.0,0.22,0.57,0.15],[1.8446875,0.25,0.2,0.0,0.0,0.1,0.05],[1.9488542,0.25,0.27,0.0,0.22,0.57,0.15],[1.9986563,0.09,0.2,0.0,0.0,0.0,0.18],[2.0415416,0.25,0.27,0.0,0.22,0.57,0.15],[2.0951145,0.12,0.14,0.0,0.45,0.4,0.06],[2.1457605,0.2,0.3,0.1,0.0,0.0,0.2],[2.1906877,0.0,0.18,0.17,0.2,0.0,0.0],[2.2361667,0.12,0.18,0.0,0.0,0.0,0.1],[2.2867396,0.0,0.1,0.17,0.2,0.0,0.1],[2.3421144,0.12,0.18,0.0,0.0,0.0,0.1],[2.3923855,0.12,0.18,0.0,0.0,0.0,0.1],[2.4623752,0.15,0.25,0.0,0.15,0.0,0.15],[2.582396,0.15,0.45,0.0,0.0,0.0,0.15],[2.6773958,0.09,0.2,0.0,0.0,0.0,0.18],[2.7173855,0.12,0.18,0.0,0.0,0.0,0.1],[2.7523751,0.1,0.46,0.0,0.75,0.0,0.15],[2.8073854,0.2,0.3,0.1,0.0,0.0,0.2],[2.8623958,0.15,0.45,0.0,0.0,0.0,0.15],[2.9073958,0.25,0.27,0.0,0.22,0.57,0.15],[2.9873958,0.1,0.36,0.0,0.75,0.0,0.15],[3.0623856,0.12,0.27,0.0,0.37,0.3,0.12],[3.1767292,0.1,0.0,0.0,0.0,0.33,0.0],[3.3037813,0.12,0.27,0.0,0.37,0.3,0.12],[3.3565729,0.0,0.87,0.0,0.0,0.33,0.0],[3.4016666,0.09,0.2,0.0,0.0,0.0,0.18],[3.4761562,0.25,0.27,0.0,0.22,0.57,0.15],[3.555646,0.0,0.92,0.0,0.0,0.33,0.0],[3.6256561,0.12,0.27,0.0,0.37,0.3,0.12],[3.738177,0.15,0.25,0.0,0.15,0.0,0.15],[3.8106875,0.0,0.0,0.0,0.0,0.0,0.0]]};
  return lg;
}






this.lipsyncHTML = function(){
  
  var htmlGUI = LS.GUI.getRoot();
  var lipsyncDiv = "<div id='lipsyncDiv' style='position: fixed; top: 50px; margin-left: 30px'><input id='textLipsync' type='text'><button id='sendLipsync' type='button'>Language Generation</button></div>";

  var div = document.createElement("div");
  div.innerHTML = lipsyncDiv;
  htmlGUI.appendChild(div); 
  
  inputText = htmlGUI.querySelector("#textLipsync");
  sendButton = htmlGUI.querySelector("#sendLipsync");
  
  
  foo = this;
  // Press enter
  console.log(inputText);
  inputText.onkeypress = function(e){
    if (e.keyCode == '13'){
      valueFixed = this.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
      if (valueFixed != ''){
        foo.callLGService(valueFixed, "test");
      	//that.ws.send(valueFixed);
        //htmlGUI.querySelector('#lipsyncDiv').remove();
      }
    }
  }
  
  // Click send
  sendButton.onclick = function(){
    valueFixed = inputText.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    if (valueFixed != ''){
      foo.callLGService(valueFixed, "test");
      //that.ws.send(valueFixed);
      //htmlGUI.querySelector('#lipsyncDiv').remove();
    }
  }

}

this.callLGService = function(sentence, filename){
  filename += Math.round(Math.random()*1000);
  
  req = new XMLHttpRequest();
  sentence = encodeURIComponent(sentence);
	req.open('GET', 'https://kristina.taln.upf.edu/synthesizer-service/process?sentence='+ sentence + '&name='+ filename, true);
	//req.setRequestHeader("Content-type", "application/json;charset=UTF-8");
	req.send();


  req.onreadystatechange = function () { //Call a function when the state changes.
      if (req.readyState == 4 && req.status == 200) {
        LS.Globals.lipsync(JSON.parse(req.responseText));
        console.log(JSON.parse(req.responseText));
      }
  }
  
}


