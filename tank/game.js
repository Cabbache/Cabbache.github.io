const width = 42;
const height = 22;
const glob_headings = [[-1,0], [1,0], [0,-1], [0,1]];

//both inclusive
function randInt(min, max){
	return Math.floor(min+Math.floor(Math.random() * (max+1-min)));
}

function isEnabled(level, room){
	return getDoors(level, room) != 0;
}

//e.g getDoors(genLevel(), [2,1]) //[0,0] is bottom left [3,3] is top right
/*
	91011
	6 7 8
	3 4 5
	0 1 2

	14 17 20 23
	13 16 19 22
	12 15 18 21
*/
function getDoors(level, room){
	return (room[1] && level.connections >> 12 + room[0]*3 + room[1] - 1 & 1) << 3 | //DOWN
	(room[1] != 3 && level.connections >> 12 + room[0]*3 + room[1] & 1) << 2 | //UP
	(room[0] && level.connections >> room[1]*3 + room[0] - 1 & 1) << 1 | //LEFT
	(room[0] != 3 && level.connections >> room[1]*3 + room[0] & 1); //RIGHT
}

//https://stackoverflow.com/questions/24506555/how-to-find-the-number-of-1s-in-a-binary-representation-of-a-number
function num_doors(level){
	return level.connections.toString(2).split('1').length-1;
}

//room must be a neighbour of level.start
//assumes player is at level.start
function step(level, room){
	//TODO test if room is a neighbour?
	let copy = {...level};
	if (copy.start[1]) copy.connections &= ~(1 << (12 + copy.start[0]*3 + copy.start[1] - 1 + 1) - 1);
	if (copy.start[1] != 3) copy.connections &= ~(1 << (12 + copy.start[0]*3 + copy.start[1] + 1) - 1);
	if (copy.start[0]) copy.connections &= ~(1 << (copy.start[1]*3 + copy.start[0] - 1 + 1) - 1);
	if (copy.start[0] != 3) copy.connections &= ~(1 << (copy.start[1]*3 + copy.start[0] + 1) - 1);
	copy.start = room;
	return copy;
}

//get neighbouring rooms of room
function getNeighbours(level, room){
	let doors = getDoors(level, room);
	let neighbours = [];
	if (doors >> 0 & 1) neighbours.push([1,0]); //RIGHT
	if (doors >> 1 & 1) neighbours.push([-1,0]); //LEFT
	if (doors >> 2 & 1) neighbours.push([0,1]); //UP
	if (doors >> 3 & 1) neighbours.push([0,-1]); //DOWN
	return neighbours.map(x => [x[0]+room[0], x[1]+room[1]]);
}

function genValidLevel(){
	function genLevel(){
		let start = [0,0];
		let end = [0,0];
		while (start[0] == end[0] && start[1] == end[1]){
			start = [randInt(0, 3), randInt(0,3)];
			end = [randInt(0,3), randInt(0,3)];
		}

		return {
			start: start,
			end: end,
			currentRoom: start,
			connections: randInt(0, 1<<24), //level can have 24 doors max: 2^24 possible levels
			rooms: {0:{},1:{},2:{},3:{}}
		};
	}

	function isValid(level, required_depth, current_depth=0){
		let neighbours = getNeighbours(level, level.start);
		//base cases
		if (level.start[0] == level.end[0] && level.start[1] == level.end[1] && required_depth == current_depth)
			return true;

		if (neighbours.length == 0)
			return false;
		
		for (let i = 0;i < neighbours.length;i++){
			if (!isValid(step(level, neighbours[i]), required_depth, current_depth+1))
				return false;
		}
		
		return true;
	}

	let level;
	while (!isValid(level = genLevel(), randInt(3, 10)));//number of rooms between start,end is randint(3,10)

	for (let i = 0;i < 4;i++)
	for (let j = 0;j < 4;j++)
		level.rooms[i][j] = buildRoom(level, [i, j]);
	
	return level;
}

function makeNormal(maxHeight, width, fill, roughness){
	tally={}
	for (let j = 0;j < maxHeight*width*fill;j++){
		let sum = 0;
		for (let i = 0;i < width/roughness;i++)
			sum += randInt(0, roughness);
		if (tally[sum] == undefined)
			tally[sum] = 1;
		else if (tally[sum] < maxHeight)
			tally[sum]++;
	}

	return tally;
}

//returns length of shortest path, doors and tiles are not obstacles
//idea from https://www.geeksforgeeks.org/shortest-path-in-a-binary-maze/
function shortestLength(tiles, p1, p2){
	let visited = (new Array(tiles.length)).fill(0).map(x => new Array(tiles[0].length).fill(0));
	visited[p1[0]][p1[1]] = 1;
	let start = {
		h: p1[0],
		w: p1[1],
		dist: 0
	};
	let queue = [start];
	while (queue.length != 0){
		//debug
		//let str = "";
		//for (let a = 0;a < visited.length;a++){
		//	for (let b = 0;b < visited[0].length;b++){
		//		str += ","+visited[a][b];
		//	}
		//	str += "\n";
		//}
		//console.log(str);
		let pt = queue[0];
		if (pt.h == p2[0] && pt.w == p2[1])
			return pt.dist;

		queue.shift();
		glob_headings.forEach(
			function (x){
				let newpt = {
					h: pt.h + x[0],
					w: pt.w + x[1]
				};
				if (newpt.h < 0 || newpt.h >= visited.length || newpt.w < 0 || newpt.w >= visited[0].length)
					return;
				if (visited[newpt.h][newpt.w] || (tiles[newpt.h][newpt.w] && tiles[newpt.h][newpt.w] != 2))
					return;
				visited[newpt.h][newpt.w] = 1;
				newpt.dist = pt.dist+1;
				queue.push(newpt);
			}
		);
	}
	return -1;
}

function flood(tiles, p1, maxdist=5){
	let visited = (new Array(tiles.length)).fill(0).map(x => new Array(tiles[0].length).fill(0));
	visited[p1[0]][p1[1]] = 1;
	let start = {
		h: p1[0],
		w: p1[1],
		dist: 1
	};
	let queue = [start];
	while (queue.length != 0){
		let pt = queue[0];
		queue.shift();
		if (pt.dist >= maxdist)
			continue;

		glob_headings.forEach(
			function (x){
				let newpt = {
					h: pt.h + x[0],
					w: pt.w + x[1]
				};
				if (newpt.h < 0 || newpt.h >= visited.length || newpt.w < 0 || newpt.w >= visited[0].length)
					return;
				if (visited[newpt.h][newpt.w] || (tiles[newpt.h][newpt.w] && tiles[newpt.h][newpt.w] <= 4))
					return;
				visited[newpt.h][newpt.w] = pt.dist+1;
				newpt.dist = pt.dist+1;
				queue.push(newpt);
			}
		);
	}
	return visited;
}

function perc_covered(tiles){
	let cnt_covered = tiles.map(
		x => x.filter(tile => tile == 1).length
	).reduce(
		function(acc, a){return acc+a;},
		0
	);
	return cnt_covered / (tiles.length * tiles[0].length);
}

//returns true if for every door, there is a path to every other door, returns false otherwise.
function allDoorsHavePath(tiles){
	let doors = [];
	for (let i = 0;i < tiles.length;i++){
		for (let j = 0;j < tiles[i].length;j++){
			if (tiles[i][j] == 2)
				doors.push([i,j]);
		}
	}

	if (doors.length == 0)
		return true;
	else if (doors.length == 1)
		doors.push([tiles.length/2, tiles[0].length/2]);

	for (let i = 0;i < doors.length-1;i++){
		for (let j = i+1;j < doors.length;j++){
			if (shortestLength(tiles, [doors[i][0], doors[i][1]],[doors[j][0],doors[j][1]]) == -1){
				return false;
			}
		}
	}

	return true;
}

/*
	0 - free space
	1 - wall
	2 - door
	3 - tnt
	4 - oil
*/
function buildRoom(level, room){
	let doors = getDoors(level, room);
	let tiles = [];
	/*
		tiles[+][]
		 ^
		 |   up
		[1,1,1,1,1,1] |
left[1,0,0,0,0,1] H right
		[1,1,1,1,1,1] -> tiles[][+]
		    --W--
				down
	*/

	while (tiles.length == 0 || !allDoorsHavePath(tiles)){
		tiles = [];
		//make empty room with surrounding walls
		for (let i = 0;i < height;i++){
			let row = [];
			for (let j = 0;j < width;j++){
				if (i == 0 || i == height-1 || j == 0 || j == width-1)
					row.push(1);
				else
					row.push(0);
			}
			tiles.push(row);
		}

		//make door tiles
		if (doors >> 3 & 1) { //if theres a down door
			let door_pos = randInt(width*0.1, width*0.9);
			if (level.rooms[room[0]][room[1]-1] != undefined)
				door_pos = level.rooms[room[0]][room[1]-1][height-1].indexOf(2); //to make door in same place as connecting room
			tiles[0][door_pos] = 2;
		} if (doors >> 2 & 1) { //if theres an up door
			let door_pos = randInt(width*0.1, width*0.9);
			if (level.rooms[room[0]][room[1]+1] != undefined)
				door_pos = level.rooms[room[0]][room[1]+1][0].indexOf(2);
			tiles[height-1][door_pos] = 2;
		} if (doors >> 1 & 1) { //if theres a left door
			let door_pos = randInt(height*0.1, height*0.9);
			if (level.rooms[room[0]-1][room[1]] != undefined)
				door_pos = level.rooms[room[0]-1][room[1]].map(row => row[row.length-1]).indexOf(2);
			tiles[door_pos][0] = 2;
		} if (doors >> 0 & 1) { //if theres a right door
			let door_pos = randInt(height*0.1, height*0.9);
			if (level.rooms[room[0]+1][room[1]] != undefined)
				door_pos = level.rooms[room[0]+1][room[1]].map(row => row[0]).indexOf(2);
			tiles[door_pos][width-1] = 2;
		}

	//	let segment = 0;
	//	let randSize=randInt(7,10);
	//	while (segment + randSize < width){
	//		//TODO check if door lies between segment and segment + randSize
	//
	//		//create a normal distribution
	//		let tally = makeNormal(height/4, randSize, randInt(3,10)/10, randInt(2, 4));
	//		//let tally = makeNormal(height/4, randSize, 0.1, randInt(2, 6));
	//
	//		for (let i = 0;i < randSize;i++){
	//			if (tiles[0][i+segment] == 2)
	//				break;
	//			for (let j = 0;j < tally[i];j++){
	//				tiles[j+1][i+segment] = 1;
	//			}
	//		}
	//		
	//		segment += randSize;
	//		randSize = randInt(7,10);
	//	}

		for (let i = 0;i < 20;i++){
			let h1 = randInt(1,height-2);
			let w1 = randInt(1,width-2);
			tiles[h1][w1] = 1;
		}

		while (perc_covered(tiles) < 0.4){
			let i = randInt(2,height-3);
			let j = randInt(2,width-3);
			if (tiles[i][j] == 0) continue;
			let direction = [[0,1],[0,-1],[1,0],[-1,0]][randInt(0,3)];
			let pos = [i,j];
			while (tiles[pos[0]] && tiles[pos[0]][pos[1]]){
				pos[0] += direction[0];
				pos[1] += direction[1];
			}
			if (tiles[pos[0]] && tiles[pos[0]][pos[1]] != undefined)
				tiles[pos[0]][pos[1]] = 1;
		}

		for (let i=0;i<200;i++){
			let h1 = randInt(1,height-2);
			let w1 = randInt(1,width-2);
			if (tiles[h1][w1]) continue; //skip occupied
			if (//if walls touch at vertices
				tiles[h1+1][w1+0] && tiles[h1+0][w1+1] ||
				tiles[h1+0][w1+1] && tiles[h1-1][w1+0] ||
				tiles[h1-1][w1+0] && tiles[h1+0][w1-1] ||
				tiles[h1+0][w1-1] && tiles[h1+1][w1+0]
			){
				tiles[h1][w1] = 3;
			} else if ( //if walls cross
				tiles[h1+1][w1+0] && tiles[h1-1][w1+0] ||
				tiles[h1+0][w1+1] && tiles[h1+0][w1-1]
			) {
				tiles[h1][w1] = 4;//4
			}
		}

		for (let i = 0;i < 30;i++){
			let h1 = randInt(1,height-2);
			let w1 = randInt(1,width-2);
			if (tiles[h1][w1]) continue;
			if (randInt(0,40) == 0)
				tiles[h1][w1] = randInt(5,7);//powerups
			else
				tiles[h1][w1] = randInt(3,4);//traps
		}
	}
	

	return tiles;
}
