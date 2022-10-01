async function sound(){
    var audio = new Audio('sound.mp3');
    audio.play();
    var rot = 100;
    var btn = document.getElementById("btn");
    while (true){
        btn.style.transform = "rotate("+rot+"deg)";
        rot++;
        await sleep(30);
    }
    alert("ei");
}

function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
}
