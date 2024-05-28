//@Animation control
// Globals
if (!LS.Globals)
  LS.Globals = {};

LS.Globals.Anim = this;


// Start
this.onStart = function(){
  
  this.defineDialogueActs();
  
  //this.anims = ["stand2walk_f.wbin", "walk_f.wbin", "walk2stand_f.wbin"];
	this.path = "gerard/animations/";

	this.animComp = node.getComponents(LS.Components.PlayAnimation)[0];
  if (!this.animComp){
    console.log("Creating PlayAnimation Component");
    this.animComp = new LS.Components.PlayAnimation();
    node.addComponent(this.animComp);
  }
}


// Animation name as input
this.getEndAnim = function(){
  this.animComp.getDuration();
}

// Dialogue act as input
this.getEndDialogueAct = function(){
  
}

// Relates dialogue acts with specific animation clips
this.defineDialogueActs = function(){
  this.dialogueActs = {
    // Greetings
    SimpleGreet: ["laugh_79_70.wbin"],
    PersonalGreet: ["laugh_79_70.wbin"],
    SimpleSayGoodbye: ["laugh_79_70.wbin"],
    PersonalSayGoodbye: ["laugh_79_70.wbin"],
    MeetAgainSayGoodbye: ["laugh_79_70.wbin"],
    // Moods
    ShareJoy: ["laugh_79_70.wbin"],
    CheerUp: ["laugh_79_70.wbin"],
    CalmDown: ["laugh_79_70.wbin"],
    Console: ["laugh_79_70.wbin"],
    SimpleMotivate: ["laugh_79_70.wbin"],
    // Ask
    AskMood: ["laugh_79_70.wbin"],
    AskTask: ["laugh_79_70.wbin"],
    // Please repeat
    RequestRephrase: ["laugh_79_70.wbin"],
    RequestRepeat: ["laugh_79_70.wbin"],
    StateMissingComprehension: ["laugh_79_70.wbin"],
    // Thanks
    AnswerThank: ["laugh_79_70.wbin"],
    // Apologise
    SimpleApologise: ["laugh_79_70.wbin"],
    PersonalApologise: ["laugh_79_70.wbin"],
    // Statement
    Accept: ["laugh_79_70.wbin"],
    Acknowledge: ["laugh_79_70.wbin"],
    Reject: ["laugh_79_70.wbin"],    
  };
}


// --------------------- GESTURE ---------------------
// BML
// <gesture start ready strokeStart stroke strokeEnd relax end mode lexeme>
// mode [LEFT_HAND, RIGHT_HAND, BOTH_HANDS]
// lexeme [BEAT]
LS.Globals.gesture = function(gestData){
  console.log("here");
  var currentAnim = 1;
  var str = LS.Globals.Anim.path + LS.Globals.Anim.dialogueActs[gestData.lexeme];
  console.log("here2");
  LS.Globals.Anim.animComp.animation = str;
  LS.Globals.Anim.animComp.current_time = 0;
  LS.Globals.Anim.animComp.play();
  
  
}