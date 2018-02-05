var player;
var food;
var foodImage;
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
var planetcount = 0;

function preload() {
  planetImgs = [loadImage("p1.png"), loadImage("p2.png"), loadImage("p3.png"), loadImage("p4.png"), loadImage("p5.png")];
  playerImage = loadImage("nyan.png");
  backgroundImage = loadImage("back.jpeg");
  playerThrImg = loadImage("go.png");
  foodImage = loadImage("food.png");
}

function setup() {
  createCanvas(screen.width - 30, screen.height - 30);
  player = createSprite(width/2, height/2, 0, 0);
  food = createSprite(-foodImage.width,-foodImage.height,0,0);
  food.addImage(foodImage);
  food.rotationSpeed = 1;
  food.position.x = (Math.random()*(width - foodImage.width))+foodImage.width;
  food.position.y = (Math.random()*(height - foodImage.height))+foodImage.height;
}

function draw() {
    background(backgroundImage);
    drawSprites();
	player.position.x += velx;
	player.position.y += vely;
	rot = player.rotation % 360;
	if (planetcount < difficulty){
		var indx = Math.floor(Math.random()*planetImgs.length);
		var img = planetImgs[indx];
		planets[planets.length] = [createSprite(width + img.width/2, Math.random()*height, 0, 0),-0.1 + (Math.random()*-4), indx];
		planets[planets.length-1][0].addImage(img);
		planets[planets.length-1][0].rotationSpeed = (Math.random()*2)-1;
	}
	planetcount = 0;
	for (k = 0;k < planets.length;k++){
		if (planets[k][0].position.x > -1*(planetImgs[planets[k][2]].width)){
			planetcount += 1;
			planets[k][0].position.x += planets[k][1];
			var radius = planetImgs[planets[k][2]].width/2;
			var distance = Math.sqrt(Math.pow(player.position.x - planets[k][0].position.x, 2) + Math.pow(player.position.y - planets[k][0].position.y, 2));
			if (distance < radius){
				alert("crash. Your score is " + (difficulty-1));
				window.location.reload();
			}
			var mass = Math.PI*Math.pow(radius,2);
			var consG = 5000;
			var pull = mass/(consG*distance);
			var angle = Math.atan((player.position.y - planets[k][0].position.y)/(player.position.x - planets[k][0].position.x));
			var dir = 1;
			if (player.position.x > planets[k][0].position.x){
				dir = -1;
			}
			vely += pull*Math.sin(angle)*dir;
			velx += pull*Math.cos(angle)*dir;
		}
	}
	if (player.overlap(food)){
		difficulty += 1;
		thrust += 0.05;
		food.position.x = (Math.random()*(width - foodImage.width))+foodImage.width;
		food.position.y = (Math.random()*(height - foodImage.height))+foodImage.height;
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
