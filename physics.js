var accx = 0.01;
var velx = 0.1;
var dispx = 0;
var accy = 0.1;
var vely = 0;
var dispy = 9;
var rot = 0;
var rotvel = 0;
var rott = 0;
var rottvel = 0;
var added = false;
var box = document.getElementById("box");
var txt = document.getElementById("txt");
var hd = document.getElementById("headd");

async function move() {
    motion();
}

function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
}


async function motion(){
    while (true)
    {
        dispx += velx;
        dispy += vely;
        velx += accx;
        vely += accy;
        rot += rotvel;
        rott += rottvel;
        
        box.style.marginLeft = dispx + "%";
        box.style.marginTop = dispy + "%";
        box.style.transform = "rotate(" + rot + "deg)";
        txt.style.transform = "rotate(" + rott + "deg)";
        
        if (dispx < 0){
            velx *= -0.95;
            dispx = 1;
            rotvel += 1;
        }
        if (dispy < 0){
            vely *= -0.95;
            dispy = 1;
            rotvel += 1;
        }
        if (dispx > 90){
            velx *= -0.95;
            dispx = 89;
            rotvel += 1;
            if (added){
                rottvel += 2;
            }
        }
        if (dispy > 25){
            vely *= -0.95;
            dispy = 24;
            rotvel += 1;
        }
        if (rotvel == 40 && !added){
            velx *= 6;
            vely *= 6;
            added = true;
        }
        if (rottvel > 14){
            hd.style.color = "lime";
            hd.innerHTML = "WEEE";
        }
        await sleep(20);
    }
}