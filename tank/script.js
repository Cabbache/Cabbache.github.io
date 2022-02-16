'use strict';

var glob_canvas, glob_gl;
var glob_level_difficulty = 1;
var animate;

const glob_Mat4x4 = matrixHelper.matrix4;
const glob_Vec3 = matrixHelper.vector3;

var glob_roverNode;
var glob_turretRotation;
var glob_healthTransformNode; //parent of tank green part health bar
var glob_redhealthTransformNode; //parent of tank red part health bar
var glob_healthScaleNode; //tank green part health bar

var glob_enemy_spawnpoints = [];

var glob_wave_over = false;

const eightCw = glob_Mat4x4.create();
const eightCcw = glob_Mat4x4.create();
glob_Mat4x4.makeRotationZ(eightCw, Math.PI/8);
glob_Mat4x4.makeRotationZ(eightCcw, -Math.PI/8);

var glob_inertia = 0;
var glob_projectile_speed = 0.2;
var glob_islevelfinished = false;

//upgrades
var glob_projectile_bounce_count = 0;
var glob_max_projectiles = 4;
var glob_tank_projectile_damage = 30;

var glob_mobspeed = 0.03;
var glob_mob_activate_dist = 22; //unit is in tiles
var glob_AI_lookahead = 22;//this may be cpu intensive
var glob_mob_firerate = 200; //randInt(0,glob_mob_firerate)
var glob_spawnrate = 30;

const glob_turret_rotation_speed = 8;
const glob_maxinertia = 0.12;
const glob_acceleration = 0.005;
const glob_moveThresh = 0.006;
const glob_radius = 0.5;
const glob_healthbar_res = 20;//number of blocks that indicate health
const tileSize = 0.3;
const glob_roomsviewoffset = tileSize*width*10;
const glob_ripOffset = -tileSize*width*10;
const turret_breadth = tileSize;
const turret_length = 2.285 * turret_breadth;
const glob_damageblock_size = 0.1 * tileSize;
const glob_max_mobyellow_health = 100;
const glob_max_tank_health = 5000;
const glob_entity_collision_damage = 3;

const glob_trap_damage = 1000;
const glob_enemyprojectile_damage = 200;

var level;
var glob_lastFrame = 0;

var currentScene = 2; //0: game view, 1: rooms view, 2: start

var scene, light;
var tmp = glob_Mat4x4.create();

var glob_complete_scale = 0;

var glob_num_enemydestroyed = 0;

var
glob_tileMaterial,
glob_roverMaterial,
glob_turretMaterial,
glob_wallMaterial,
glob_doorMaterial,
glob_doorclosedMaterial,
glob_tntMaterial,
glob_oilMaterial,
glob_enemyMaterial,
glob_redMaterial,
glob_greenMaterial,
glob_upgrade_concurrentMaterial,
glob_upgrade_bounceMaterial,
glob_upgrade_damageMaterial,
glob_completeMaterial,
glob_pressMaterial,

bridge_material,
roomMaterial,
offRoomMaterial,
exitMaterial,

endestroyMaterial,
tombStoneMaterial,

d_zeroMaterial,
d_oneMaterial,
d_twoMaterial,
d_threeMaterial,
d_fourMaterial,
d_fiveMaterial,
d_sixMaterial,
d_sevenMaterial,
d_eightMaterial,
d_nineMaterial;

var glob_deg = 0;
var glob_observer_height = 12;
var observer = glob_Vec3.from(0,0,glob_observer_height);
var glob_observerLook_rot = glob_Mat4x4.create();
var glob_observerLook = glob_Vec3.from(0,5,glob_observer_height);

let vec_tmp = glob_Vec3.create();
glob_Vec3.to(vec_tmp, glob_observerLook);
glob_Mat4x4.makeRotationX(glob_observerLook_rot, -1 * Math.PI/180);
glob_Mat4x4.multiplyVector(glob_observerLook, glob_observerLook_rot, vec_tmp);
//scene.lookAt(observer, glob_observerLook, [0,1,0]);

var textureList = new Textures();
convertTextures(textureList);

const roomQuad = makeQuad(
	[[-2, -1, -5],[2, -1, -5],[2, 1, -5],[-2, 1, -5]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]
);

const completeQuad = makeQuad(
	[[-150, -44, -4.95],[150, -44, -4.95],[150, 44, -4.95],[-150, 44, -4.95]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]
);

const exitQuad = makeQuad(
	[[-1, -1, -4.9],[1, -1, -4.9],[1, 1, -4.9],[-1, 1, -4.9]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]	
);

const startQuad = makeQuad(
	[[-1, 5, glob_observer_height-1],[1, 5, glob_observer_height-1], [1, 5, glob_observer_height+1], [-1, 5, glob_observer_height+1]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]	
);

const tileQuad = makeQuad(
	[[-tileSize, -tileSize, -5],[tileSize, -tileSize, -5],[tileSize, tileSize, -5],[-tileSize, tileSize, -5]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]
);

const projectileQuad = makeQuad(
	[[-tileSize*0.3, -tileSize*0.3, -4.95],[tileSize*0.3, -tileSize*0.3, -4.95],[tileSize*0.3, tileSize*0.3, -4.95],[-tileSize*0.3, tileSize*0.3, -4.95]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]
);

const roverQuad = makeQuad(
	[[-tileSize, -tileSize, -4.99],[tileSize, -tileSize, -4.99],[tileSize, tileSize, -4.99],[-tileSize, tileSize, -4.99]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]
);

const damageQuad = makeQuad(
	[[0, 0, -4.99],[glob_damageblock_size, 0, -4.99],[glob_damageblock_size, glob_damageblock_size, -4.99],[0, glob_damageblock_size, -4.99]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]
);

const enemyQuad = makeQuad(
	[[-tileSize, -tileSize, -4.995],[tileSize, -tileSize, -4.995],[tileSize, tileSize, -4.995],[-tileSize, tileSize, -4.995]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]
);

const turretQuad = makeQuad(
	[[-turret_breadth/2, -turret_length/4, -4.98],[turret_breadth/2, -turret_length/4, -4.98],[turret_breadth/2, turret_length*0.75, -4.98],[-turret_breadth/2, turret_length*0.75, -4.98]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]
);

const doorCoverQuad = makeQuad(
	[[-1.5*tileSize, -tileSize, -4.97],[1.5*tileSize, -tileSize, -4.97],[1.5*tileSize, tileSize, -4.97],[-1.5*tileSize, tileSize, -4.97]],
	[[0,0,1], [0,0,1], [0,0,1], [0,0,1]],
	[[0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5], [0.5,0.5,0.5]],
	[[0,0], [1,0], [1,1], [0,1]]	
);

var keyState = {};
window.addEventListener('keydown',function(e){
    keyState[e.keyCode || e.which] = true;
},true);
window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
},true);

function keyAction(){
	let keys = Object.keys(keyState);
	for (let i = 0;i < keys.length;i++){
		let keyCode = keys[i];
		if (!keyState[keyCode]) continue;
		if (currentScene == 0 || currentScene == 1){
			if (keyCode == 27){ //Escape
				keyState[keyCode] = false;
				if (currentScene == 0){
					glob_Vec3.to(observer, [glob_roomsviewoffset + 3*5/2, glob_roomsviewoffset + 3*3/2, 22]);
					scene.lookAt(observer, [glob_roomsviewoffset + 3*5/2,glob_roomsviewoffset + 3*3/2,0], [0,1,0]);
				}
				currentScene = [1,0][currentScene];
			}
		}
		if (currentScene == 2){
			if (keyCode == 32){
				keyState[keyCode] = false;
				currentScene = 0;
				glob_deg--;
			}
		}
		if (currentScene == 0){
			if (keyCode == 32){ //space
				//add projectile node to current scene.
				let projectilesNode = scene.findNode("projectiles");
				if (projectilesNode.children.filter(x => x.nodeObject.name == "projectile").length >= glob_max_projectiles)
					continue;

				let projectileMaterial = make_material(glob_gl, scene.shaderProgram, textureList.projectile);
				let projectileModel = new Model();
				projectileModel.name = "projectile";
				projectileModel.index = projectileQuad.index;
				projectileModel.vertex = projectileQuad.vertex;
				projectileModel.compile(scene)
				projectileModel.material = projectileMaterial;

				let params = {
					bounces: 0,
					damage: glob_tank_projectile_damage
				};

				let projNode = scene.addNode(projectilesNode, projectileModel, params, Node.NODE_TYPE.MODEL)
				glob_Mat4x4.multiply(projNode.transform, glob_roverNode.transform, glob_turretRotation.transform);
				keyState[keyCode] = false;
			}else if (keyCode == 37){ // LEFT
				glob_Mat4x4.to(tmp, glob_turretRotation.transform);
				let rot = glob_Mat4x4.create();
				glob_Mat4x4.makeRotationZ(rot, glob_turret_rotation_speed*Math.PI/180);
				glob_Mat4x4.multiply(glob_turretRotation.transform, tmp, rot);
			}else if (keyCode == 39){ //RIGHT
				glob_Mat4x4.to(tmp, glob_turretRotation.transform);
				let rot = glob_Mat4x4.create();
				glob_Mat4x4.makeRotationZ(rot, -glob_turret_rotation_speed*Math.PI/180);
				glob_Mat4x4.multiply(glob_turretRotation.transform, tmp, rot);
			} else if (keyCode == 65){ //A
				glob_Mat4x4.to(tmp, glob_roverNode.transform);
				glob_Mat4x4.multiply(glob_roverNode.transform, tmp, eightCw);
				glob_Mat4x4.to(tmp, glob_healthTransformNode.transform);
				glob_Mat4x4.multiply(glob_healthTransformNode.transform, eightCcw, tmp);
				glob_Mat4x4.to(tmp, glob_redhealthTransformNode.transform);
				glob_Mat4x4.multiply(glob_redhealthTransformNode.transform, eightCcw, tmp);
				keyState[keyCode] = false;
			} else if (keyCode == 68){ //D
				glob_Mat4x4.to(tmp, glob_roverNode.transform);
				glob_Mat4x4.multiply(glob_roverNode.transform, tmp, eightCcw);
				glob_Mat4x4.to(tmp, glob_healthTransformNode.transform);
				glob_Mat4x4.multiply(glob_healthTransformNode.transform, eightCw, tmp);
				glob_Mat4x4.to(tmp, glob_redhealthTransformNode.transform);
				glob_Mat4x4.multiply(glob_redhealthTransformNode.transform, eightCw, tmp);
				keyState[keyCode] = false;
			} else if (keyCode == 87){ //W
				glob_inertia = Math.min(glob_maxinertia, glob_inertia + 10*glob_acceleration);
			} else if (keyCode == 83){ //S
				glob_inertia = Math.max(-glob_maxinertia, glob_inertia - 10*glob_acceleration);
			}
		}
	}
}

function makeScene(starting_door, is_first=false){
	if (starting_door == undefined && !is_first){
		console.log(glob_level_difficulty);
		level = genValidLevel(++glob_level_difficulty);

		//increase difficulty
		glob_mob_firerate -= 1;//this actually increases firerate
		glob_spawnrate -= 2;
		glob_mobspeed += 0.005;

		//start from room center
		starting_door = undefined;

		//reset tank health
		glob_redhealthTransformNode = undefined;
		glob_healthTransformNode = undefined;
		glob_roverNode = undefined;
	}

  scene = new Scene();
  scene.initialise(glob_gl, glob_canvas);

  light = new Light();
  light.type = Light.LIGHT_TYPE.POINT;
  light.setDiffuse([2, 1.7, 1]);
  light.setSpecular([0.03, 0.03, 0.03]);
  light.setAmbient([1, 1, 1]);
  light.setDirection([0, 0, -1]);
  light.setCone(0.1, 0.8);
  light.attenuation = Light.ATTENUATION_TYPE.NONE;

	bridge_material = make_material(glob_gl, scene.shaderProgram, textureList.bridge);
	roomMaterial = make_material(glob_gl, scene.shaderProgram, textureList.room);
	offRoomMaterial = make_material(glob_gl, scene.shaderProgram, textureList.room, 0.5);
	exitMaterial = make_material(glob_gl, scene.shaderProgram, textureList.exitSign);

	glob_tileMaterial = make_material(glob_gl, scene.shaderProgram, textureList.cobble);
	glob_roverMaterial = make_material(glob_gl, scene.shaderProgram, textureList.rover);
	glob_turretMaterial = make_material(glob_gl, scene.shaderProgram, textureList.turret);
	glob_wallMaterial = make_material(glob_gl, scene.shaderProgram, textureList.brick);
	glob_doorMaterial = make_material(glob_gl, scene.shaderProgram, textureList.door);
	glob_doorclosedMaterial = make_material(glob_gl, scene.shaderProgram, textureList.doorclosed);
	glob_oilMaterial = make_material(glob_gl, scene.shaderProgram, textureList.oil);
	glob_tntMaterial = make_material(glob_gl, scene.shaderProgram, textureList.tnt);
	glob_enemyMaterial  = make_material(glob_gl, scene.shaderProgram, textureList.enemy);
	glob_redMaterial  = make_material(glob_gl, scene.shaderProgram, textureList.red);
	glob_greenMaterial  = make_material(glob_gl, scene.shaderProgram, textureList.green);
	glob_completeMaterial  = make_material(glob_gl, scene.shaderProgram, textureList.complete);
	glob_upgrade_concurrentMaterial  = make_material(glob_gl, scene.shaderProgram, textureList.concurrent);
	glob_upgrade_damageMaterial = make_material(glob_gl, scene.shaderProgram, textureList.damage);
	glob_upgrade_bounceMaterial  = make_material(glob_gl, scene.shaderProgram, textureList.bounce);
	glob_pressMaterial = make_material(glob_gl, scene.shaderProgram, textureList.press);

	endestroyMaterial = make_material(glob_gl, scene.shaderProgram, textureList.en_destroy);
	tombStoneMaterial = make_material(glob_gl, scene.shaderProgram, textureList.tombstone);

	d_zeroMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_zero);
	d_oneMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_one);
	d_twoMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_two);
	d_threeMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_three);
	d_fourMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_four);
	d_fiveMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_five);
	d_sixMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_six);
	d_sevenMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_seven);
	d_eightMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_eight);
	d_nineMaterial = make_material(glob_gl, scene.shaderProgram, textureList.d_nine);

	let exitModel = new Model();
	exitModel.name = "exitSign";
	exitModel.index = exitQuad.index;
	exitModel.vertex = exitQuad.vertex;
	exitModel.compile(scene)
	exitModel.material = exitMaterial;
	
	let startModel = new Model();
	startModel.name = "start";
	startModel.index = startQuad.index;
	startModel.vertex = startQuad.vertex;
	startModel.compile(scene)
	startModel.material = glob_pressMaterial;

	let currentModel = new Model();
	currentModel.name = "current";
	currentModel.index = exitQuad.index;
	currentModel.vertex = exitQuad.vertex;
	currentModel.compile(scene)
	currentModel.material = glob_roverMaterial;

	let roverModel = new Model();
	roverModel.name = "rover";
	roverModel.index = roverQuad.index;
	roverModel.vertex = roverQuad.vertex;
	roverModel.compile(scene)
	roverModel.material = glob_roverMaterial;

	let turretModel = new Model();
	turretModel.name = "turret";
	turretModel.index = turretQuad.index;
	turretModel.vertex = turretQuad.vertex;
	turretModel.compile(scene);
	turretModel.material = glob_turretMaterial;

	let wallModel = new Model();
	wallModel.name = "wall";
	wallModel.index = tileQuad.index;
	wallModel.vertex = tileQuad.vertex;
	wallModel.compile(scene);
	wallModel.material = glob_wallMaterial;

	let redBlockModel = new Model();
	redBlockModel.index = damageQuad.index;
	redBlockModel.vertex = damageQuad.vertex;
	redBlockModel.material = glob_redMaterial;
	redBlockModel.compile(scene);

	let greenBlockModel = new Model();
	greenBlockModel.index = damageQuad.index;
	greenBlockModel.vertex = damageQuad.vertex;
	greenBlockModel.material = glob_greenMaterial;
	greenBlockModel.compile(scene);

	let completeModel = new Model();
	completeModel.name = "complete";
	completeModel.index = completeQuad.index;
	completeModel.vertex = completeQuad.vertex;
	completeModel.compile(scene);
	completeModel.material = glob_completeMaterial;
	
	let original_rotation = glob_Mat4x4.create();
	if (starting_door != undefined){
		glob_Mat4x4.to(original_rotation, glob_roverNode.transform);
		original_rotation[12] = original_rotation[13] = original_rotation[14] = 0; //remove the translation part
	}

  let lightNode = scene.addNode(scene.root, light, "lightNode", Node.NODE_TYPE.LIGHT);

	let pressNode = scene.addNode(scene.root, startModel, "start", Node.NODE_TYPE.MODEL);

	let completeScaleNode = scene.addNode(scene.root, null, "complete", Node.NODE_TYPE.GROUP);
	let completeNode = scene.addNode(completeScaleNode, completeModel, "complete", Node.NODE_TYPE.MODEL);
	glob_Mat4x4.makeScalingUniform(completeNode.transform, 0);

	let roomsNode = scene.addNode(lightNode, null, "rooms", Node.NODE_TYPE.GROUP);
	let bridgesNode = scene.addNode(lightNode, null, "bridges", Node.NODE_TYPE.GROUP);
	let horizontalBridges = scene.addNode(bridgesNode, null, "horizontalBridges", Node.NODE_TYPE.GROUP);
	let verticalBridges = scene.addNode(bridgesNode, null, "verticalBridges", Node.NODE_TYPE.GROUP);
	glob_Mat4x4.makeScaling(bridgesNode.transform, [0.3, 0.3, 1]);
	glob_Mat4x4.makeRotationZ(verticalBridges.transform, Math.PI/2);

	if (glob_roverNode == undefined)
		glob_roverNode = scene.addNode(scene.root, roverModel, {health: glob_max_tank_health, ipos: [0,0], flood:null}, Node.NODE_TYPE.MODEL);
	else
		glob_roverNode = scene.addNode(scene.root, roverModel, glob_roverNode.name, Node.NODE_TYPE.MODEL);

	glob_turretRotation = scene.addNode(scene.root, null, "turretRot", Node.NODE_TYPE.GROUP);
	let roomStatic = scene.addNode(lightNode, null, "staticElements", Node.NODE_TYPE.GROUP);
	let mobs = scene.addNode(lightNode, null, "mobs", Node.NODE_TYPE.GROUP);
	let projectilesNode = scene.addNode(lightNode, null, "projectiles", Node.NODE_TYPE.GROUP);
	let turretNode = scene.addNode(glob_turretRotation, turretModel, "turret", Node.NODE_TYPE.MODEL);
	
	glob_healthScaleNode = scene.addNode(lightNode, null, "hsn", Node.NODE_TYPE.GROUP);
	updateTankHealth();
	if (glob_healthTransformNode == undefined){
		glob_healthTransformNode = scene.addNode(glob_healthScaleNode, null, "htn", Node.NODE_TYPE.GROUP);
		glob_Mat4x4.makeTranslation(glob_healthTransformNode.transform, [-tileSize,tileSize*1.5,0]);
	}else{
		glob_Mat4x4.to(tmp, glob_healthTransformNode.transform);
		glob_healthTransformNode = scene.addNode(glob_healthScaleNode, null, "htn", Node.NODE_TYPE.GROUP);
		glob_Mat4x4.to(glob_healthTransformNode.transform, tmp);
	}
		
	let healthNode = scene.addNode(glob_healthTransformNode, greenBlockModel, "thm", Node.NODE_TYPE.MODEL);

	let trans = glob_Mat4x4.create();
	if (glob_redhealthTransformNode == undefined){
		glob_redhealthTransformNode = scene.addNode(lightNode, null, "rhtn", Node.NODE_TYPE.GROUP);
		glob_Mat4x4.makeScaling(tmp, [20,2.5,0.96]);
		glob_Mat4x4.makeTranslation(trans, [-tileSize,tileSize*1.5,0]);
		glob_Mat4x4.multiply(glob_redhealthTransformNode.transform, trans, tmp);
	} else {
		glob_Mat4x4.to(tmp, glob_redhealthTransformNode.transform);
		glob_redhealthTransformNode = scene.addNode(lightNode, null, "rhtn", Node.NODE_TYPE.GROUP);
		glob_Mat4x4.to(glob_redhealthTransformNode.transform, tmp);
	}

	let redHealthNode = scene.addNode(glob_redhealthTransformNode, redBlockModel, "rhn", Node.NODE_TYPE.MODEL);

	turretNode.transform = healthNode.transform = redHealthNode.transform = glob_roverNode.transform;//assigns the reference, this is very important
	
	let tiles = level.rooms[level.currentRoom[0]][level.currentRoom[1]].tiles;
	glob_enemy_spawnpoints = [];
	//loop on tiles to build game scene
	for (let i = 0;i < tiles.length;i++){
		let row = tiles[i];
		for (let j = 0;j < row.length;j++){
			if (row[j] == 2){//place sliding door
				let doorModel = new Model();
				doorModel.name = "door";
				doorModel.index = tileQuad.index;
				doorModel.vertex = tileQuad.vertex;
				doorModel.compile(scene)

				let doorCoverModel = new Model();
				doorCoverModel.name = "doorCover";
				doorCoverModel.index = doorCoverQuad.index;
				doorCoverModel.vertex = doorCoverQuad.vertex;
				doorCoverModel.compile(scene);

				let doorname;
				if (j == 0)
					doorname = "door_left";
				else if (j == row.length - 1)
					doorname = "door_right";
				else if (i == 0)
					doorname = "door_down";
				else if (i == tiles.length - 1)
					doorname = "door_up";
				else
					console.log("None");

				let door_fronts = {
					"door_left": [2*tileSize*((j+1)-(row.length/2)), 2*tileSize*(i-(tiles.length/2)), 0],
					"door_right": [2*tileSize*((j-1)-(row.length/2)), 2*tileSize*(i-(tiles.length/2)), 0],
					"door_up": [2*tileSize*(j-(row.length/2)), 2*tileSize*((i-1)-(tiles.length/2)), 0],
					"door_down": [2*tileSize*(j-(row.length/2)), 2*tileSize*((i+1)-(tiles.length/2)), 0]
				}

				doorCoverModel.material = doorname == starting_door ? glob_doorclosedMaterial:glob_doorMaterial;
				doorModel.material = glob_tileMaterial;
				let doorGroup = scene.addNode(roomStatic, null, "door", Node.NODE_TYPE.GROUP);
				let doorNode = scene.addNode(doorGroup, doorModel, doorname, Node.NODE_TYPE.MODEL);
				let doorCoveropenclose = scene.addNode(doorGroup, null, "coverT", Node.NODE_TYPE.GROUP);
				let doorCoverRot = scene.addNode(doorCoveropenclose, null, "coverRot", Node.NODE_TYPE.GROUP);

				if (j == 0 || j == row.length-1)
					glob_Mat4x4.makeRotationZ(doorCoverRot.transform, Math.PI/2);
				let doorCover = scene.addNode(doorCoverRot, doorCoverModel, "cover", Node.NODE_TYPE.MODEL);
				doorCover.transform = doorNode.transform;
				glob_Mat4x4.makeTranslation(doorNode.transform, [2*tileSize*(j-(row.length/2)), 2*tileSize*(i-(tiles.length/2)), 0]);

				if (starting_door != undefined && starting_door == doorname){ //set tank position to door
					glob_Mat4x4.makeTranslation(trans, door_fronts[starting_door]);
					glob_Mat4x4.to(tmp, glob_roverNode.transform);
					glob_Mat4x4.multiply(glob_roverNode.transform, tmp, original_rotation);
					glob_Mat4x4.to(tmp, glob_roverNode.transform);
					glob_Mat4x4.multiply(glob_roverNode.transform, trans, tmp);
					//TODO also turretRotation.transform
				} else glob_enemy_spawnpoints.push(door_fronts[doorname]);
				
				//placel light near one of exit doors
				if (doorname != starting_door){
					light.setPosition([2*tileSize*(j-(row.length/2)), 2*tileSize*(i-(tiles.length/2)), 0]);
					light.bind(glob_gl, scene.shaderProgram, 0);
					light.use(glob_gl);
				}
				
				continue;
			}
			
			//if actual tile, oil or tnt
			let tileModel = new Model();
			tileModel.index = tileQuad.index;
			tileModel.vertex = tileQuad.vertex;
			tileModel.compile(scene)
			switch(row[j]){
				case 0: tileModel.material = glob_tileMaterial;tileModel.name="tile";break;
				case 1: tileModel.material = glob_wallMaterial;tileModel.name="wall";break;
				case 3: tileModel.material = glob_tntMaterial;tileModel.name="tnt";break;
				case 4: tileModel.material = glob_oilMaterial;tileModel.name="oil";break;
				case 5: tileModel.material = glob_upgrade_bounceMaterial;tileModel.name="bounce";break;
				case 6: tileModel.material = glob_upgrade_damageMaterial;tileModel.name="damage";break;
				case 7: tileModel.material = glob_upgrade_concurrentMaterial;tileModel.name="concurrent";break;
			}
			let tileNode = scene.addNode(roomStatic, tileModel, tileModel.name, Node.NODE_TYPE.MODEL);
			glob_Mat4x4.makeTranslation(tileNode.transform, [2*tileSize*(j-(row.length/2)), 2*tileSize*(i-(tiles.length/2)), 0]);
		}
	}

	//make game over screen
	let ripModel = new Model();
	ripModel.name = "rip";
	ripModel.index = tileQuad.index;
	ripModel.vertex = tileQuad.vertex;
	ripModel.material = tombStoneMaterial;
	ripModel.compile(scene);
	let ripNode = scene.addNode(scene.root, ripModel, "rip", Node.NODE_TYPE.MODEL);
	glob_Mat4x4.makeScaling(tmp, [10,8,1]);
	glob_Mat4x4.makeTranslation(trans, [glob_ripOffset, glob_ripOffset - tileSize*4, 0]);
	glob_Mat4x4.multiply(ripNode.transform, trans, tmp);

	let enDestModel = new Model();
	enDestModel.name = "endest";
	enDestModel.index = tileQuad.index;
	enDestModel.vertex = tileQuad.vertex;
	enDestModel.material = endestroyMaterial;
	enDestModel.compile(scene);
	let enDestNode = scene.addNode(scene.root, enDestModel, "endest", Node.NODE_TYPE.MODEL);
	glob_Mat4x4.makeScaling(tmp, [10,1,1]);
	glob_Mat4x4.makeTranslation(trans, [glob_ripOffset - tileSize*5, glob_ripOffset + tileSize*7, 0]);
	glob_Mat4x4.multiply(enDestNode.transform, trans, tmp);

	let scoreText = glob_num_enemydestroyed.toString();
	for (let i = 0;i < scoreText.length;i++){
		let pos = glob_ripOffset + tileSize*(7+i*(1.8));//1.8 is digit spacing, 7 is margin from semi colon
		let digModel = new Model();
		digModel.name = "rip";
		digModel.index = tileQuad.index;
		digModel.vertex = tileQuad.vertex;
		digModel.material = [
			d_zeroMaterial,
			d_oneMaterial,
			d_twoMaterial,
			d_threeMaterial,
			d_fourMaterial,
			d_fiveMaterial,
			d_sixMaterial,
			d_sevenMaterial,
			d_eightMaterial,
			d_nineMaterial
		][Number(scoreText[i])];
		digModel.compile(scene);

		let digitNode = scene.addNode(scene.root, digModel, "digModel", Node.NODE_TYPE.MODEL);
		glob_Mat4x4.makeScaling(tmp, [0.75,1.08,1]);
		glob_Mat4x4.makeTranslation(trans, [pos, glob_ripOffset + tileSize*7, 0]);
		glob_Mat4x4.multiply(digitNode.transform, trans, tmp);
	}
	
	//loop to make rooms view
	for (let i = 0;i < 16;i++){
		let x = parseInt(i / 4);
		let y = i % 4;
		let doors = getDoors(level, [x, y]);
		let roomModel = new Model();
		roomModel.name = "room" + i;
		roomModel.index = roomQuad.index;
		roomModel.vertex = roomQuad.vertex;
		roomModel.compile(scene)
		if (doors)
			roomModel.material = roomMaterial;
		else
			roomModel.material = offRoomMaterial;
		let roomNode = scene.addNode(roomsNode, roomModel, "roomNode"+i, Node.NODE_TYPE.MODEL);
		if (x == level.end[0] && y == level.end[1]){
			scene.addNode(roomNode, exitModel, "exitSign", Node.NODE_TYPE.MODEL);
		} else if (x == level.currentRoom[0] && y == level.currentRoom[1]){
			scene.addNode(roomNode, currentModel, "current", Node.NODE_TYPE.MODEL);
		}

		glob_Mat4x4.makeTranslation(roomNode.transform, [glob_roomsviewoffset + x*5, glob_roomsviewoffset + y*3, 0]);
		for (let d = 0;d <= 2;d+=2){//d = 0: RIGHT, d = 2: UP
			if ((doors >> d & 1) == 0)
				continue;
			let bridgeModel = new Model();
			bridgeModel.name = "bridge_"+i+"_"+d;
			bridgeModel.index = roomQuad.index;
			bridgeModel.vertex = roomQuad.vertex;
			bridgeModel.compile(scene)
			bridgeModel.material = bridge_material;
			let bridgeNode = scene.addNode(d == 0 ? horizontalBridges:verticalBridges, bridgeModel, bridgeModel.name, Node.NODE_TYPE.MODEL);
			if (d == 0){
				glob_Mat4x4.makeTranslation(bridgeNode.transform, [glob_roomsviewoffset + x*5+2.5, glob_roomsviewoffset + y*3, 0]);
			} else {
				glob_Mat4x4.makeTranslation(bridgeNode.transform, [glob_roomsviewoffset + x*5, glob_roomsviewoffset + y*3+1.5, 0]);
			}
		}
	}

  let viewTransform = glob_Mat4x4.create(); 

  glob_Mat4x4.makeIdentity(viewTransform);

  scene.setViewFrustum(1, 100, 0.5236);

	glob_wave_over = false;
	animate = animate_game;
}

var animate_game=function() {
	let elasped = Date.now() - glob_lastFrame;
	if (elasped < 25){
		window.requestAnimationFrame(animate);
		return;
	}
	glob_lastFrame = Date.now();

	if (currentScene != 0){
		keyAction();
		scene.beginFrame();
		scene.animate();
		scene.draw();
		scene.endFrame();
		if (currentScene == 2){
			scene.lookAt(observer, glob_observerLook, [0,1,0]);
		} else if (currentScene == 3){
			glob_Vec3.to(observer, [glob_ripOffset, glob_ripOffset, 10]);
			scene.lookAt(observer, [glob_ripOffset, glob_ripOffset, 0], [0,1,0]);
		}
		window.requestAnimationFrame(animate);
		return;
	}

	let posTank = glob_Vec3.from(0,0,0);
	glob_Mat4x4.multiplyPoint(posTank, glob_roverNode.transform, [0,0,0]);

	if (glob_islevelfinished){
		glob_complete_scale += 0.001;
		let completeNode = scene.findNode("complete");
		glob_Mat4x4.makeScaling(completeNode.transform, [glob_complete_scale, glob_complete_scale, 1]);
		glob_Mat4x4.makeTranslation(completeNode.children[0].transform, [posTank[0], posTank[1], 0]);
		if (glob_complete_scale > 0.04){
			glob_islevelfinished = false;
			glob_complete_scale = 0;
			makeScene();
		}
		scene.beginFrame();
		scene.animate();
		scene.draw();
		scene.endFrame();
		window.requestAnimationFrame(animate);
		return;
	}

	if (glob_deg > -175 && glob_deg < 0){
		let vec_tmp = glob_Vec3.create();
		glob_observerLook = glob_Vec3.from(0,1,glob_observer_height);
		glob_Vec3.to(vec_tmp, glob_observerLook);
		glob_Mat4x4.makeRotationX(glob_observerLook_rot, glob_deg * Math.PI/180);
		glob_Mat4x4.multiplyVector(glob_observerLook, glob_observerLook_rot, vec_tmp);
		scene.lookAt(observer, glob_observerLook, [0,1,0]);
		scene.beginFrame();
		scene.animate();
		scene.draw();
		scene.endFrame();
		glob_deg--;
		window.requestAnimationFrame(animate);
		return;
	}

	let trans = glob_Mat4x4.create();

	let lightNode = scene.findNode("lightNode");
	let projectilesNode = scene.findNode("projectiles");
	let staticNode = scene.findNode("staticElements");
	let mobsNode = scene.findNode("mobs");

	let newIpos = world_to_index([posTank[0], posTank[1]]);
	if (newIpos[0] != glob_roverNode.name.ipos[0] || newIpos[1] != glob_roverNode.name.ipos[1]){
		glob_roverNode.name.flood = flood(level.rooms[level.currentRoom[0]][level.currentRoom[1]].tiles, newIpos, glob_AI_lookahead);
		glob_roverNode.name.ipos = newIpos;
	}

	//iterate on objects in scene
	staticNode.children.forEach(function(childNode) {
		let posObj = glob_Vec3.from(0,0,0);
		
		let is_starting = false;
		if (childNode.name == "door"){
			let doorCover = childNode.children[1];
			is_starting = doorCover.children[0].children[0].nodeObject.material == glob_doorclosedMaterial;
			if (glob_wave_over && !is_starting && doorCover.transform[12] <= 3*tileSize)
				doorCover.transform[12] += 0.02;
			childNode = childNode.children[0];
		}

		glob_Mat4x4.multiplyPoint(posObj, childNode.transform, [0,0,0]);

		//calc tank stuff
		let dist = pythagoras(posTank, posObj);
		if (dist < glob_radius){
			if (childNode.name == "wall" || is_starting || (childNode.name.startsWith("door_") && !glob_wave_over)){
				glob_Mat4x4.makeTranslation(trans, [0,-glob_inertia,0]); //move tank back by inertia
				glob_Mat4x4.to(tmp, glob_roverNode.transform);
				glob_Mat4x4.multiply(glob_roverNode.transform, tmp, trans);
				glob_inertia = 0.6*-glob_inertia; //0.6 is wall bounciness
			} else if (childNode.name.startsWith("door_")){
				let nextroom = "";
				if (childNode.name.endsWith("up")){
					level.currentRoom = [level.currentRoom[0], level.currentRoom[1]+1];
					nextroom = "door_down";
				} else if (childNode.name.endsWith("down")){
					level.currentRoom = [level.currentRoom[0], level.currentRoom[1]-1];
					nextroom = "door_up";
				}else if (childNode.name.endsWith("left")){
					level.currentRoom = [level.currentRoom[0]-1, level.currentRoom[1]];
					nextroom = "door_right";
				}else if (childNode.name.endsWith("right")){
					level.currentRoom = [level.currentRoom[0]+1, level.currentRoom[1]];
					nextroom = "door_left";
				}
				if (level.currentRoom[0] == level.end[0] && level.currentRoom[1] == level.end[1]){
					glob_islevelfinished = true;
				} else {
					makeScene(nextroom);
				}
				glob_inertia = 0;
			} else if (childNode.name == "oil") {
				glob_inertia *= glob_radius;
			} else if (childNode.name == "tnt") {
				glob_inertia /= -Math.abs(glob_inertia);
				glob_inertia *= 0.2;
				childNode.nodeObject.material = glob_tileMaterial;
				childNode.name = "tile";
				glob_roverNode.name.health -= glob_trap_damage;
				updateTankHealth();
				//TODO make flashing light
			} else if (childNode.name == "concurrent"){
				if (glob_max_projectiles < 8)
					glob_max_projectiles++;
				childNode.nodeObject.material = glob_tileMaterial;
				childNode.name = "tile";
			} else if (childNode.name == "damage"){
				glob_tank_projectile_damage += 4;
				childNode.nodeObject.material = glob_tileMaterial;
				childNode.name = "tile";
			} else if (childNode.name == "bounce"){
				if (glob_projectile_bounce_count < 3)
					glob_projectile_bounce_count++;
				childNode.nodeObject.material = glob_tileMaterial;
				childNode.name = "tile";
			}
		}

		projectilesNode.children.forEach(function(projNode){
			let posProj = glob_Vec3.from(0,0,0);
			glob_Mat4x4.multiplyPoint(posProj, projNode.transform, [0,0,0]);
			if (["tile","oil"].indexOf(childNode.name) == -1 && pythagoras(posProj, posObj) < glob_radius){
				if (projNode.name.bounces < glob_projectile_bounce_count && projNode.nodeObject.name != "badprojectile"){
					projNode.name.bounces++
					glob_Mat4x4.to(tmp, projNode.transform);

					//while in box
					//this loop is to determine if hit horizontal or vertical side of box
					while (
						posProj[0] > posObj[0]-glob_radius &&
						posProj[0] < posObj[0]+glob_radius &&
						posProj[1] > posObj[1]-glob_radius &&
						posProj[1] < posObj[1]+glob_radius
					){//move back
						glob_Mat4x4.makeTranslation(trans, [0,-0.01,0]);
						glob_Mat4x4.to(tmp, projNode.transform);
						glob_Mat4x4.multiply(projNode.transform, tmp, trans);
						glob_Mat4x4.multiplyPoint(posProj, projNode.transform, [0,0,0]);
					}
					let direction = false;
					if (
						posProj[0] > posObj[0]-glob_radius &&
						posProj[0] < posObj[0]+glob_radius
					){
						direction = true;
					}
					//grab projectile rotation
					//translate origin to 0,1,0
					//apply projectile's rotation to 0,1,0 about origin, call result x
					//x[0] and x[1] are now components -> [x[0],0,0] + [0,x[1],0] = x
					//invert the correct component: x[0] = -x[0] or x[1] = -x[1]
					//to go back to rotation matrix:
					//find angle between vectors [0,1,0] and [x[0],x[1],0]
					//get rotation matrix from that
					glob_Mat4x4.to(tmp, projNode.transform);
					glob_Mat4x4.makeTranslation(trans, [tmp[12], tmp[13], 0]);
					tmp[12] = tmp[13] = 0; //remove translation
					let transp = glob_Mat4x4.create();
					glob_Mat4x4.transpose(transp, tmp);
					let unit_vec = glob_Vec3.from(0,1,0);
					let rotated = glob_Vec3.create();
					glob_Mat4x4.multiplyPoint(rotated, tmp, unit_vec);
					if (!direction)
						rotated[0] = -rotated[0];
					if (direction)
						rotated[1] = -rotated[1];
					//let angle = Math.acos(
					//	glob_Vec3.dot([0,1,0], rotated)
					//);
					let angle = Math.acos(rotated[1]);
					if (rotated[0] > 0)
						angle = 2*Math.PI - angle;
					let newRotation = glob_Mat4x4.create();
					glob_Mat4x4.makeRotationZ(newRotation, angle);
					glob_Mat4x4.to(tmp, projNode.transform);
					glob_Mat4x4.multiply(projNode.transform, tmp, transp);
					glob_Mat4x4.to(tmp, projNode.transform);
					glob_Mat4x4.multiply(projNode.transform, tmp, newRotation);
					return;
				}
				projectilesNode.children.splice(projectilesNode.children.indexOf(projNode), 1);
				//TODO theyre not getting removed
			}

			//tank collision with enemy projectile
			if (projNode.nodeObject.name == "badprojectile" && pythagoras(posProj, posTank) < glob_radius){
				glob_roverNode.name.health -= projNode.name.damage;
				updateTankHealth();
				projectilesNode.children.splice(projectilesNode.children.indexOf(projNode), 1);
			}
		});
	});

	//move tank by intertia
	glob_Mat4x4.makeTranslation(trans, [0,Math.abs(glob_inertia) > glob_moveThresh ? glob_inertia:0,0]);
	glob_Mat4x4.to(tmp, glob_roverNode.transform);
	glob_Mat4x4.multiply(glob_roverNode.transform, tmp, trans);
	glob_inertia += glob_inertia > 0 ? -glob_acceleration:glob_acceleration;

	//move projectiles forward
	for (let i = 0;i < projectilesNode.children.length;i++){
		let child = projectilesNode.children[i];
		glob_Mat4x4.makeTranslation(trans, [0,glob_projectile_speed,0]);
		glob_Mat4x4.to(tmp, child.transform);
		glob_Mat4x4.multiply(child.transform, tmp, trans);
	}
	
	mobsNode.children.forEach(function(mobNode) {
		let transMobNode = mobNode.children[0];
		let posMob = [transMobNode.transform[12], transMobNode.transform[13]];
		glob_Mat4x4.to(tmp, transMobNode.transform);
		glob_Mat4x4.makeTranslation(trans, [mobNode.name.heading[0]*glob_mobspeed, mobNode.name.heading[1]*glob_mobspeed,0]);
		glob_Mat4x4.multiply(transMobNode.transform, tmp, trans);
		projectilesNode.children.forEach(function(projNode){
			if (projNode.nodeObject.name == "badprojectile")
				return;

			let projPos = glob_Vec3.from(0,0,0);
			glob_Mat4x4.multiplyPoint(projPos, projNode.transform, [0,0,0]);
			
			if (pythagoras(posMob, projPos) > glob_radius)
				return;

			//handle enemy - projectile collision
			mobNode.name.health -= projNode.name.damage;
			updateMobHealth(mobNode, mobsNode);
			projectilesNode.children.splice(projectilesNode.children.indexOf(projNode), 1);
		});

		let dist = pythagoras([transMobNode.transform[12], transMobNode.transform[13]], [posTank[0], posTank[1]]);
		if (dist / (2*tileSize) < glob_mob_activate_dist && randInt(0,glob_mob_firerate) == 0){
			let projectileMaterial = make_material(glob_gl, scene.shaderProgram, textureList.redproj);
			let projectileModel = new Model();
			projectileModel.name = "badprojectile";
			projectileModel.index = projectileQuad.index;
			projectileModel.vertex = projectileQuad.vertex;
			projectileModel.compile(scene)
			projectileModel.material = projectileMaterial;

			let params = {
				bounces: 0,
				damage: glob_enemyprojectile_damage
			};

			let angle = Math.atan2(posTank[1]-posMob[1], posTank[0]-posMob[0]) - Math.PI/2;

			angle += randInt(-15,15) * Math.PI/180.0; //add some inaccuracy

			let projNode = scene.addNode(projectilesNode, projectileModel, params, Node.NODE_TYPE.MODEL)
			let pRot = glob_Mat4x4.create();
			glob_Mat4x4.makeRotationZ(pRot, angle);
			glob_Mat4x4.makeTranslation(tmp, [posMob[0], posMob[1], 0]);
			glob_Mat4x4.multiply(projNode.transform, tmp, pRot);
		}
		if (dist < glob_radius){
			mobNode.name.health-=glob_entity_collision_damage;
			glob_roverNode.name.health-=glob_entity_collision_damage;
			updateMobHealth(mobNode, mobsNode);
			updateTankHealth();
		}

		if ((mobNode.name.heading[0] == 0 && mobNode.name.heading[1] == 0) || (Math.abs(Math.abs(Math.abs(transMobNode.transform[12] % (2*tileSize)) - tileSize) - tileSize) <= glob_mobspeed && Math.abs(Math.abs(Math.abs(transMobNode.transform[13] % (2*tileSize)) - tileSize) - tileSize) <= glob_mobspeed)){//if mob in center of tile
			let ipos = world_to_index([transMobNode.transform[12], transMobNode.transform[13]]);
			let hpos = ipos[0]
			let wpos = ipos[1];
			//without this they might get stuck
			if (mobNode.name.lastblock.w == wpos && mobNode.name.lastblock.h == hpos && (mobNode.name.heading[0] != 0 && mobNode.name.heading[1] != 0))
				return;
			let index = hpos*width + wpos;
			let blockNode = staticNode.children[index];
			mobNode.name.lastblock.w = wpos;
			mobNode.name.lastblock.h = hpos;
			//necesarry?
			//transMobNode.transform[12] = blockNode.transform[12];
			//transMobNode.transform[13] = blockNode.transform[13];

			let possible = [];
			glob_headings.forEach(function(x){
				let indx = width*(hpos+x[1]) + (wpos+x[0]);
				let bNode = staticNode.children[indx];
				if (bNode.name == "tile")
					possible.push(x);
			});

			if (possible.length == 0){
				mobNode.name.heading = [0,0];
				return;
			}
			if (pythagoras(posTank, posMob) > glob_mob_activate_dist || glob_roverNode.name.flood == null || possible.length == 1 || glob_roverNode.name.flood[hpos][wpos] == 0){
				if (possible.length >= 2)//so they dont go back where they came from TODO allow small probability
					possible = possible.filter(pos => pos[0] != -mobNode.name.heading[0] || pos[1] != -mobNode.name.heading[1]);
				mobNode.name.heading = possible[randInt(0, possible.length-1)];
				return;
			} else {
				let currentDist = glob_roverNode.name.flood[hpos][wpos];
//				console.log(currentDist);
//				let test = glob_roverNode.name.flood;
//				let string = "";
//				for (let i = 0;i < test.length;i++){
//					for (let j = 0;j < test[0].length;j++){
//							string += test[i][j] + " ";
//					}
//					string += "\n";
//				}
//				console.log(string);
				possible = possible.filter(pos => glob_roverNode.name.flood[hpos+pos[1]][wpos+pos[0]] < currentDist && glob_roverNode.name.flood[hpos+pos[1]][wpos+pos[0]] != 0);
				if (possible.length == 0) //enemy is colliding with tank
					mobNode.name.heading = [0,0]; //do not move enemy;
				else
					mobNode.name.heading = possible[randInt(0, possible.length-1)];
			}
		}
	});

	//move camera with player
	glob_Vec3.to(observer, [posTank[0], posTank[1], glob_observer_height]);
	scene.lookAt(observer, [posTank[0], posTank[1], 0], [0,1,0]);

	//spawn enemy in room
	if (randInt(0,glob_spawnrate) == 0 && level.rooms[level.currentRoom[0]][level.currentRoom[1]].num_enemies){
		level.rooms[level.currentRoom[0]][level.currentRoom[1]].num_enemies--;
		let enemyNode = scene.addNode(mobsNode, null, {heading: [0,0], lastblock: {w: 0, h: 0}, health: glob_max_mobyellow_health}, Node.NODE_TYPE.GROUP);

		let redBlockModel = new Model();
		redBlockModel.index = damageQuad.index;
		redBlockModel.vertex = damageQuad.vertex;
		redBlockModel.material = glob_redMaterial;
		redBlockModel.compile(scene);

		let greenBlockModel = new Model();
		greenBlockModel.index = damageQuad.index;
		greenBlockModel.vertex = damageQuad.vertex;
		greenBlockModel.material = glob_greenMaterial;
		greenBlockModel.compile(scene);

		let enemyModel = new Model();
		enemyModel.index = enemyQuad.index;
		enemyModel.vertex = enemyQuad.vertex;
		enemyModel.material = glob_enemyMaterial;
		enemyModel.compile(scene);

		let enemymodelNode = scene.addNode(enemyNode, enemyModel, "modelnode", Node.NODE_TYPE.MODEL);
		glob_Mat4x4.makeTranslation(enemymodelNode.transform, glob_enemy_spawnpoints[randInt(0,glob_enemy_spawnpoints.length-1)]);

		let redScaleNode = scene.addNode(enemyNode, null, "redscale", Node.NODE_TYPE.GROUP);
		glob_Mat4x4.makeScaling(redScaleNode.transform, [20,2.5,1]);

		let greenScaleNode = scene.addNode(enemyNode, null, "greenscale", Node.NODE_TYPE.GROUP);
		glob_Mat4x4.makeScaling(greenScaleNode.transform, [20,2.5,0.999]);

		let redTransNode = scene.addNode(redScaleNode, null, "redtrans", Node.NODE_TYPE.GROUP);
		let greenTransNode = scene.addNode(greenScaleNode, null, "greentrans", Node.NODE_TYPE.GROUP);
		redTransNode.transform = greenTransNode.transform = enemymodelNode.transform;//important

		let redModelNode = scene.addNode(redTransNode, redBlockModel, "redmodel", Node.NODE_TYPE.MODEL);
		glob_Mat4x4.makeTranslation(redModelNode.transform, [-tileSize,tileSize*1.2,0]);

		let greenModelNode = scene.addNode(greenTransNode, greenBlockModel, "greenmodel", Node.NODE_TYPE.MODEL);
		glob_Mat4x4.makeTranslation(greenModelNode.transform, [-tileSize,tileSize*1.2,0]);
	}

	scene.beginFrame();
	scene.animate();
	scene.draw();
	scene.endFrame();

	keyAction();
	window.requestAnimationFrame(animate);
};

//return true if mob died
function updateMobHealth(mobNode, mobsNode){
	if (mobNode.name.health <= 0){
		mobsNode.children.splice(mobsNode.children.indexOf(mobNode), 1);
		glob_num_enemydestroyed++;
		if (mobsNode.children.length == 0 && level.rooms[level.currentRoom[0]][level.currentRoom[1]].num_enemies == 0){
			glob_wave_over = true;
		}
	}
	let scale_green = Math.round(20 * mobNode.name.health / glob_max_mobyellow_health);
	glob_Mat4x4.makeScaling(mobNode.children[2].transform, [scale_green, 2.5, 0.999]);
}

function updateTankHealth(){
	if (glob_roverNode.name.health <= 0){
		currentScene = 3;
		return;
	}
	glob_Mat4x4.makeScaling(glob_healthScaleNode.transform, [20*glob_roverNode.name.health/glob_max_tank_health,2.5,0.95]);
}

function world_to_index(world){
	return [Math.round(world[1] / (2*tileSize)) + height/2, Math.round(world[0] / (2*tileSize)) + width/2];
}

let main=function() 
{
	glob_canvas = document.getElementById("canvas-cg-lab");
	glob_canvas.width = window.innerWidth;
	glob_canvas.height = window.innerHeight > window.innerWidth ? window.innerWidth:window.innerHeight;
	glob_canvas.aspect = glob_canvas.width / glob_canvas.height;

	// Assign context to gl
	glob_gl = null;
	try { glob_gl = glob_canvas.getContext("experimental-webgl", {antialias: true}); }
	catch (e) {alert("No webGL compatibility detected!"); return false;}

	level = genValidLevel(glob_level_difficulty);
	makeScene(undefined, true);

	animate();
};
