var accx = 0;
var velx = 1;
var dispx = 0;
var accy = 0;
var vely = 0;
var dispy = 0;
var box = document.getElementById("box");

function move() {
    motion();
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function motion(){
    while (true)
    {
        dispx += velx;
        dispy += vely;
        velx += accx;
        vely += accy;
        
        box.style.marginLeft = dispx + "%";
        box.style.marginTop = dispy + "%";
        
        sleep(20);
    }
}