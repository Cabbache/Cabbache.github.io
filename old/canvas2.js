function setup() {
  createCanvas(480, 600);
}


function draw() {
  var max = 20;
  for (i = 0; i < max*5; i++) {
    ellipse(i*2*(Math.sin(i*(max/360)) + 1) + (width/2),(i*2*(Math.cos(i*(max/360)) + 1)) + height/2,50,50);
  } 
}
