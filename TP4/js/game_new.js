var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;

//Canvas
var divArena;
var canArena;
var conArena;
var ArenaWidth = 500;
var ArenaHeight = 300;
var runAnimation = true;

//Background
var imgBackground;
var xBackgroundOffset = 0;
var xBackgroundSpeed = 1;
var backgroundWidth = 1782;
var backgroundHeight = 600;

///////////////////////////////////
//Keys
var keys = {
    UP: 38,
    DOWN: 40,
    SPACE: 32,
    ENTER: 13
};

var keyStatus = {};

function keyDownHandler(event) {
    "use strict"; 
    var keycode = event.keyCode, 
        key; 
    for (key in keys) {
        if (keys[key] === keycode) {
            keyStatus[keycode] = true;
            event.preventDefault();
        }
    }
}
function keyUpHandler(event) {
   var keycode = event.keyCode,
            key;
    for (key in keys) 
        if (keys[key] == keycode) {
            keyStatus[keycode] = false;
        }
        
    }
/////////////////////////////////////////////////////////////////////////Animation/////////////////////////////////////////////////////////
//This object will take care of all possible animation

Animation = function(url, length, width, height) {
	this.width = width;
	this.height = height;
	this.meter = length;
	this.ready = false;
	var that = this;
	this.cptAnim = 0;
	this.tabImgCanvas = new Array();
	var img = new Image();
	img.src = url;
	img.onload = function() {
			var imgCanvas;
			var imgCanvasContext;
			that.ready = true;
			for (var i = 0; i < that.meter; ++i) {
				imgCanvas = document.createElement("canvas");
				imgCanvasContext = imgCanvas.getContext("2d");
				imgCanvasContext.width = that.width;
				imgCanvasContext.height = that.height;
				imgCanvasContext.drawImage(img, 0, i*that.height, that.width, that.height, 0, 0, that.width/2, that.height/2);
				that.tabImgCanvas.push(imgCanvas);
			}
		}
}

Animation.prototype.clear = function(x, y) {
	conArena.clearRect(x, y, this.width, this.height);
}

Animation.prototype.update = function() {
	this.cptAnim = (this.cptAnim+1) % this.meter;
}

Animation.prototype.draw = function(x, y) {
	if (this.ready) {
		conArena.drawImage(this.tabImgCanvas[this.cptAnim], x, y);
	}
}

///////////////////////////////////////////////////////// Character/////////////////////////////////////////////////////////
//This is the standard profil of all objects such as players, enemies, missiles, boss....

Character = function (x,y,speed, width, height) { 
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.exploding =  false;
    this.lives = 1;
    this.animExplosion = new Animation("./assets/explosion.png",10,64,64);
};

Character.prototype.getSpeed = function(){
        return this.speed;
};
Character.prototype.setSpeed = function(speed){
        this.speed = speed; 
};
Character.prototype.getX = function(){
        return this.x;
};
Character.prototype.setX = function(X){
        this.x = X;
};
Character.prototype.getY = function(){
        return this.y;
};
Character.prototype.setY = function(Y){
        this.y = Y;
};
Character.prototype.collides = function(character) {
   if (character != null && (character.x + character.width/2) > this.x && this.y < (character.y + character.height/4) && 
    	this.y >= character.y && this.x >= character.x) {
    	return true;
    }
    return false;
};
Character.prototype.explodes = function(){
    this.exploding = true;
    this.animation = this.animExplosion;
    --this.lives;
    if (this.lives != 0) {
    	this.animation = this.originalAnimation;
    }
    this.exploding = false;
};
Character.prototype.getLives = function(){
	return this.lives;
};
Character.prototype.draw = function(){
    this.animation.draw(this.x, this.y);            
};
Character.prototype.update = function(){
    	this.animation.update();  
    	this.x= this.x + this.speed;
};
Character.prototype.clear = function(){
    this.animation.clear(this.x, this.y);     
};

////////////////////////////////////////////////////////////Missiles/////////////////////////////////////////////////////////////////
//This is the build of a simple missile which will be common to the player and the enemies

Missile = function(x,y,speedX, speedY, width, height){
    	Character.call(this,x,y,speedX, width, height);
    	this.speedY = speedY;
    	this.animation = new Animation("./assets/missile.png",1, width, height);
    	this.originalAnimation = this.animation;
};
Missile.prototype = Object.create(Character.prototype);
Missile.prototype.constructor = Missile;

Missile.prototype.getSpeedY = function(){
        return this.speedY;
};
Missile.prototype.setSpeedY = function(speedY){
        this.speedY = speedY; 
};
Missile.prototype.update = function() {
	this.animation.update();
	this.x += this.speed;
	this.y += this.speedY;
};

////////////////////////////////////////////////////////////Player/////////////////////////////////////////////////////////////////
//This is the simple object of a player. It will be build as if it can be more than one player

Player = function(x, y, speed, number, width, height) {
	Character.call(this,x,y,speed, width, height);
	this.animation = new Animation("./assets/Ship/vaisseau.png",4, width, height);
	this.originalAnimation = this.animation;
	this.fireRate = 50;
	this.timeShoot = 0;
	this.score = 0;
	this.lives = 3;
};  
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
	this.animation.update();
	if (this.collides()) this.explodes();
	var keycode;
    	for (keycode in keyStatus) {
            	if (keyStatus[keycode] == true){
                	if (keycode == keys.UP) { 
                    		this.y -= this.speed;  
                    		if (this.y < 0) this.y = 0; 
                	}
               		if (keycode == keys.DOWN) { 
                    		this.y += this.speed;   
                   		if ((this.y + this.height) > ArenaHeight ) this.y = ArenaHeight - this.height;
                	} 
                	if (keycode == keys.SPACE) {
                		this.timeShoot = (this.timeShoot+10) % this.fireRate;
                		this.shoot();
                	}
            	}	
        	keyStatus[keycode] = false;
   	}
   	if (this.lives <= 0) {
			runAnimation = false;
			alert("GAME OVER");
	}
};

Player.prototype.shoot = function() {
	Missiles.add(new Missile((this.x+ this.width/4), (this.y + this.height/4), 10, 0, 16, 8));
};

Player.prototype.scoring = function() {
	this.score++;
}

/////////////////////////////////////////////////////////////// Player tab for singleplayer//////////////////////////////////////
Player1 = {
    init : function() {
        this.player = new Player(10,100,10,1, 64, 29);
    },
    draw : function() { 
        this.player.draw();
    },
    clear : function() {
        this.player.clear();
    },
    update : function() {
        this.player.update();
    },
    getPlayer : function() {
    	return this.player;
    },
    scoring : function() {
    	this.player.scoring();
    }
};

////////////////////////////////////////////////////////////// Enemy in general/////////////////////////////////////////////////////////
//This is the basic constitution of an enemy

Enemy = function(x,y,speedX, speedY, width, height){
    	Character.call(this,x,y,speedX, width, height);
    	this.speedY = speedY;
    	this.timeShoot = 0;
    	this.fireRate = 0;  
    	this.fireDirectionY = 0;
    	this.originalAnimation = this.animation;
};
Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.getSpeedY = function(){
        return this.speedY;
};
Enemy.prototype.setSpeedY = function(speedY){
        this.speedY = speedY; 
};
Enemy.prototype.update = function() {
	this.animation.update();
	this.timeShoot = (this.timeShoot+10) % this.fireRate;
	this.x += this.speed;
	this.y += this.speedY;
	if (this.y > Player1.player.y) {
		this.fireDirectionY = -1;
	} else if (this.y < Player1.player.y){
		this.fireDirectionY = 1;
	  } else  {
	  	this.fireDirectionY = 0;	
	}
	this.shoot();
};
Enemy.prototype.shoot = function() {
	if (this.timeShoot == 10) {
		Missiles.add(new Missile(this.x - 5, (this.y + this.height/4), -5, this.fireDirectionY, 16, 8));
	}
};

///////////////////////////////////////////////////////////Enemy lvl 1/////////////////////////////////////////////////////////
//This is the build of an enemy lvl 1. These enemies are simple

Enemylvl1 = function(x,y,speedX, speedY, width, height) {
	Enemy.call(this, x, y, speedX, speedY, width, height);
	this.animation = new Animation("./assets/Enemy/lvl1Enemy.png",6, width, height);
	this.fireRate = 2000;
};
Enemylvl1.prototype = Object.create(Enemy.prototype);
Enemylvl1.prototype.constructor = Enemylvl1;

/////////////////////////////////////////////////////////////Enemy lvl 2/////////////////////////////////////////////////////////////////
//This is the build of an enemy lvl 2. These enemies are kamikazes

Enemylvl2 = function(x,y,speedX, speedY, width, height) {
	Enemy.call(this, x, y, speedX, speedY, width, height);
	this.animation = new Animation("./assets/Enemy/lvl2Enemy.png",6, width, height);
};
Enemylvl2.prototype = Object.create(Enemy.prototype);
Enemylvl2.prototype.constructor = Enemylvl2;

Enemylvl2.prototype.update = function() {
	if (this.y > Player1.player.y) {
		this.fireDirectionY = -1;
		this.speedY = -2;
	} else if (this.y < Player1.player.y){
		this.fireDirectionY = 1;
		this.speedY = 2;
	  } else  {
	  	this.fireDirectionY = 0;	
	  	this.speedY = 0;
	}
	this.animation.update();
	this.timeShoot = (this.timeShoot+10) % this.fireRate;
	this.x += this.speed;
	this.y += this.speedY;
	this.shoot();
};

/////////////////////////////////////////////////////////////Enemy lvl 3/////////////////////////////////////////////////////////////////
//This is the build of an enemy lvl 3. These enemies are deceitful because when they are in the middle of the length, they stop and follow the player on the Y axe

Enemylvl3 = function(x,y,speedX, speedY, width, height) {
	Enemy.call(this, x, y, speedX, speedY, width, height);
	this.animation = new Animation("./assets/Enemy/lvl3Enemy.png",6, width, height);
	this.harassment = false;
};
Enemylvl3.prototype = Object.create(Enemy.prototype);
Enemylvl3.prototype.constructor = Enemylvl3;

Enemylvl3.prototype.update = function() {
	if (this.y > Player1.player.y) {
		this.fireDirectionY = -1;
		if (this.harassment) this.speedY = -1;
	} else if (this.y < Player1.player.y){
		this.fireDirectionY = 1;
		if (this.harassment) this.speedY = 1;
	  } else  {
	  	this.fireDirectionY = 0;	
	  	if (this.harassment) this.speedY = 0;
	}
	if (this.x <= ArenaWidth/2) this.harassment = true;
	if (this.harassment) this.speed = 0;
	this.animation.update();
	this.timeShoot = (this.timeShoot+10) % this.fireRate;
	this.x += this.speed;
	this.y += this.speedY;
	this.shoot();
};

////////////////////////////////////////////////////////////Enemy lvl 4/////////////////////////////////////////////////////////////////
//This is the build of an enemy lvl 4. No behavior has been selected or created yet

Enemylvl4 = function(x,y,speedX, speedY, width, height) {
	Enemy.call(this, x, y, speedX, speedY, width, height);
	this.animation = new Animation("./assets/Enemy/lvl4Enemy.png",6, width, height);
};
Enemylvl4.prototype = Object.create(Enemy.prototype);
Enemylvl4.prototype.constructor = Enemylvl4;

/////////////////////////////////////////////////////////////// Enemies tab/////////////////////////////////////////////////////////
Enemies = {
    init : function(){
        this.tabEnemies = new Array();
    },
    add : function (enemy) {
        this.tabEnemies.push(enemy);  
    },
    remove : function () {  
        this.tabEnemies.map(function(obj,index,array){
            if(obj.lives == 0 ||obj.y > ArenaHeight || obj.x< 0 || (obj.y + obj.height) < 0){
                  delete array[index];
                  array.splice(index,1);
    		  if (array[index] != null) array[index].clear();	//To make sure there is no drawing error
            }
        });
    },
    draw : function(){ 
        this.tabEnemies.map(function(obj){
            obj.draw();
        });
    },
    clear : function(){
       this.tabEnemies.map(function(obj){
            obj.clear();
        });
    },
    update : function(){
        this.tabEnemies.map(function(obj){
            obj.update();
            if (obj.collides(Player1.getPlayer())) {
            	obj.explodes();
            	Player1.getPlayer().explodes();
            }
        });
        this.remove();
    },
    getTable : function() {
    	return this.tabEnemies;
    }
};

/////////////////////////////////////////////////////////////// Enemies Missiles tab//////////////////////////////////////
Missiles = {
    init : function(){
        this.tabMissiles = new Array();
    },
    add : function (missile) {
        this.tabMissiles.push(missile);  
    },
    remove : function () {  
        this.tabMissiles.map(function(obj,index,array){
            if(obj.lives == 0 ||obj.y > ArenaHeight || obj.x< 0 || obj.x > ArenaWidth || (obj.y + obj.height) < 0){
                  delete array[index];
                  array.splice(index,1);
    		  if (array[index] != null) array[index].clear();	//To make sure there is no drawing error
            }
        });
    },
    draw : function(){ 
        this.tabMissiles.map(function(obj){
            obj.draw();
        });
    },
    clear : function(){
       	this.tabMissiles.map(function(obj){
            obj.clear();
        });
    },
    update : function(){
        this.tabMissiles.map(function(obj){
            obj.update();
            if (obj.collides(Player1.getPlayer())) {
            	obj.explodes();
            	Player1.getPlayer().explodes();
            }
            Enemies.getTable().map(function(enemy) {
            	if (obj.collides(enemy)) {
            	obj.explodes();
            	enemy.explodes();
            	Player1.scoring();
            }
            });
        });
         this.remove();
    },
    getTable : function() {
    	return this.tabMissiles;
    }
};

/////////////////////////////////////////////////////////////// Player tab for multiplayer//////////////////////////////////////
/*
Players = {
    init : function(){
        this.tabPlayers = new Array();
        this.add(new Player(10,100,10,1, 64, 29));
    },
    add : function (player) {
        this.tabPlayers.push(player);  
    },
    remove : function () {  
        this.tabPlayers.map(function(obj,index,array){
            if(obj.lives == 0 ||obj.y > ArenaHeight || obj.x< 0){
                  delete array[index];
                  array.splice(index,1);
    		  if (array[index] != null) array[index].clear();	//To make sure there is no drawing error
            }
        });
    },
    draw : function(){ 
        this.tabPlayers.map(function(obj){
            obj.draw();
        });
    },
    clear : function(){
       	this.tabPlayers.map(function(obj){
            obj.clear();
        });
    },
    update : function(){
        this.tabPlayers.map(function(obj){
            obj.update();
        });
         this.remove();
    }
};
*/
//////////////////////////////////////////////////////////////////Game Time/////////////////////////////////////////////////////////
var gameTime = {
	x : 15,
	y : 15,
	height : 40,
	width : 80,
	ms : 00,
	s : 00,
	m : 00,
	add : function() {
		this.ms += 01;
		if (this.ms == 60) {
			this.ms = 00;
			this.s += 01;
			//Testing :
			//if (this.s == 2) spawningEnemies(1);
			if (this.s%2 == 0) spawningEnemies(1);
			if (this.s%10 == 0) spawningEnemies(2);
			if (Player1.player.score%10 == 0 && Player1.player.score != 0) spawningEnemies(3);
		}
		if (this.s == 60) {
			this.s = 00;
			this.m += 01;
		}
	},
	draw : function() {
		conArena.save();
		conArena.fillStyle = "white";
		conArena.fillText(("SCORE " + Player1.player.score), this.x, this.y);
		conArena.fillText(("TIME " + this.m + " : " + this.s), this.x, this.y+10);
		conArena.fillText(("LIVES " + Player1.player.lives), this.x, this.y+20);
		conArena.restore();
	},
	clear : function() {
		conArena.clearRect(0, 0, this.width, this.height);
	}

};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function spawningEnemies(level) {
	var sideSpawn, xSpawnSpeed, ySpawnSpeed;
	sideSpawn = Math.floor(Math.random() * ArenaHeight);
	switch(level) {
		case 2:
			xSpawnSpeed = -5;
			ySpawnSpeed = 0;
			Enemies.add(new Enemylvl2(ArenaWidth, sideSpawn,xSpawnSpeed, ySpawnSpeed, 40, 30));
			break;
		case 3 :
			xSpawnSpeed = -8;
			ySpawnSpeed = 0;
			Enemies.add(new Enemylvl3(ArenaWidth, sideSpawn,xSpawnSpeed, ySpawnSpeed, 40, 30));
			break;
		case 4 :
			Enemies.add(new Enemylvl4(ArenaWidth, sideSpawn,xSpawnSpeed, ySpawnSpeed, 40, 30));
			break;
		default :
			xSpawnSpeed = Math.floor((Math.random() * -5) + 1);
			ySpawnSpeed = Math.floor(Math.random() * 0.5 ) - 0.25;
			if (xSpawnSpeed == 0) xSpawnSpeed = -1;
			
			//Testing:
			//Enemies.add(new Enemylvl1(ArenaWidth/2, ArenaHeight/2,0, 0, 40, 30));
			Enemies.add(new Enemylvl1(ArenaWidth, sideSpawn,xSpawnSpeed, ySpawnSpeed, 40, 30));
			break;
	}

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateScene() {
    	"use strict"; 
    	xBackgroundOffset = (xBackgroundOffset - xBackgroundSpeed) % backgroundWidth;
}
function updateItems() {
    	"use strict"; 
    	clearItems();
    	updateTime();
    	Player1.update();
    	Enemies.update();
    	Missiles.update();
}

function updateTime() {
	gameTime.add();
}

function drawScene() {
    	"use strict"; 
    	canArena.style.backgroundPosition = xBackgroundOffset + "px 0px" ;
}
function drawItems() {
    	"use strict"; 
    	gameTime.draw();
    	Player1.draw();
    	Enemies.draw();
    	Missiles.draw();
}

function clearItems() {
    	"use strict"; 
    	gameTime.clear();
    	Player1.clear();
    	Enemies.clear();
    	Missiles.clear();
}

function updateGame() {
    	"use strict"; 
    	updateScene();
    	updateItems();
}

function drawGame() {
    	"use strict"; 
    	drawScene();
    	drawItems();    
}


function mainloop () {
    	"use strict"; 
    	updateGame();
    	drawGame();
}

function recursiveAnim () {
    	"use strict"; 
    	mainloop();
    	if (runAnimation) animFrame( recursiveAnim );
}
 
function init() {
    	"use strict";
    	divArena = document.getElementById("arena");
    	canArena = document.createElement("canvas");
    	canArena.setAttribute("id", "canArena");
    	canArena.setAttribute("height", ArenaHeight );
    	canArena.setAttribute("width", ArenaWidth );
    	conArena = canArena.getContext("2d");
    	divArena.appendChild(canArena);
    	Player1.init();
    	Enemies.init();
    	Missiles.init();
    
	window.addEventListener("keydown", keyDownHandler, false);
	window.addEventListener("keyup", keyUpHandler, false);
    
    	animFrame( recursiveAnim );
    
}

window.addEventListener("load", init, false);
