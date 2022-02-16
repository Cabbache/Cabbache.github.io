function makeSphere(centre, radius, h, v, colour)
{
  let vertexList = [], indexList = [];
  for (let i = 0; i <= v + 1; i++) {
    for (let j = 0; j <= h; j++) {
      let theta = 2 * Math.PI * j / h;
      let y = (i / v - 0.5) * 2;
      let r = Math.sqrt(1 - y * y);
      let x = Math.cos(theta) * r; 
      let z = Math.sin(theta) * r;
      let point = [x, y, z];

      for (let k=0; k<3; k++)
        vertexList[vertexList.length] = point[k] * radius + centre[k];
      for (let k=0; k<3; k++)
        vertexList[vertexList.length] = point[k];
      for (let k=0; k<3; k++)
        vertexList[vertexList.length] = colour[k];

      vertexList[vertexList.length] = j/h;
      vertexList[vertexList.length] = i/v;
  }}
  
  for (let i = 0; i < v; i++) {
    for (let j = 0; j < h; j++) {
      indexList[indexList.length] = i * h + j;
      indexList[indexList.length] = (i + 1) * h + (j + 1) % h;
      indexList[indexList.length] = i * h + (j + 1) % h;
      indexList[indexList.length] = i * h + j;
      indexList[indexList.length] = (i + 1) * h + j;
      indexList[indexList.length] = (i + 1) * h + (j + 1) % h;
  }}

  return {vertex : vertexList, index : indexList};
};

//--------------------------------------------------------------------------------------------------------//
function makeQuad(positions, normals, colours, uvs)
{
  let vertexList = [], indexList = [];

  for (let i = 0; i < 4; ++i)
  {
    for (let k = 0; k<3; ++k)
     vertexList[vertexList.length] = positions[i][k];
    for (let k = 0; k<3; ++k)
     vertexList[vertexList.length] = normals[i][k];
    for (let k = 0; k<3; ++k)
     vertexList[vertexList.length] = colours[i][k];
    for (let k = 0; k<2; ++k)
     vertexList[vertexList.length] = uvs[i][k];
  }

  indexList[indexList.length] = 0;
  indexList[indexList.length] = 1;
  indexList[indexList.length] = 2;
  indexList[indexList.length] = 0;
  indexList[indexList.length] = 2;
  indexList[indexList.length] = 3;

  return {vertex : vertexList, index : indexList};
};

//--------------------------------------------------------------------------------------------------------//
// Convert Base64 encoded images to img objects and add them to DOM
//--------------------------------------------------------------------------------------------------------//
function convertTextures(textureList) {
  for (let e in textureList) {
    let img = document.createElement("img");
    let imgContainer = document.getElementById("imageCollection");
    img.src = textureList[`${e}`];
		img.style.position = 'absolute'; //having a lot of images causes them to make the window scroll
    imgContainer.appendChild(img);

    textureList[`${e}`] = img;
  };
}

function pythagoras(p1, p2){
	return Math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2);
}

//both inclusive
function randInt(min, max){
	return Math.floor(min+Math.floor(Math.random() * (max+1-min)));
}

function make_material(gl, shader, texture, ambient=1){
	let material = new Material();
  material.setAlbedo(gl, texture);
  material.setShininess(96.0);
  material.setSpecular([1,1,1]);
  material.setAmbient([ambient,ambient,ambient]);
  material.setDiffuse([1,1,1]);
  material.bind(gl, shader);
	return material;
}
