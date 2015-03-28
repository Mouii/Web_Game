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
    ENTER: 13,
    A : 65
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
///////////////////////////////////



/////////////////////////////////
// Hero Player
var imgPlayer = new Image();
imgPlayer.src = "./assets/Ship/vaisseau.png";

var animNumber = 0;

var player = {
	x: 20,
	y : 100,
	speed : 10,
	height : 15,
	width : 32,
	imgHeight : 28,
	imgWidth : 64,
	anim : animNumber,
	nbLives : 3,
	collision : false,
	draw : function() {
		animNumber = (animNumber+29)%116;
		conArena.drawImage(imgPlayer, 0, animNumber, this.imgWidth, this.imgHeight, this.x, this.y, this.width, this.height);
	},
	clear : function() {
		conArena.clearRect(this.x, this.y, this.width, this.height);	
	},
	update : function() {
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
                    			projectile = new missile();
                    			tabProjectile.unshift(projectile);
                		}
                		if (keycode == keys.A) {
                			enemy = new Enemy(400, 0, -1, 1, 1);
                			enemy1 = new Enemy(400, 300, -1, -1, 1);
                			tabEnemy.unshift(enemy);
                			tabEnemy.unshift(enemy1);
                		}            
            		}	
        		keyStatus[keycode] = false;
   		}
	},
	lostLife : function() {
		--nbLives;
	},
	winLife : function() {
		++nbLives;
	},
	explosion : function() {
	
	}
};

//Missiles shot by the player
var imgMissile = new Image();
imgMissile.src = "./assets/Ship/missile.png";

var projectile;

var tabProjectile = new Array();

function missile() {
	this.x = player.x;
	this.y = player.y + ((player.height)/2);
	this.speed = 10;
	this.width = 8;
	this.height = 4;
	this.clear = function() {
		conArena.clearRect(this.x, this.y, this.width, this.height+1);
	};
	this.draw = function() {
		conArena.drawImage(imgMissile, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
	};
	this.update = function() {
		this.x += this.speed;
	}
};

//Enemies
var imgEnemyLvl1 = new Image();
var imgEnemyLvl2 = new Image();
var imgEnemyLvl3 = new Image();
var imgEnemyLvl4 = new Image();
imgEnemyLvl1.src = "./assets/Enemy/lvl1Enemy.png";
imgEnemyLvl2.src = "./assets/Enemy/lvl2Enemy.png";
imgEnemyLvl3.src = "./assets/Enemy/lvl3Enemy.png";
imgEnemyLvl4.src = "./assets/Enemy/lvl4Enemy.png";

var enemy;

var animEnemy = 0;

var tabEnemy = new Array();

var enemyShot;

function Enemy(X, Y, xSpeed, ySpeed, level) {
	this.x = X;	
	this.y = Y;
	this.xSpeed = xSpeed;
	this.ySpeed = ySpeed;
	this.level = level;
	this.height = 30;
	this.width = 40;
	this.imgHeight = 15;
	this.imgWidth = 20;
	this.cptShoot = 0;
	switch (level) {
		case 2 :
			this.image = imgEnemyLvl2;
			break;
		case 3 :
			this.image = imgEnemyLvl3;
			break;
		case 4 : 
			this.image = imgEnemyLvl4;
			break;
		default:
			this.image = imgEnemyLvl1;
			break;
	}
	this.draw = function() {
		animEnemy = (animEnemy+30)%180;
		conArena.drawImage(this.image, 0, animEnemy, this.width, this.height, this.x, this.y, this.imgWidth, this.imgHeight);
	};
	this.clear = function() {
		conArena.clearRect(this.x, this.y, this.width, this.height);	
	};
	this.update = function() {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.shoot();
	};
	this.shoot = function() {
		this.cptShoot = (this.cptShoot+10)%2000;
		if (this.cptShoot == 10) {
			enemyShot = new enemyMissile(this);
			tabEnemyMissile.unshift(enemyShot);
		}
	
	}
};
//Enemies's shots
var tabEnemyMissile = new Array();

function enemyMissile(Enemy) {
	this.x = Enemy.x + (Enemy.imgWidth)/2;
	this.y = Enemy.y + ((Enemy.imgHeight)/2);
	this.speed = 5;
	this.width = 8;
	this.height = 4;
	if (this.y > player.y ) {
		this.direction = 1;
	} else if (this.y < player.y) {
		this.direction = -1;
	}
	else	{
		this.direction = 0;
	}
	this.clear = function() {
		conArena.clearRect(this.x, this.y, this.width, this.height+1);
	};
	this.draw = function() {
		conArena.drawImage(imgMissile, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
	};
	this.update = function() {
		this.x -= this.speed;
		switch (this.direction) {
			case (-1):
				this.y += this.speed;
				break;
			case 1 :
				this.y -= this.speed;
				break;
			default:
				break;
		}
		
	}
};



/////////////////////////////////



function updateScene() {
    "use strict"; 
    xBackgroundOffset = (xBackgroundOffset - xBackgroundSpeed) % backgroundWidth;
}
function updateItems() {
    "use strict"; 
    clearItems();
    player.update();
    tabProjectile.map(function(object) {
    	object.update();
    }); 
    tabEnemy.map(function(object) {
    	object.update();
    });
    tabEnemyMissile.map(function(object) {
    	object.update();
    });
    
}
function drawScene() {
    "use strict"; 
    canArena.style.backgroundPosition = xBackgroundOffset + "px 0px" ;
}
function drawItems() {
    "use strict"; 
    player.draw();
    tabProjectile.map(function(object) {
    	object.draw();
    }); 
    tabEnemy.map(function(object) {
    	object.draw();
    });
    tabEnemyMissile.map(function(object) {
    	object.draw();
    });
}

var i;

function clearItems() {
    "use strict"; 
    player.clear();
    tabProjectile.map(function(object) {
    	object.clear();
    	if (object.x > (ArenaWidth+10)) {
    		tabProjectile.pop();
    	};
    });
    tabEnemy.map(function(enemy) {
    	enemy.clear();
    	if (enemy.y > ArenaHeight || enemy.y < 0) {
    		tabEnemy.pop();
    	}
    });
    tabEnemyMissile.map(function(object) {
    	object.clear();
    	if (object.x < 0) {
    		tabEnemyMissile.pop();
    	};
    }); 
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
    animFrame( recursiveAnim );
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
 
    
window.addEventListener("keydown", keyDownHandler, false);
window.addEventListener("keyup", keyUpHandler, false);
    
    animFrame( recursiveAnim );
    
}

window.addEventListener("load", init, false);
