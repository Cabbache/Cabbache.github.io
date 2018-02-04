var player;
var playerImage;
var backgroundImage;
var playerThrImg;
var rot = 0;
var thrust = 0.1;
var thrustRot = 0.2;
var velx = 0;
var vely = 0;
var planetImgs = [];
var planets = [];
var difficulty = 1;

function preload() {
  planetImgs = [loadImage("p1.png"), loadImage("p2.png"), loadImage("p3.png"), loadImage("p4.png")];
  playerImage = loadImage("nyan.png");
  backgroundImage = loadImage("back.jpeg");
  playerThrImg = loadImage("go.png");
}

function setup() {
  createCanvas(screen.width - 30, screen.height - 30);
  player = createSprite(width/2, height/2, 0, 0);
}

function draw() {
    background(backgroundImage);
    drawSprites();
	player.position.x += velx;
	player.position.y += vely;
	rot = player.rotation % 360;
	if (Math.floor(Math.random()*150) == 5){
		var indx = Math.floor(Math.random()*planetImgs.length);
		var img = planetImgs[indx];
		planets[planets.length] = [createSprite(width+img.width/2, height*Math.random(), 0, 0),2 + (Math.random()*-8), indx];
		planets[planets.length-1][0].addImage(img);
	}
	for (k = 0;k < planets.length;k++){
		planets[k][0].position.x += planets[k][1];
		var radius = planetImgs[planets[k][2]].width/2;
		var distance = Math.sqrt(Math.pow(player.position.x - planets[k][0].position.x, 2) + Math.pow(player.position.y - planets[k][0].position.y, 2));
		if (distance < radius){
			alert("crash");
		}
	}
	if (rot > 0){
		rot = 360-rot;
	}
	else{
		rot = Math.abs(rot);
	}
	if (keyDown(RIGHT_ARROW)){
		player.rotationSpeed += thrustRot;
	}
	if (keyDown(LEFT_ARROW)){
		player.rotationSpeed -= thrustRot;
	}
	if (keyDown(UP_ARROW)){
		vely += -1*thrust*Math.sin((Math.PI*rot)/180.0);
		velx += thrust*Math.cos((Math.PI*rot)/180.0);
		player.addImage(playerThrImg);
	}
	else{
		player.addImage(playerImage);
	}
	if (player.position.x + playerImage.width/2 > width || player.position.x - playerImage.width/2 < 0){
		velx *= -1;
	}
	if (player.position.y + playerImage.height/2 > height || player.position.y-playerImage.height/2 < 0){
		vely *= -1;
	}
}
