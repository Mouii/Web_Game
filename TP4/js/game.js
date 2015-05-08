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

/////////////////////////////////
// Hero Player
var imgPlayer = new Image();
imgPlayer.src = "./assets/Ship/vaisseau.png";

var tabImgPlayer = new Array();
var tabImgEnemy = new Array();
var tabImgExplosion = new Array();

var fireRate = 10;
var fire = 0;

var player = {
	x : 20,
	y : 100,
	speed : 10,
	height : 15,
	width : 32,
	//imgHeight : 28,
	//imgWidth : 64,
	anim : 0,
	nbLives : 3,
	score : 0,
	boom : 0,
	godmod : 0,
	draw : function() {
		//this.anim = (this.anim + 29)%116;
		//conArena.drawImage(imgPlayer, 0, this.anim, this.imgWidth, this.imgHeight, this.x, this.y, this.width, this.height);
		if (this.boom == 0) {
			conArena.drawImage(tabImgPlayer[this.anim],this.x, this.y);

		} else {
			conArena.drawImage(tabImgExplosion[this.anim],this.x, this.y);
			if (this.anim == 9) {
				this.boom = 0;
				this.godmod = 0;
				this.anim = 0;
			}
		}
	},
	clear : function() {
		conArena.clearRect(this.x, this.y, this.width, this.height);	
	},
	update : function() {
		if (this.boom == 0) this.anim = (this.anim + 1)%4;
		else this.anim = (this.anim + 1) % 10;
		var keycode;
    		for (keycode in keyStatus) {
            		if (keyStatus[keycode] == true){
                		if (keycode == keys.UP) { 
                    			this.y -= this.speed;  
                    			if (this.y < 0) this.y = 0; 
                    			fire = 0;
                		}
               			if (keycode == keys.DOWN) { 
                    			this.y += this.speed;   
                   			if ((this.y + this.height) > ArenaHeight ) this.y = ArenaHeight - this.height;
                   			fire = 0;
                		} 
                		if (keycode == keys.SPACE) {
                				if (fire == fireRate || fire == 0) {
		            				projectile = new missile();
		            				tabProjectile.unshift(projectile);
		            				fire = 0;
		            			}
		            		fire += 1;
                		}
            		}	
        		keyStatus[keycode] = false;
   		}
	},
	lostLife : function() {
		--this.nbLives;
		if (this.nbLives == 0) {
			runAnimation = false;
			alert("GAME OVER");
		}
	},
	winLife : function() {
		++this.nbLives;
	},
	scoring : function() {
		this.score++;
	},
	explosion : function() {
		this.lostLife();
		this.anim = 0;
		this.boom = 1;
		this.godmod = 1;
	}
};
/////////////////////////////////
//Missiles shot by the player
var imgMissile = new Image();
imgMissile.src = "./assets/missile.png";

var projectile;

var tabProjectile = new Array();

function missile() {
	this.x = player.x + player.width;
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
	};
	this.collision = function(enemy) {
		if (this.x + this.width >= enemy.x && this.y > enemy.y && this.y < enemy.y + enemy.height) {
			player.scoring();
			enemy.explosion();
			conArena.clearRect(this.x, this.y, this.width, this.height+1);
			tabProjectile.pop();
		}
	}
};
/////////////////////////////////
//Enemies
var imgEnemyLvl1 = new Image();
var imgEnemyLvl2 = new Image();
var imgEnemyLvl3 = new Image();
var imgEnemyLvl4 = new Image();
imgEnemyLvl1.src = "./assets/Enemy/lvl1Enemy.png";
imgEnemyLvl2.src = "./assets/Enemy/lvl2Enemy.png";
imgEnemyLvl3.src = "./assets/Enemy/lvl3Enemy.png";
imgEnemyLvl4.src = "./assets/Enemy/lvl4Enemy.png";

var imgExplosion = new Image();
imgExplosion.src = "./assets/explosion.png";

var enemy;

var tabEnemy = new Array();

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
	this.anim = 0;
	this.cptShoot = 0;
	this.imgExplosion = 0;
	this.alive = 1;
	this.tabEnemyMissile = new Array();
	this.draw = function() {
		//this.anim = (this.anim+30)%180;
		if (this.alive == 0) {
			//this.image = imgExplosion;
			//conArena.drawImage(this.image, this.imgExplosion, 0, 64, 64, this.x, this.y, this.imgWidth, this.imgHeight);
			conArena.drawImage(tabImgExplosion[this.anim],this.x, this.y);
			//this.imgExplosion += 64;
			//if (this.imgExplosion == 640) {
			if (this.anim == 9) {
				this.explosion = 0;
				this.alive = -1;
			}
		} else if (this.alive == 1) {
			//conArena.drawImage(this.image, 0, this.anim, this.width, this.height, this.x, this.y, this.imgWidth, this.imgHeight);
			conArena.drawImage(tabImgEnemy[this.anim],this.x, this.y);
		}
		this.tabEnemyMissile.map(function(object) {
    			object.draw();
    		});
	};
	this.clear = function() {
		conArena.clearRect(this.x, this.y-1, this.width, this.height+1);
		this.tabEnemyMissile.map(function(object,index,array) {
    			object.clear();
			if (object.y >= ArenaHeight || object.x <= 0 || object.hit == true) {
    				delete array[index];
    				array.splice(index,1);
    			}  
   		});
	};
	this.update = function() {
		if (this.alive == 0) {
			this.anim = (this.anim + 1) % 10;
		}
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		if (this.alive == 1) {
			switch(level) {
				case 2:
					this.anim = ((this.anim +1) % 6) + 6;
					if (this.y < player.y) this.ySpeed = 1;
					if (this.y > player.y) this.ySpeed = -1;
					if (this.x > player.x) this.xSpeed = -3;
					break;
				case 3:
					this.anim = ((this.anim +1) % 6) + 12;
					if (this.x <= ArenaWidth/2) {
						this.xSpeed = 0;
						if (this.y == player.y) this.ySpeed = 0;
						if (this.y < player.y) this.ySpeed = 1;
						if (this.y > player.y) this.ySpeed = -1;
					}
					break;
				case 4: 
					this.anim = ((this.anim +1) % 6) + 18;
					break;
				default:
					this.anim = (this.anim +1) % 6;
					break;
			}
			this.shoot();
		}
		this.tabEnemyMissile.map(function(object) {
    			object.update();
    			object.collision(player);
   		});
	};
	this.shoot = function() {
		if (this.level == 3) {
			this.cptShoot = (this.cptShoot+10)%500;
		} else if (this.level == 2) {
			this.cptShoot = (this.cptShoot+10)%1000;
		} else {
			this.cptShoot = (this.cptShoot+10)%2000;
		}
		if (this.cptShoot == 10) {
			var enemyShot;
			enemyShot = new enemyMissile(this, this.level);
			(this.tabEnemyMissile).unshift(enemyShot);
		}
	
	};
	this.collision = function(p) {
			if (p.x + p.width >= this.x && this.y <= p.y + p.height && this.y >= p.y && this.x <= p.x && p.godmod == 0) {
				this.explosion();
				p.explosion();
			}
	};
	this.explosion = function() {
		this.xSpeed = 0;
		this.ySpeed = 0;
		this.alive = 0;
		this.anim = 0;
	};
};
/////////////////////////////////
//Enemies's shots 
function enemyMissile(Enemy, level) {
	this.x = Enemy.x + (Enemy.imgWidth)/2;
	this.y = Enemy.y + ((Enemy.imgHeight)/2);
	this.speed = 5;
	this.width = 8;
	this.height = 4;
	this.level = level;
	this.hit = false;
	if (this.y > player.y ) {
		this.direction = 1;
	} else if (this.y < player.y) {
		this.direction = -1;
	}
	else	{
		this.direction = 0;
	}
	this.clear = function() {
		conArena.clearRect(this.x-10, this.y-10, this.width+20, this.height+20);
	};
	this.draw = function() {
		conArena.drawImage(imgMissile, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
	};
	this.update = function() {
		switch (this.level) {
			case 1:
				this.updatelvl1();
				break;
			case 2:
				this.updatelvl2();
				break;
			case 3:
				this.updatelvl3();
				break;	
			case 4: 		
				break;
			default:
				break;
		}
	};
	this.updatelvl1 = function() {
		this.x -= this.speed;
		switch (this.direction) {
			case (-1):
				this.y += this.speed/5;
				break;
			case 1 :
				this.y -= this.speed/5;
				break;
			default:
				break;
		}
	};
	this.updatelvl2 = function() {
		this.x -= this.speed;
		switch (this.direction) {
			case (-1):
				this.y += this.speed/5;
				break;
			case 1 :
				this.y -= this.speed/5;
				break;
			default:
				break;
		}
	};
	this.updatelvl3 = function() {
		this.x -= this.speed;
		switch (this.direction) {
			case (-1):
				this.y += this.speed/5;
				break;
			case 1 :
				this.y -= this.speed/5;
				break;
			default:
				this.y += 0;
				break;
		}
	};
	this.updatelvl4 = function() {
		this.x -= this.speed;
		switch (this.direction) {
			case (-1):
				this.y += this.speed/5;
				break;
			case 1 :
				this.y -= this.speed/5;
				break;
			default:
				this.y += 0;
				break;
		}
	};
	this.collision = function(p) {
			if (p.x + p.width >= this.x && this.y <= p.y + p.height && this.y >= p.y && this.x <= p.x && p.godmod == 0) {
				p.explosion();
				this.hit = true;
			}
	};
};
/////////////////////////////////
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
			if (this.s%2 == 0) spawningEnemies(1);
			if (this.s%10 == 0 && this.s != 0) spawningEnemies(2);
			if (player.score%10 == 0 && player.score != 0) spawningEnemies(3);
		}
		if (this.s == 60) {
			this.s = 00;
			this.m += 01;
		}
	},
	draw : function() {
		conArena.save();
		conArena.fillStyle = "white";
		conArena.fillText(("SCORE " + player.score), this.x, this.y);
		conArena.fillText(("TIME " + this.m + " : " + this.s), this.x, this.y+10);
		conArena.fillText(("LIVES " + player.nbLives), this.x, this.y+20);
		conArena.restore();
	},
	clear : function() {
		conArena.clearRect(0, 0, this.width, this.height);
	}

};
/////////////////////////////////
function spawningEnemies(level) {
	var sideSpawn = Math.floor((Math.random() * 100));
	var xSpawnSpeed = Math.floor((Math.random() * -10) + 1)/4;
	var ySpawnSpeed = Math.floor((Math.random() * 2) + 1)/4;
	if (level == 3) xSpawnSpeed *= 10;
	enemy = new Enemy(ArenaWidth, sideSpawn, xSpawnSpeed, ySpawnSpeed, level);
	tabEnemy.push(enemy);

}
/////////////////////////////////

function initImg() {
	var cpt;
	var cpt2;
	var IMG;
	for (cpt = 0; cpt < 5 ; cpt++) {
		canvasCreated = document.createElement("canvas");
		canvasContext = canvasCreated.getContext("2d");
		canvasContext.width = 64;
		canvasContext.height = 28;
		canvasContext.drawImage(imgPlayer, 0, 29*cpt, canvasContext.width, canvasContext.height, 0, 0, player.width, player.height);
		tabImgPlayer.push(canvasCreated);
	}
	
	for (cpt2 = 0; cpt2 < 4; cpt2++) {
		if (cpt2 == 0) IMG = imgEnemyLvl1;	
		if (cpt2 == 1) IMG = imgEnemyLvl2;
		if (cpt2 == 2) IMG = imgEnemyLvl3;
		if (cpt2 == 3) IMG = imgEnemyLvl4;

		for (cpt = 0; cpt < 6 ; cpt++) {
			canvasCreated2 = document.createElement("canvas");
			canvasContext2 = canvasCreated2.getContext("2d");
			canvasContext2.width = 40;
			canvasContext2.height = 30;
			canvasContext2.drawImage(IMG, 0, 30*cpt, canvasContext2.width, canvasContext2.height, 0, 0, canvasContext2.width/2, canvasContext2.height/2);
			tabImgEnemy.push(canvasCreated2);
		}
	}
	
	for (cpt = 0; cpt < 10 ; cpt++) {
		canvasCreated3 = document.createElement("canvas");
		canvasContext3 = canvasCreated3.getContext("2d");
		canvasContext3.width = 64;
		canvasContext3.height = 64;
		canvasContext3.drawImage(imgExplosion, 64*cpt, 0, canvasContext3.width, canvasContext3.height, 0, 0, 23, 23);
		tabImgExplosion.push(canvasCreated3);
	}
}



function updateScene() {
    "use strict"; 
    xBackgroundOffset = (xBackgroundOffset - xBackgroundSpeed) % backgroundWidth;
}
function updateItems() {
    "use strict"; 
    clearItems();
    player.update();
    tabProjectile.map(function(missile) {
    	missile.update();
    	tabEnemy.map(function(object) {
    		missile.collision(object);
    	});
    }); 
    tabEnemy.map(function(object) {
    	object.update();
    	object.collision(player);
    });
    updateTime();
    
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
    player.draw();
    tabProjectile.map(function(object) {
    	object.draw();
    }); 
    tabEnemy.map(function(object) {
    	object.draw();
    });
    gameTime.draw();
}

function clearItems() {
    "use strict"; 
    player.clear();
    tabProjectile.map(function(object) {
    	object.clear();
    	if (object.x > (ArenaWidth+10)) {
    		tabProjectile.pop();
    	};
    });
    tabEnemy.map(function(object,index,array) {
    	object.clear();
	if (object.y >= ArenaHeight || object.x <= 0 || object.alive == -1) {
    		delete array[index];
    		array.splice(index,1);
    		if (array[index] != null) array[index].clear();	//To make sure there is no drawing error
    	}  
    });
    gameTime.clear();
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
    initImg(); 
    
window.addEventListener("keydown", keyDownHandler, false);
window.addEventListener("keyup", keyUpHandler, false);
    
    animFrame( recursiveAnim );
    
}

window.addEventListener("load", init, false);
