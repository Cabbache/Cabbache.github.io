var config = {
	apiKey: "AIzaSyDimSvp2egwWWT084tuyB_iGWyphVV22Pc",
    authDomain: "draw-981e5.firebaseapp.com",
    databaseURL: "https://draw-981e5.firebaseio.com",
    projectId: "draw-981e5",
    storageBucket: "",
    messagingSenderId: "325886448116"
};
//var k = 1;
firebase.initializeApp(config);

var pointsData = firebase.database().ref();
var points = [];

function setup() {
  var canvas = createCanvas(screen.width - 30, screen.height - 30);
  background(255);
  fill(0);
  pointsData.on("child_added", function (point) {
    points.push(point.val());
  });
  //canvas.mousePressed(drawPoint);
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
    ellipse(point.x, point.y, 5, 5);
  }
  //if keyDown(UP_ARROW){
  //	alert(points.length);
 // }
}

function drawPoint() {
  pointsData.push({x: mouseX, y: mouseY});
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
