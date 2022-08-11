let textures = [];
let snow = [];
let w;
let h;

// ml5 Face Detection Model
let faceapi;
let detections = [];
// Video
let video;
const faceOptions = { 
  withLandmarks: true, 
  withExpressions: false, 
  withDescriptors: false
};

function preload() { //加载食物图片
  //spritesheet = loadImage('Ghostpixxells_pixelfood.png'); 
  // can = loadImage('farm-tool.png'); 
  // lake = loadImage('lake.png'); 
  gras = loadImage('gras.png'); 
  flowers = loadImage('flowers_plants.png'); 
  spiderweb = loadImage('spiderweb.png'); 
}

function setup() {
  //createCanvas(windowWidth, windowHeight); //画布大小跟随窗口
  createCanvas(windowHeight*1.78, windowHeight); //画布大小跟随窗口
  gravity = createVector(0, 0.5); //设定重力

  //裁剪鲜花素材
  w = flowers.width / 5;
  h = flowers.height / 4;
  //console.log(flowers.width, flowers.height, w, h);
  for (let x = 0; x < flowers.width; x += w) { 
    for (let y = 0; y < flowers.height; y += h) { 
      //console.log('🌟', x, y);
      let img = flowers.get(x, y, w, h); //获取单个鲜花图片
      image(img, x, y);
      textures.push(img); //放在textures里
    }
  }

  //准备camera
  video = createCapture(VIDEO);
  //video.size(windowWidth, windowHeight);
  video.size(windowHeight*1.78, windowHeight);
  video.hide(); //让video显示在canvas上而不是堆叠元素
  faceapi = ml5.faceApi(video, faceOptions, faceReady); //调用api
}

function modelReady() {
  select("#status").html("Model Loaded");
}

let sitdown;
let endsitdown; //start with undefined
let standup;
let posChange;

// let wilt = false;
function draw() {
  background(0, 255, 0);
  image(video, 0, 0, width, width * video.height / video.width);

  //围绕window四边画相框
    N =  windowWidth/16;
    M = windowHeight/16;
    for (let x = 0; x < N; x += 1){ //row
      image(gras, x*16, 0, 16, 16);
      image(gras, x*16, windowHeight-16, 16, 16);
    } 
    for (let y = 0; y < N; y += 1){ //column
      image(gras, 0, y*16, 16, 16);
      image(gras, windowWidth-16, y*16, 16, 16);
    } 
    
  //console.log(detections);
  //面部处理
  if (detections) { 
    //console.log(detections);
    if (detections.length > 0) {//采集到面部图像 
      posChange = 0;
      //drawLandmarks(detections); //画出五官
      sitdown = second();
      if(endsitdown == undefined){
        endsitdown = second();
      }
      console.log('sitdown time:', sitdown - endsitdown);
      if(sitdown - endsitdown >= 5){
        console.log('🕸️🕸️🕸️');
        net(detections);
        endsitdown = sitdown;
      }
      if (sitdown - endsitdown < 0){ //异常值修正
        endsitdown = second();
        sitdown = second()
      }
    }else if(detections.length == 0){ //面部出框 检测站立时间
      if(posChange == 0){
        endsitdown = sitdown;
        posChange = 1;
      }
      standup = second();
      console.log('standup time:', standup - endsitdown);
      if(standup - endsitdown == 2){
        distanceXs = [];
        distanceYs = [];
        wilt = 0;
      }
      if (standup - endsitdown >= 5){ //每站5s 产生鲜花
        console.log('🌹🌹🌹');
        blossom();
        endsitdown = standup;
      }else if (standup - endsitdown < 0){ //异常值修正
        //blossom();
        endsitdown = second();
        standup = second();
      }
    }
  }

  //画生成的鲜花
  for(let i = 0; i < series.length; i += 1){
    image(textures[series[i]], posXs[i], posYs[i], 32, 32);
  }

  //画出生成的蜘蛛网
  drawBox(detections);
  if(distanceXs.length >= 3 && wilt == false){
    console.log('🥀 🥀 🥀 ....');
    delPos = Math.round(Math.random() * (posXs.length - 0)) + 0;
    posXs.splice(delPos, 1);
    posYs.splice(delPos, 1);
    series.splice(delPos, 1);
    wilt = true;
  }
}

function faceReady() {
  faceapi.detect(gotFaces);
}


// Got faces
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  detections = result;
  faceapi.detect(gotFaces);
}

function drawLandmarks(detections) {
  noFill();
  stroke(161, 95, 251);
  strokeWeight(2);
  for (let i = 0; i < detections.length; i += 1) {
    const mouth = detections[i].parts.mouth;
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;
    drawPart(mouth, true);
    drawPart(nose, false);
    drawPart(leftEye, true);
    drawPart(leftEyeBrow, false);
    drawPart(rightEye, true);
    drawPart(rightEyeBrow, false);
    //return mouth
  }
}

function drawPart(feature, closed) {
  beginShape();
  for (let i = 0; i < feature.length; i += 1) {
    const x = feature[i]._x;
    const y = feature[i]._y;
    vertex(x, y);
  }
  if (closed === true) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

function drawBox(detections) {
  for (let i = 0; i < detections.length; i += 1) {
    const alignedRect = detections[i].alignedRect;
    const x = alignedRect._box._x;
    const y = alignedRect._box._y;
    const boxWidth = alignedRect._box._width;
    const boxHeight = alignedRect._box._height;
    noFill();
    stroke(161, 95, 251);
    strokeWeight(2);
    //rect(x, y, boxWidth, boxHeight);
    for(let j = 0; j < distanceXs.length; j += 1){
      image(spiderweb, x+distanceXs[j], y+distanceYs[j], 32, 32);
    }
  }
}


let number;
let posXs = [];
let posYs = [];
let series = [];
function blossom(){
  var number = Math.floor(Math.random() * 19); //随机选择一个鲜花
  series.push(number)
  var posX = Math.random() * windowWidth;
  var posY = Math.random() * windowHeight;
  if(Math.random()>=0.5){
    if(Math.random()>=0.5){ //x变为0或最大值
      posX = 0;
    }else{
      posX = windowWidth-32;
    }
  }else{
    if(Math.random()>=0.5){ //y变为0或最大值
      posY = 0;
    }else{
      posY = windowHeight-32; //
    }
  }
  posXs.push(posX);
  posYs.push(posY);
}


// Math.random() => [0, 1) => [0, 0.5), [0.5, 1)
//min ≤ num ≤ max
//Math.round(Math.random() * (max - min)) + min;
//parseInt(5/2) 丢弃小数部分，保留整数部分
let distanceXs = [];
let distanceYs = [];
let wilt = 0;
function net(){
  var alignedRect = detections[0].alignedRect;
  var x = alignedRect._box._x;
  var y = alignedRect._box._y;
  var boxWidth = alignedRect._box._width;
  var distanceX = Math.random()*(boxWidth-20);
  var distanceY = Math.random()*-150;
  distanceXs.push(distanceX);
  distanceYs.push(distanceY);
  console.log('🕸️/3:', parseInt(distanceXs.length/3), '🥀:', wilt, '🌹:', posXs.length); //每3个🕸️1个🥀
  if(parseInt(distanceXs.length/3)>wilt && posXs.length>0){
      console.log('🥀 🥀 🥀 ....');
      delPos = Math.round(Math.random() * (posXs.length - 0)) + 0;
      posXs.splice(delPos, 1);
      posYs.splice(delPos, 1);
      series.splice(delPos, 1);
      wilt += 1;
  }
}

