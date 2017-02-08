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
    SimpleGreet: {src: "packAnimations.wbin", range: [8.5,11]},
    PersonalGreet: {src: "packAnimations.wbin", range: [11,17.4]},
    SimpleSayGoodbye: {src: "packAnimations.wbin", range: [8.5,11]},
    PersonalSayGoodbye: {src: "packAnimations.wbin", range: [11,17.4]},
    MeetAgainSayGoodbye: {src: "packAnimations.wbin", range: [11,17.4]},
    // Moods
    ShareJoy: {src: "packAnimations.wbin", range: [36,41.35]},
    CheerUp: {src: "packAnimations.wbin", range: [36,41.35]},
    CalmDown: {src: "packAnimations.wbin", range: [27,32]},
    Console: {src: "packAnimations.wbin", range: [27,32]},
    SimpleMotivate: {src: "packAnimations.wbin", range: [17.9,22]},
    // Ask
    AskMood: {src: "packAnimations.wbin", range: [22,27]},
    AskTask: {src: "packAnimations.wbin", range: [22,27]},
    // Please repeat
    RequestRephrase: {src: "packAnimations.wbin", range: [22,27]},
    RequestRepeat: {src: "packAnimations.wbin", range: [22,27]},
    StateMissingComprehension: {src: "packAnimations.wbin", range: [22,27]},
    // Thanks
    AnswerThank: {src: "packAnimations.wbin", range: [31.7,35.7]},
    // Apologise
    SimpleApologise: {src: "packAnimations.wbin", range: [31.7,35.5]},
    PersonalApologise: {src: "packAnimations.wbin", range: [31.7,35.5]},
    // Statement
    Accept: {src: "packAnimations.wbin", range: [4.1,5.3]},
    Acknowledge: {src: "packAnimations.wbin", range: [31.7,35.5]},
    Reject: {src: "packAnimations.wbin", range: [5.6,8.2]}
  };
}


// --------------------- GESTURE ---------------------
// BML
// <gesture start ready strokeStart stroke strokeEnd relax end mode lexeme>
// mode [LEFT_HAND, RIGHT_HAND, BOTH_HANDS]
// lexeme [BEAT]
LS.Globals.gesture = function(gestData){

  var gestureInfo = LS.Globals.Anim.dialogueActs[gestData.lexeme]
  var str = LS.Globals.Anim.path + gestureInfo.src;
  
  var animComp = LS.Globals.Anim.animComp;
  if (animComp){
    animComp.animation = str;
  	animComp.range = gestureInfo.range;
  	animComp.current_time = 0;
  	animComp.mode = LS.Components.PlayAnimation.ONCE;
  	animComp.play();
  }
  
  
}