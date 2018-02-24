var config = {
    apiKey: "AIzaSyBE6VSypEiZNBHI5xyIB4chNXk_KBTPNOI",
    authDomain: "game-5afa4.firebaseapp.com",
    databaseURL: "https://game-5afa4.firebaseio.com",
    projectId: "game-5afa4",
    storageBucket: "game-5afa4.appspot.com",
    messagingSenderId: "879191806496"
};
firebase.initializeApp(config);

var situation = firebase.database().ref();
var players = [];
var playersSprite = [];
var objs = [];
var myPname = "p";
var inPname = 0;
var speed = 5;

function setup() {
    createCanvas(screen.width - 30, screen.height - 30);
	situation.on("child_added", function (point) {Get(point);});
	situation.on("child_changed", function (point) {players = [];objs = [];Get(point);});
}

function draw() {
	while (objs.length <= 0){
		return;
	}
	background(255,127,0);
	drawSprites();
	if (myPname === "p"){
		Setup();
	}
	if (players.length > playersSprite.length){
		playersSprite.push(createSprite(200,200,50,50));
	}
	try{
		for (i = 0;i < playersSprite.length;i++){
			playersSprite[i].position.x = players[i].x;
			playersSprite[i].position.y = players[i].y;
			playersSprite[i].rotation = players[i].rot;
		}
	}
	catch (err){
	}

	if (keyDown(83)){
		Update(["Players", myPname, "y"], playersSprite[inPname].position.y + speed);
	}
	if (keyDown(87)){
		Update(["Players", myPname, "y"], playersSprite[inPname].position.y - speed);
	}
	if (keyDown(68)){
		Update(["Players", myPname, "x"], playersSprite[inPname].position.x + speed);
	}
	if (keyDown(65)){
		Update(["Players", myPname, "x"], playersSprite[inPname].position.x - speed);
	}
	if (keyDown(LEFT_ARROW)){
		Update(["Players", myPname, "rot"], playersSprite[inPname].rotation%360 - 5);
	}
	if (keyDown(RIGHT_ARROW)){
		Update(["Players", myPname, "rot"], playersSprite[inPname].rotation%360 + 5);
	}
}

function Get(data) {
	data.forEach(function(player) {
		players.push(player.val());
    });
	objs.push(data.val());
}

function Setup() {
	myPname += '' + players.length;
	inPname = players.length;
	for (i = 0;i < players.length;i++){
		playersSprite[i] = createSprite(players[i].x, players[i].y, 50, 50);
		playersSprite[i].rotation = players[i].rot;
	}
	inPname = playersSprite.length;
	playersSprite.push(createSprite(200,200,50,50));
	Update(["Players", myPname, "x"], playersSprite[inPname].position.x);
	Update(["Players", myPname, "y"], playersSprite[inPname].position.y);
	Update(["Players", myPname, "rot"], playersSprite[inPname].rotation);
}

function Update(dir, files) {
	var Sdir = "";
	for (i = 0;i < dir.length;i++){
		Sdir += dir[i] + '/';
	}
	firebase.database().ref(Sdir).set(files);
	return false;
}

window.onbeforeunload = function(){
   alert("closing");
}

window.addEventListener("beforeunload", function(e){
   alert("aa");
}, false);
