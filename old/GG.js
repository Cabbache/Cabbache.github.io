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
var weapons = [];
var weapSprites = [];
var wcount = 0;
var wlent = 0;
var myPname = "p";
var inPname = 0;
var speed = 5;

function setup() {
    createCanvas(screen.width - 30, screen.height - 30);
	situation.on("child_added", function (point) {Get(point);});
	situation.on("child_changed", function (point) {players = [];objs = [];weapons = [];Get(point);});
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
			
			if (i == inPname){
				var p = i;
				var totwep = Twep(p);
				for (k = 0;k < wcount;k++){
					var curr = (p*4)+(totwep*3)+(3*k);
					Update(["Players", myPname, "a"+k+"rot"], weapons[curr]+2);
					Update(["Players", myPname, "a"+k+"x"], weapons[curr+1]+2);
					Update(["Players", myPname, "a"+k+"y"], weapons[curr+2]+2);
				}
			}
			if (wlent != weapons.length){
				while (weapSprites.length > 0){
					removeSprite(weapSprites.pop());
				}
				for (h = 0;h < players.length;h++){
					for (k = 0;k < players[h].wep;k++){
						var totwep = Twep(h);
						var sp = createSprite(weapons[(4*h) + (3*k) + (3*totwep) + 1], weapons[(4*h) + (3*k) + (3*totwep) + 2], 20, 20);
						sp.rotation = (4*h) + (3*k) + (3*totwep);
						weapSprites[totwep + k] = sp;
					}
				}
			}
			for (j = 0;j < players[i].wep;j++){
				var totwep = Twep(i);
				weapSprites[totwep + j].position.x = weapons[(i*4)+(totwep*3)+(j*3)+1];
				weapSprites[totwep + j].position.y = weapons[(i*4)+(totwep*3)+(j*3)+2];
				weapSprites[totwep + j].rotation = weapons[(i*4)+(totwep*3)+(j*3)];
			}
			wlent = weapons.length;
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
	if (keyDown(32)){
		Update(["Players", myPname, "a"+wcount+"x"], playersSprite[inPname].position.x);
		Update(["Players", myPname, "a"+wcount+"y"], playersSprite[inPname].position.y);
		Update(["Players", myPname, "a"+wcount+"rot"], playersSprite[inPname].rotation);
		Update(["Players", myPname, "wep"], wcount+1);
		wcount += 1;
	}
}

function Get(data) {
	data.forEach(function(player) {
		players.push(player.val());
		player.forEach(function(wep){
			weapons.push(wep.val());
		});
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
	Update(["Players", myPname, "wep"], 0);
}

function Update(dir, files) {
	var Sdir = "";
	for (i = 0;i < dir.length;i++){
		Sdir += dir[i] + '/';
	}
	firebase.database().ref(Sdir).set(files);
	return false;
}

function Twep(now){
	var totwep = 0;
	for (i = 0;i < now;i++){
		totwep += players[i].wep;
	}
	return totwep;
}
