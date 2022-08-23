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
  gras = loadImage('gras.png'); 
  flowers = loadImage('flowers_plants.png'); 
  spiderweb = loadImage('spiderweb40.png'); 
  //spiderweb = loadImage('spiderweb.png'); 
}

function setup() {
  createCanvas(windowHeight*1.78, windowHeight); //画布大小跟随窗口
  //准备camera
  video = createCapture(VIDEO);
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

function draw() {
  background(0, 255, 0);
  image(video, 0, 0, width, width * video.height / video.width);
    
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
      if(sitdown - endsitdown >= 10){ //10s一个蜘蛛网
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
    }
  }

  //画出生成的蜘蛛网
  drawBox(detections);
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
    for(let j = 0; j < distanceXs.length; j += 1){
      image(spiderweb, x+distanceXs[j], y+distanceYs[j], 100, 100);
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
//let wilt = 0;
function net(){
  var alignedRect = detections[0].alignedRect;
  var x = alignedRect._box._x;
  var y = alignedRect._box._y;
  var boxWidth = alignedRect._box._width;
  var distanceX = Math.random()*(boxWidth-20);
  var distanceY = Math.random()*-150;
  distanceXs.push(distanceX);
  distanceYs.push(distanceY);
}


