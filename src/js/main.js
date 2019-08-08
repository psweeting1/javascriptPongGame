"use strict";

// Setting the animation window to 60fps
const animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  (callback => { window.setTimeout(callback, 1000/60) });

//Find canvas ID and set it up
const canvas = document.getElementById("gameCanvas");
let width = 400;
let height = 400;
canvas.width = width;
canvas.height = height;
let context = canvas.getContext('2d');

//Player varibles
//Call the player
const player = new Player();
//Call the computer paddle
const computer = new Computer();
//Call the ball
const ball = new Ball(200, 200);

window.onload = () => {
    document.body.appendChild(canvas);
    animate(step);
};

const step = () => {
    update();
    render();
    animate(step);
};

const update = () => {
    player.update();
    computer.update();
    ball.update(player.paddle, computer.paddle);
};

const render = () => {
  context.fillStyle = "#000000";
  context.fillRect(0, 0, width, height);
  player.render();
  computer.render();
  ball.render();
};

//Making the paddle
function Paddle (x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.x_speed = 0;
      this.y_speed = 0;
    }
  
//Draw a paddle
Paddle.prototype.render = function() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(this.x, this.y, this.width, this.height);
};

//Player ones paddle
function Player() {
    this.paddle = new Paddle(175, 380, 50, 10);
 }
 
 //AI paddle
 function Computer() {
   this.paddle = new Paddle(175, 10, 50, 10);
 }

Player.prototype.render = function() {
    this.paddle.render();
};

//Player one key set up
Player.prototype.update = function() {
    for(let key in keysDown) {
        let value = Number(key);
        if(value === 37) { // left arrow
            this.paddle.move(-4, 0);
        } else if (value === 39) { // right arrow
            this.paddle.move(4, 0);
        } else {
            this.paddle.move(0, 0);
        }
    }
}

Computer.prototype.update = function() {
    for(let key in keysDown) {
        let value = Number(key);
        if(value === 65) { // A key
            this.paddle.move(-4, 0);
        } else if (value === 68) { // B key
            this.paddle.move(4, 0);
        } else {
            this.paddle.move(0, 0);
        }
    }
}

Paddle.prototype.move = function (x,y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if(this.x < 0) { // all the way to the left
        this.x = 0;
        this.x_speed = 0;
    } else if (this.x + this.width > 400) { // all the way to the right
        this.x = 400 - this.width;
        this.x_speed = 0;
    }
}
  
Computer.prototype.render = function() {
    this.paddle.render();
};

function Ball (x,y) {
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = 3;
    this.radius = 5;
}

//Draw a ball 
  Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#ffffff";
    context.fill();
  };

  Ball.prototype.update = function(paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    const top_x = this.x - 5;
    const top_y = this.y - 5;
    const bottom_x = this.x + 5;
    const bottom_y = this.y + 5;

    if(this.x - 5 < 0) { // hitting the left wall
        this.x = 5;
        this.x_speed = -this.x_speed;
      } else if(this.x + 5 > 400) { // hitting the right wall
        this.x = 395;
        this.x_speed = -this.x_speed;
      }

      if(this.y < 0 || this.y > 400) { // Went off the edge, a point was scored
        this.x_speed = 0;
        this.y_speed = 3;
        this.x = 200;
        this.y = 300;
      }
      if(top_y > 300) {
        if(top_y < (paddle1.y + paddle1.height) && 
        bottom_y > paddle1.y && 
        top_x < (paddle1.x + paddle1.width) && 
        bottom_x > paddle1.x) {
          // hit the player's paddle
          this.y_speed = -3;
          this.x_speed += (paddle1.x_speed / 2);
          this.y += this.y_speed;
        }
      } else {
        if(top_y < (paddle2.y + paddle2.height) && 
        bottom_y > paddle2.y && 
        top_x < (paddle2.x + paddle2.width) && 
        bottom_x > paddle2.x) {
          // hit the computer's paddle
          this.y_speed = 3;
          this.x_speed += (paddle2.x_speed / 2);
          this.y += this.y_speed;
        }
      }
  };

//Key set up
const keysDown = {};

window.addEventListener("keydown", ({keyCode}) => {
  keysDown[keyCode] = true;
});

window.addEventListener("keyup", ({keyCode}) => {
  delete keysDown[keyCode];
});