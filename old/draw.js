var config = {
	apiKey: "AIzaSyDimSvp2egwWWT084tuyB_iGWyphVV22Pc",
    authDomain: "draw-981e5.firebaseapp.com",
    databaseURL: "https://draw-981e5.firebaseio.com",
    projectId: "draw-981e5",
    storageBucket: "",
    messagingSenderId: "325886448116"
};
firebase.initializeApp(config);

var Csize = 5;
var pointsData = firebase.database().ref();
var points = [];

function setup() {
  var canvas = createCanvas(screen.width - 30, screen.height - 30);
  background(255);
  fill(0);
  pointsData.on("child_added", function (point) {
    points.push(point.val());
  });
  pointsData.on("child_removed", function () {
    points = [];
  });
  canvas.mouseMoved(function () {
    if (mouseIsPressed) {
      drawPoint();
    }
  });
}

function draw() {
  background(255);
  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    ellipse(point.x, point.y, point.z, point.z);
  }
  if (keyDown(UP_ARROW)){
  	Csize += 1;
  }
  if (keyDown(DOWN_ARROW)){
  	Csize -= 1;
  }
}

function drawPoint() {
  pointsData.push({x: mouseX, y: mouseY, z: Csize});
  return false;
}

$("#saveDrawing").on("click", saveDrawing);

function saveDrawing() {
  saveCanvas("Painter Orpheus");
}

$("#clearDrawing").on("click", clearDrawing);

function clearDrawing() {
  pointsData.remove();
  points = [];
}
