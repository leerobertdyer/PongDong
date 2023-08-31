let rectX = 15;
let rectY = 20;
let rectW = 25;
let rectH = 25;
let v;
let direction;
let ball;
let p1, p2;
let b1, b2, b3, b4, b5, b6, b7, b8, b9, b10;
let p1s;
let p2s;
var r = 255;
var g = 255;
var b = 255;
let playerNumber;
let socket;
let w = 400;
let h = 400;
let blocks = [];


function setup() {
  createCanvas(w, h);
  ball = new Ball(30, 30, 20);
  p1 = new Paddle(w / 2, 0, 20, 80);
  p2 = new Paddle(w / 2, h - 20, 20, 80);
  b1 = new Block(0, 0, 10, w / 5, 255, 255, 0);
  b2 = new Block((1 / 5) * w, 0, 10, w / 5, 255, 100, 0);
  b3 = new Block((2 / 5) * w, 0, 10, w / 5, 155, 77, 67);
  b4 = new Block((3 / 5) * w, 0, 10, w / 5, 98, 244, 255);
  b5 = new Block((4 / 5) * w, 0, 10, w / 5, 29, 199, 100);
  b6 = new Block(0, h - 10, 10, w / 5, 255, 255, 0);
  b7 = new Block((1 / 5) * w, h - 10, 10, w / 5, 255, 100, 0);
  b8 = new Block((2 / 5) * w, h - 10, 10, w / 5, 155, 77, 67);
  b9 = new Block((3 / 5) * w, h - 10, 10, w / 5, 98, 244, 255);
  b10 = new Block((4 / 5) * w, h - 10, 10, w / 5, 0, 20, 88);
  blocks.push(b1, b2, b3, b4, b5, b6, b7, b8, b9, b10);
  v = createVector(1, 1);
  socket = io.connect("https://pongdong.glitch.me");

  document.getElementById("startButton").addEventListener("click", startGame);

  function startGame() {
    socket.emit("playerReady");
    document.getElementById("startButton").disabled = true;
  }

  socket.on("connect", function () {
    socket.emit("gameVariables", {
      width: w,
      height: h,
      p1x: p1.x,
      p1y: p1.y,
      p1h: p1.h,
      p1w: p1.w,
      p2x: p2.x,
      p2y: p2.y,
      p2h: p2.h,
      p2w: p2.w,
      blocks: blocks,
    });
  });
  socket.on("gameId", function (data) {
    const gameId = data.id;
    document.getElementById("gameId").innerHTML = `Game ID: ${gameId}`;
  });

  socket.on("playerNumber", function (number) {
    playerNumber = number;
  });

  socket.on("otherPlayerPosition", function (data) {
    if (data.playerNumber === 1) {
      p1.x = data.x;
    } else {
      p2.x = data.x;
    }
  });

  socket.on("gameState", function (gameState) {
    ball.pos.x = gameState.ball.pos.x;
    ball.pos.y = gameState.ball.pos.y;
    ball.vel.x = gameState.ball.vel.x;
    ball.vel.y = gameState.ball.vel.y;
  });

  socket.on("blocks", (blockUpdate) => {
    const blockDataArray = blockUpdate;
    blocks = blockDataArray.map((blockData) => {
      return new Block(
        blockData.x,
        blockData.y,
        blockData.h,
        blockData.w,
        blockData.r,
        blockData.g,
        blockData.b
      );
    });
  });

  socket.on("p1Scored", function (scores) {
    document.getElementById("pong").innerHTML = "Player One Scored!";
    document.getElementById("pong").style.backgroundColor = "red";
    document.getElementById("p1s").innerHTML = scores.p1;
    timer = millis();
    timerCheck = true;
  });

  socket.on("p2Scored", function (scores) {
    document.getElementById("pong").innerHTML = "Player Two Scored!";
    document.getElementById("pong").style.backgroundColor = "red";
    document.getElementById("p2s").innerHTML = scores.p2;
    timer = millis();
    timerCheck = true;
  });
  
  socket.on("gameReady", () => {
  document.getElementById("startButton").style.display = "none";
  document.getElementById("countdown").style.display = "block";
  const countdownVideo = document.getElementById("countdownVideo");
  countdownVideo.play();
  countdownVideo.addEventListener("ended", () => {
    document.getElementById("countdown").style.display = "none";
      });
     setTimeout(() => {
      socket.emit('videoOver')
    }, 4000);
    
});

  socket.on("playerDisconnected", () => {
    document.getElementById("startButton").style.display = "inline";
    document.getElementById("startButton").disabled = false;
    document.getElementById("startButton").innerHTML = "Refresh";
    document.getElementById("startButton").removeEventListener("click", startGame);
    document.getElementById("startButton").onclick = refreshPage;
  });
}

function refreshPage() {
  window.location.reload();
}
function changeColor() {
  r = random(255);
  g = random(0);
  b = random(0);
}

class Block {
  constructor(x, y, h, w, r, g, b) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
    this.r = r;
    this.g = g;
    this.b = b;
  }
  draw() {
    fill(this.r, this.g, this.b);
    rect(this.x, this.y, this.w, this.h);
  }
}

class Ball {
  constructor(x, y, d) {
    this.pos = createVector(x, y);
    this.d = d;
    this.vel = createVector(4, 4);
  }

  draw() {
    fill(r, g, b);
    circle(this.pos.x, this.pos.y, this.d);
  }
}

class Paddle {
  constructor(x, y, h, w) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
  }
  draw() {
    fill(155, 100, 0);
    rect(this.x, this.y, this.w * .15, this.h)
    fill(222, 188, 155);
    rect(this.x + this.w * .15, this.y, this.w * .7, this.h);
    fill(155, 100, 0);
    rect(this.x + this.w * .7, this.y, this.w * .15, this.h)
  }

  move() {
    this.x = mouseX;
    if (this.x > w - (this.w + 5)) {
      this.x = w - (this.w + 5);
    }
    if (this.x <= 0) {
      this.x = 0;
    }
  }
}

function mouseMoved() {
  if (playerNumber === 1) {
    p1.move();
    sendPaddle(p1.x);
  } else if (playerNumber === 2) {
    p2.move();
    sendPaddle(p2.x);
  }
}

function sendPaddle(paddleX) {
  const data = {
    playerNumber: playerNumber,
    x: paddleX,
  };
  socket.emit("paddlePosition", data);
}

let timerCheck = false;
let timer = 0;
let pH = 0;

function draw() {
  background(100, 200, 100);
  if (millis() - timer < 400 && millis() - timer > 0) {
    changeColor();
  }
  if (millis() - timer > 400) {
    timerCheck = false;
    document.getElementById("pong").innerHTML = "Pong Dong"; // Reset the message
    document.getElementById("pong").style.backgroundColor = "black"; // Reset the background color
    r = 255;
    g = 255;
    b = 255;
  }

  if (blocks.length > 0) {
    for (const block of blocks) {
      block.draw();
    }
  }

  line(0, 0, 0, h);
  line(w, 0, w, h);
  line(0, 0, w, 0);
  line(0, h, w, h);
  strokeWeight(1);
  ball.draw();
  p1.draw();
  p2.draw();
}
