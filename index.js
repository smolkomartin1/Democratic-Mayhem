const firebase = require('firebase/app');
const auth = require('firebase/auth');
const database = require('firebase/database');
const admin = require('firebase-admin');
var serviceAccount = require('./democratic-mayhem-firebase-adminsdk-5lphy-49a8ae0d49.json');
require('dotenv').config()

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
  measurementId: process.env.MEASUREMENTID,
  databaseURL: process.env.DATABASEURL,
  credential: admin.credential.cert(serviceAccount),
};

var app = admin.initializeApp(firebaseConfig);
//const auth = getAuth();

const db = admin.database();
const playersRef = db.ref("players");
const scoresRef = db.ref("scores");

// JavaScript Document
const express = require('express');
const { PassThrough } = require('stream');
const e = require('express');
const { set } = require('firebase/database');
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENTID;
const client = new OAuth2Client(CLIENT_ID);
var username;
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
app.use(express.static('public'));
app.use(express.json());
const router = express.Router();
app.use('/', router);
var savedResponse;
router.get('/', (req, res) => {
	res.sendFile(__dirname + '/login.html'); //Serves the file
});

app.post('/', (req, res)=>{

	let token = req.body.token;
	async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  //console.log(payload)
	}
	verify().catch(console.error);
})
router.get('/game', (req, res) => {
	res.sendFile(__dirname + '/shooter.html'); //Serves the file
});
router.get('/waiting', (req, res) => {
	res.sendFile(__dirname + '/WaitingRoom.html'); //Serves the file
});
//Tried a superclass. It not brill, I won't lie
class component {
	//Initlises
	constructor(x, y,angle,scale=1){
		this.speed = [0,0]; //Uses a speed system for all objects now
		this.x = x;
		this.y = y;
		this.angle=angle;
		this.scale=scale;
	}
	move(){//Generic speed function
		//if (Math.abs(this.speed[0]) > 0 || Math.abs(this.speed[1]) >0){console.log(this.x,this.y)};
		this.x += this.speed[0];
		this.y += this.speed[1];
	}
}
//Subclass
class playerChar extends component{
	constructor(x,y,angle,ind){
		super(x,y,angle,(cheats[2]>0)?0.5:1); //Calls the superclass constructor
		this.ind = ind;
		this.attCool = 2;
		this.specialAtt = 2;
		this.fric = (cheats[1]>0)? 0.95:0.6;
		this.health = 3;
        this.maxspeed = (cheats[2]>0)? 10:5;
		this.maxspeed *= (cheats[9]>0)? 0.75:1;
		this.projs = [];
		this.tomato=new tomato(this.ind);
		this.power=0;
	}
	move(keys){
		if (this.health != 0){
			//this.speed =[0,0]; //Resets speed. It would be cool to add Friction too.
			this.speed[0] *= this.fric;
			this.speed[1] *= this.fric;

			if (Math.abs(this.speed[0]) < 0.1){
				this.speed[0] = 0;
			}
			if (Math.abs(this.speed[1]) < 0.1){
				this.speed[1] = 0;
			}
			//2x speed if cheat active
			//this.maxspeed = (cheat2 == 1) ? 10 : 5; //Not actually inplemented
			if (keys[0]){
				this.speed[1] -= this.maxspeed/2; //These 10s arent the actually speed.
			}
			if (keys[1]){
				this.speed[0] -= this.maxspeed/2;
			}
			if (keys[2]){
				this.speed[1] += this.maxspeed/2;
			}
			if (keys[3]){
				this.speed[0] += this.maxspeed/2;
			}
			//Reduces cooldown if recently attacked
			if (this.attCool != 0){this.attCool --}
			if (this.specialAtt != 0){this.specialAtt --}
			if (this.charging){this.power++}

			if (cheats[5]>0){
				this.speed[0]+= 1-Math.random()*2
				this.speed[1]+= 1-Math.random()*2
			}

			//Normalises speed vector. This prevents diagonal being faster than straight
			this.speed = norm(this.speed,this.maxspeed,false);

			//Player to game borders collision checks
			let canMoveX, canMoveY = false;
			if ((this.x<475 && this.speed[0]>0) || (this.x>25 && this.speed[0]<0)) {canMoveX = true;}
			if ((this.y<475 && this.speed[1]>0) || (this.y>25 && this.speed[1]<0)) {canMoveY = true;}

			//Player to cover collision checks
			let xCol, yCol = false;
			let nextMove = [this.x + this.speed[0], this.y + this.speed[1]]	//Finds the potential next move

			covers.forEach(i => {	//Loops through all covers and checks if the player has collided with one
				//Checks if the player were to collide if they moved in the x axis only
				if (canMoveX) {	//Only runs if the player hasnt collided yet (more efficient)
						xCol = (i.x+23) > nextMove[0]-(this.scale*23) && (i.x-23) < nextMove[0]+(this.scale*23);
						yCol = (i.y+23) > this.y-(this.scale*23) && (i.y-23) < this.y+(this.scale*23);
						if (xCol && yCol) {canMoveX = false;}
					}
					//Checks if the player were to collide if they moved in the y axis only
					if (canMoveY) {
						xCol = (i.x+23) > this.x-(this.scale*23) && (i.x-23) < this.x+(this.scale*23);
						yCol = (i.y+23) > nextMove[1]-(this.scale*23) && (i.y-23) < nextMove[1]+(this.scale*23);
						if (xCol && yCol) {canMoveY = false;}
					}
				});

				//Player to player collision checks
				//Checks for collision with the other player in the x axis
				if (canMoveX) {
					xCol = (gamePieces[1-this.ind].x+(gamePieces[1-this.ind].scale*20)) > nextMove[0]-(this.scale*20) && (gamePieces[1-this.ind].x-(gamePieces[1-this.ind].scale*20)) < nextMove[0]+(this.scale*20);
					yCol = (gamePieces[1-this.ind].y+(gamePieces[1-this.ind].scale*20)) > this.y-(this.scale*20) && (gamePieces[1-this.ind].y-(gamePieces[1-this.ind].scale*20)) < this.y+(this.scale*20);
					if (xCol && yCol) {canMoveX = false;}
				}
				//Checks for collision with the other player in the y axis
				if (canMoveY) {
					xCol = (gamePieces[1-this.ind].x+(gamePieces[1-this.ind].scale*20)) > this.x-(this.scale*20) && (gamePieces[1-this.ind].x-(gamePieces[1-this.ind].scale*20)) < this.x+(this.scale*20);
					yCol = (gamePieces[1-this.ind].y+(gamePieces[1-this.ind].scale*20)) > nextMove[1]-(this.scale*20) && (gamePieces[1-this.ind].y-(gamePieces[1-this.ind].scale*20)) < nextMove[1]+(this.scale*20);
					if (xCol && yCol) {canMoveY = false;}
				}
			//Move the player if it hasn't collided with a cover or the game border or another player
				if (canMoveX) {this.x += this.speed[0];}
				if (canMoveY) {this.y += this.speed[1];}

		}
	}
	rotate(pos){
		//Bit of trig to find angle from vector
		this.angle = Math.atan2(pos[1]-this.y,pos[0]-this.x)-(Math.PI/2) //Not sure why the -(Math.PI/2) is needed honestly
	}
	attack(clickPos){
		if (this.attCool==0){
			//Creates new object using the projectile class and appends it to the projectiles array
			let temp = norm([this.y-clickPos[1],clickPos[0]-this.x],20,true);
    		this.projs.push(new projectile(this.x+temp[0],this.y+temp[1],[clickPos[0]+temp[0],clickPos[1]+temp[1]],this.ind));
			//this.projs.push(new projectile(this.x+temp[0],this.y+temp[1],[clickPos[0],clickPos[1]],this.ind));
			this.attCool=30; //Sets cooldown
		}
	}
	specialAttack(clickPos){
		if (this.charging){
			//Creates new object using the projectile class and appends it to the projectiles array
			this.specialAtt=(cheats[4]>0)?100:250; //Sets cooldown
			this.tomato.create(this.x,this.y,[clickPos[0],clickPos[1]],(cheats[3]>0)?2:1,this.power,this.specialAtt);

			this.charging=false;
		}
	}
	charge(){
		if (this.specialAtt==0){
			this.charging= true;
			this.power=0;
		}
	}
	updateCheats(){
		this.fric = (cheats[1]>0)? 0.95:0.6;
		this.scale = (cheats[2]>0)?0.5:1;
        this.maxspeed = (cheats[2]>0)? 10:5;
		this.maxspeed *= (cheats[9]>0)? 0.75:1;
	}

}
//Subclass
class projectile extends component {
	constructor(x,y,clickPos,player,size=1,speed=10){
		let angle = Math.atan2(clickPos[1]-y,clickPos[0]-x)-(Math.PI/2); //Works out angle
		super(x,y,angle); //Calls super constructor

		//Normalisation of vector
		let temp = (((clickPos[1]-y)**2)+((clickPos[0]-x)**2))**0.5;
		this.speed = [((cheats[0]>0)?2:1)*speed*(clickPos[0]-x)/temp,((cheats[0]>0)?2:1)*speed*(clickPos[1]-y)/temp];
		this.speed[0] *= (cheats[9]>0)? 0.75:1;
		this.speed[1] *= (cheats[9]>0)? 0.75:1;
		this.size = (cheats[0]>0)?2:1;
		this.hitstun = 0;
		this.age = 0;
		this.loop = cheats[6]>0;
		this.proId = proCurId++;
		this.player = player; //Sets what player it belongs to
		this.active= true;
		this.curving = cheats[7]>0;
		io.emit('newProj',[this.x,this.y,angle,this.speed,this.size,this.proId,this.curving,this.loop]); //Tells all players about it.
	}
	move(){
		if (this.active){
			if (this.x < 0 || this.x > 500){
				if (cheats[6]>0 && this.loop){
					this.x = 500-this.x;
					this.loop = false;
				}else{
					this.active = false; //Tells main code to delete this object
				}
			}
			if (this.y < 0 || this.y > 500){
				if (cheats[6]>0 && this.loop){
					this.loop = false;
					this.y = 500-this.y;
				}else{
					this.active = false; //Tells main code to delete this object
				}
			}
			let xCol, yCol = false;
			covers.forEach((i,indCrat) => {	//Loops through all covers and checks if the projectile has collided with one
				xCol = (i.x+23) > this.x-(this.size*5) && (i.x-23) < this.x+(this.size*5);	//Didnt add scale here
				yCol = (i.y+23) > this.y-(this.size*10) && (i.y-23) < this.y+(this.size*10);
				if (xCol && yCol) {
					i.health -= 1;
					this.active = false;
					io.emit("Hit",null,this.proId,indCrat,i.health);
				}
			});
			if (!(xCol && yCol)) {	//Won't check for player collision if already collided with a cover
				xCol = (gamePieces[1-this.player].x+(gamePieces[1-this.player].scale*23)) > this.x-(this.size*5) && (gamePieces[1-this.player].x-(gamePieces[1-this.player].scale*23)) < this.x+(this.size*5);
				yCol =(gamePieces[1-this.player].y+(gamePieces[1-this.player].scale*23)) > this.y-(this.size*10) && (gamePieces[1-this.player].y-(gamePieces[1-this.player].scale*23)) < this.y+(this.size*10);

				if (this.hitstun!=0){this.hitstun--;}

				if (xCol && yCol && this.hitstun == 0){
					this.active=false;
					this.hitstun = 10;
					gamePieces[1-this.player].health -= 1;
					if (gamePieces[1-this.player].health == 0){
						//adding wins to database
						let wins;
						let winner = gameUsers[this.player].userName;
						console.log("WINNER IS " + winner);

						playersRef.child(winner).once('value', (data) => {
							try{
								var item = data.val();
								item = Object.entries(item);

								wins=0;
								item.forEach((elem) =>{
									if (elem[0] == "wins"){
										wins = elem[1];
									}
								});
								//wins = item[0][1];
								console.log("Wins equal"+wins);
							}catch(e){
								console.log("Either NEW or ERROR");
								console.log(e);
								wins=0;
							}
							playersRef.child(winner).update({
								kills: wins+1,
							});
						});



						io.emit("Kill",1-this.player);
						gameUsers.push(gameUsers[1-this.player]);
						updateLeaderboard();
						setTimeout(()=> {
							console.log("ahhhh");
							gameUsers.splice(1-this.player,1);
							restartGame();
						},5000);

					}else{
						io.emit("Hit",1-this.player,this.proId)
						console.log(1-this.player)
					}
				}

			}

			if (cheats[7]>0){
				this.speed = [this.speed[0]*Math.cos(0.05)-this.speed[1]*Math.sin(0.05),
							this.speed[0]*Math.sin(0.05)+this.speed[1]*Math.cos(0.05)]
			}
			if (cheats[3]>0){
				this.speed = [this.speed[0]*Math.cos(this.age/10)-this.speed[1]*Math.sin(this.age/10),
							this.speed[0]*Math.sin(this.age/10)+this.speed[1]*Math.cos(this.age/10)]
			}
			this.age ++;
			super.move();
		}


	}
}
//Subclass
class tomato extends component {
	constructor(player,speed=10){
		super(-500,-500,0); //Calls super constructor
		//Normalisation of vector
		//let temp = (((clickPos[1]-y)**2)+((clickPos[0]-x)**2))**0.5;
		this.speed=0;
		this.size=1;
		this.player = player; //Sets what player it belongs to
		this.active= false;
		//console.log("adwadwad");
	}
	create(x,y,clickPos,size,power, cooldown){
		this.x = x;
		this.y= y;
		this.active=true;
		let angle = Math.atan2(clickPos[1]-y,clickPos[0]-x)-(Math.PI/2); //Works out angle
		let temp = ((((clickPos[1]-y)**2)+((clickPos[0]-x)**2))**0.5);
		//console.log(temp);
		if (power > 50){power=50};
		this.speed = [0.4*power*(clickPos[0]-x)/temp,0.4*power*(clickPos[1]-y)/temp];
		this.speed[0] *= (cheats[9]>0)? 0.75:1;
		this.speed[1]*= (cheats[9]>0)? 0.75:1;
		this.size = size;
		this.fuse=80;
		this.fric=(cheats[8]>0)?1:0.95;
		this.fric *= (cheats[9]>0)? 0.75:1;
		this.hit=false;
		io.emit('newtom',[this.x,this.y,angle,this.speed,size, this.fric], this.player, cooldown); //Tells all players about it.
	}
	move(){
		if (this.x < 0 && this.speed[0]<0){
			this.speed[0] *= -1;
      io.emit('tomatoBounceSound');
		}
		if (this.x > 500 && this.speed[0]>0){
			this.speed[0] *= -1;
      io.emit('tomatoBounceSound');
		}
		if( this.y < 0 && this.speed[1]<0){
			this.speed[1] *= -1;
      io.emit('tomatoBounceSound');
		}
		if (this.y > 500 && this.speed[1]>0){
			this.speed[1] *= -1;
      io.emit('tomatoBounceSound');
		}

		let nextMove = [this.x + this.speed[0], this.y + this.speed[1]]	//Finds the potential next move
		covers.forEach(i => {	//Loops through all covers and checks if the tomato has collided with one
  		//Checks if the tommato were to collide with a cover in the x axis only
			let xCol = i.x > nextMove[0]-(30) && i.x < nextMove[0]+(30);
			let yCol = i.y > this.y-(30) && i.y < this.y+(30);
			if (xCol && yCol) {this.speed[0] *= -1; io.emit('tomatoBounceSound');}

			//Checks if the tommato were to collide with a cover in the y axis only
			xCol = i.x > this.x-(30) && i.x < this.x+(30);
			yCol = i.y > nextMove[1]-(30) && i.y < nextMove[1]+(30);
			if (xCol && yCol) {this.speed[1] *= -1; io.emit('tomatoBounceSound');}
		});
		this.speed[0]*=this.fric;
		this.speed[1]*=this.fric;

		if (this.fuse!=0 && this.active){
			this.fuse--;
		}else{
			this.hitDetect();
			this.active=false;
		}

		super.move();
	}
	hitDetect(){
		console.log("checking");
		//let z = 0;
		for (let z = 0; z<2; z++){
			let xCol = (gamePieces[z].x+(gamePieces[z].scale*23)) > this.x-(this.size*80) && (gamePieces[z].x-(gamePieces[z].scale*23)) < this.x+(this.size*80);
			let yCol =(gamePieces[z].y+(gamePieces[z].scale*23)) > this.y-(this.size*80) && (gamePieces[z].y-(gamePieces[z].scale*23)) < this.y+(this.size*80);

			if (xCol && yCol){
				console.log("hit")
				gamePieces[z].health -= 1;
				if (gamePieces[z].health == 0){
					//adding wins to database
					let wins;
					//console.log("z currently equals "+z);
					playersRef.child(gameUsers[1-z].userName).once('value', (data) => {
						try{
							var item = data.val();
							item = Object.entries(item);
							wins=0;
							item.forEach((elem) =>{
								if (elem[0] == "wins"){
									wins = elem[1];
								}
							});
							//console.log(wins);
						}catch(e){
							console.log("Either NEW or ERROR");
							console.log(e);
							wins=0;
						}
						playersRef.child(gameUsers[1-z].userName).update({
							kills: wins+1,
						   });
					  });

					this.active=false;
					io.emit("Kill",z);
					gameUsers.push(gameUsers[z]);
					updateLeaderboard();
					setTimeout(()=>{
						gameUsers.splice(z,1);
						restartGame();
					},5000);

				}else{
					io.emit("tomHit",z,this.proId);
					console.log(z);
				}
			}
		}
	}
}
//Subclass
class cover extends component {
	constructor(x, y){
		super(x, y, 0);
		this.health = 3;
		this.active = true;
		//io.emit('newCover',[x,y]);
	}
}
//Just a very simple class for organising data
class user{
	constructor(id,token,use){
		this.token = token;
		this.id =id; //Players socket id
		this.userName = use;
		//this.inde = ind; //players number. We assign, starting with 0.
		this.keys=[false,false,false,false];
		this.click = false;
		this.mousePos = [0,0];
		this.pageChange = false;
		this.vote= false;
		this.placedCover = false;
	}
}
var cheats = [0,0,0,0,0,0,0,0,0,0,0];
//Setting up objects
var gamePieces = [new playerChar(250,40,0,0),new playerChar(250,460,Math.PI,1)];
var covers = [new cover(100,250),new cover(250,250),new cover(400,250)];	//Generates 3 initial covers (will be removed eventually)
var gameUsers = [];
var covers = [];

var gameState=false;
var countdown =0;
var coverTimer=0;
// Status of cheat codes
var cheat2 = 0;
var cheat3 = 1;
//List

var votes = [0,0,0];
var options = [0,0,0];
var timer = 0;
var pollPause = (Math.floor(Math.random()*500))+200;

var topTen = [];
updateLeaderboard();

var proCurId = 0;
var messages = [];

var numPlay = 0; //This is never used lmao
io.on('connection', (socket) => { //WHEN PLAYER JOINS
	console.log("New "+socket.id)
  	socket.on('disconnect', function() { //WHEN PLAYER DISCONNECTS
	 	//Searches for id
	  	var p = gameUsers.filter(obj => {
  			return obj.id === socket.id
		});
		if (p.length > 0){
			if (p[0].pageChange==true){
				console.log("Delete.");
				gameUsers.splice(gameUsers.indexOf(p[0]),1);
				if (gameUsers.indexOf(p[0]) <= 2 && gameState){
					restartGame();
				}
			}else{
				p[0].pageChange=true;
			}
		}
  	});
  	socket.on('input', (keys) => { //WHEN PLAYER CLICKS KEY
		//Searches for id
		var p = gameUsers.filter(obj => {
			return obj.id === socket.id
		});
	  	if (p.length != 0){
	  		let pi = gameUsers.indexOf(p[0]);
	  		gameUsers[pi].keys = keys; //Updates keys
	  	}
  	});
  socket.on('mouseUpdate', (pos) => {
	  var p = gameUsers.filter(obj => {
		  return obj.id === socket.id
	  });
	  if (p.length != 0){
		let pi = gameUsers.indexOf(p[0]);
	  	gameUsers[pi].mousePos = pos;
	  }
	});
	socket.on('mouseClick', (pos) => {
		var p = gameUsers.filter(obj => {
			return obj.id === socket.id
		});
		if (p.length != 0){
			let pi = gameUsers.indexOf(p[0]);
			if (pi <= 1){
				gamePieces[pi].attack(pos);
			} else {
				if (p[0].placedCover == false && coverTimer > 1) {
					let tempC = new cover(pos[0],pos[1]);
					if (pos[0] < 480 && pos[0] > 20 && pos[1] < 480 && pos[1] > 20) {
						let good = true;
						//Checks for covers
						covers.forEach(i => {
							let xCol = (i.x - pos[0])**2 <= 42**2
							let yCol = (i.y - pos[1])**2 <= 42**2
							if (xCol && yCol) {good = false}
						});
						//Checks for players
						for (i=0;i<2;i++) {
							let xCol = (gamePieces[i].x - pos[0])**2 <= 40**2
							let yCol = (gamePieces[i].y - pos[1])**2 <= 40**2
							if (xCol && yCol) {good = false}
						}
						if (good) {
							covers.push(new cover(pos[0],pos[1]));
							io.emit('newCover',[pos[0],pos[1]]);
							p[0].placedCover = true;
						}
					}
}
			}
		}
	});
	socket.on('rightDown', () => {
		var p = gameUsers.filter(obj => {
			return obj.id === socket.id
		});
		//console.log("DIKdhoaodhqjwdhuj");
		if (p.length != 0){
			let pi = gameUsers.indexOf(p[0]);
			if (pi <= 1){
				gamePieces[pi].charge();
			}
		}
	});
	socket.on('rightUp', (pos) => {
		var p = gameUsers.filter(obj => {
			return obj.id === socket.id
		});
		//console.log("DIKdhoaodhqjwdhuj");
		if (p.length != 0){
			let pi = gameUsers.indexOf(p[0]);
			if (pi <= 1){
				gamePieces[pi].specialAttack(pos);
			}
		}
		});
	socket.on("auth",(userName, token, email)=> {
		//
		//AUTHENTICATE LOGIC

		var status;
		var usernameExists;
		var promise = playersRef.child(userName).orderByKey().limitToFirst(1).once("value").then(res=>res.exists())
		promise.then(function(result){
			usernameExists = result
			console.log("username exists: "+usernameExists)
			if (usernameExists){
				playersRef.child(userName+"/zemail").once('value', (data)=>{
					var emailValue = data.val();
					console.log("2 emailvalue: "+emailValue)
					if (emailValue == email){
						status = "true"
					}
					else{
						status = "Wrong email/Username taken"
					}
				})
			} else{
				playersRef.orderByChild("zemail").once("value").then(function(snapshot){
					try{
						snapshot.forEach(function(childSnapshot){
						if (childSnapshot.child("zemail").val() == email){
							console.log("hey")
							status = "Email already used"
							throw 'Break';
						} else{
							status = "new user"
						}
					})

					} catch (e){
						if (e!=='Break') throw e
					}
				})

			}
		})

		setTimeout(()=>{
			console.log(status)
			if ((status == "true")||(status == "new user")){
				socket.emit("handshake",gameUsers.length,token,messages,covers,topTen); //Tells the user they are playing
				gameUsers.push(new user(socket.id,token,userName));

				console.log("Enter "+userName)
				console.log(gameUsers.length)
		    if (gameUsers.length == 1) {
		      setTimeout(() => {
						io.emit("onePlayer", userName);
					}, 500);
		    }
				else if (gameUsers.length == 2){
					setTimeout(() => {
						restartGame();
					}, 500);
					console.log("HelloWorld")
				}
				sendUpdate(); //Updates everyone
				if (status == "new user"){
					playersRef.child(userName).update({
						kills: 0,
						zemail: email,
					})
				}

			}else{
				socket.emit("error", status)
			}
		}, 1000)

	});
	socket.on("updateID",(token) => {
		var p = gameUsers.filter(obj => {
			return obj.token === token
		});
		try{
			p[0].id = socket.id;
			if (gameUsers.length == 1) {
				setTimeout(() => {
						io.emit("onePlayer", p[0].userName);
					}, 500);
			}else if (gameUsers.length == 2){
				setTimeout(() => {
					restartGame();
				}, 500);
				console.log("HelloWorld");
			}
		}catch{
			socket.emit("login");
		}
		socket.emit("getId",socket.id);
	});
	socket.on("votes",(num)=>{
		var p = gameUsers.filter(obj => {
			return obj.id === socket.id
		});
		if (!p[0].vote){
			votes[num]++;
			console.log(votes);
			p[0].vote = true;
		};
});
  socket.on('cheats', (num) => {
	var p = gameUsers.filter(obj => {
		return obj.id === socket.id
	});
	let pi = p[0].inde;
	cheats[num] = 250;
	/*
	if (num == 0){
		gamePieces[pi].fric = (cheat) ? 0.99 : 0.6;
	}else if (num == 1){
		gamePieces[pi].maxspeed = (cheat) ? 10 : 5;
	}else if (num == 2){
		cheat3 = (cheat) ? 2: 1;
	}
	*/
	});
	socket.on("queueStatus",()=>{
		var index = gameUsers.map(obj => obj.id).indexOf(socket.id);
		socket.emit("queuePos", index - 1);
	});
	socket.on('chatMessage',(message) => {
		var p = gameUsers.filter(obj => {
			return obj.id === socket.id
		});
		if (message == "!POLL"){
			startPoll();
		}
		if (message == "!DEBUG"){
			console.log(pollPause,timer);
		}
		messages.push([p[0].userName,message])
		io.emit('chatMessage',message,p[0].userName);
		// save in database
		const messagesRef = db.ref("messages");
		let date_ob = new Date();

		let date = ("0" + date_ob.getDate()).slice(-2);
		let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
		let year = date_ob.getFullYear();

		let hours = date_ob.getHours();
		let minutes = date_ob.getMinutes();

		let dataData = (date + "-" + month + "-" + year);
		let time = (hours + ":" + minutes);
		messagesRef.push().set({
			message: message,
			user: p[0].userName,
			date: dataData,
			time: time,
		});
	});
});


setInterval(update, 20);
function update(){ //Runs every Frame
	if (gameState==true){
		gamePieces[0].move(gameUsers[0].keys);
		gamePieces[1].move(gameUsers[1].keys);
		gamePieces[0].rotate(gameUsers[0].mousePos);
		gamePieces[1].rotate(gameUsers[1].mousePos);

		if (gamePieces[0].tomato.active){
			gamePieces[0].tomato.move();
		}
		if (gamePieces[1].tomato.active){
			gamePieces[1].tomato.move();
		}

		for (i=0;i<cheats.length;i++){
			if (cheats[i]!=0){
				cheats[i] -= 1;
				if (cheats[i] == 0){
					io.emit("cheatDone",i);
					gamePieces[0].updateCheats();
					gamePieces[1].updateCheats();
				}
			}
		}
		let reversed = gamePieces[0].projs.slice(); //Dumb code that makes a copy of the array so we can delete stuff without it messing up
		//For each projectile
		reversed.forEach(function(element,ind){
			element.move(); //Move projectile
			//If out of bound
			if (element.active == false){
				gamePieces[0].projs.splice(ind,1); //Remove from array
			}
		});
		reversed = gamePieces[1].projs.slice(); //Dumb code that makes a copy of the array so we can delete stuff without it messing up
		//For each projectile
		reversed.forEach(function(element,ind){
			element.move(); //Move projectile
			//If out of bound
			if (element.active == false){
				gamePieces[1].projs.splice(ind,1); //Remove from array
			}
		});
		reversed = covers.slice(); //Dumb code that makes a copy of the array so we can delete stuff without it messing up
		//For each cover
		reversed.forEach(function(element,ind){
			//If inactive
			if (element.health < 1){
				covers.splice(ind,1); //Remove from array
				io.emit('destroyCover',ind);
			}
		});
		if (pollPause == 0){
			pollPause = (Math.floor(Math.random()*500))+200;
			startPoll();
		}else if (timer == 0){
			pollPause-=1;
		}
		if (timer == 1){
			endPoll();
			timer=0;
		}else if (timer > 1){
			timer -= 1;
		}
	}else{
		if (countdown>1){
			countdown--;
		}else if (countdown==1){
			gameState = true;
			countdown=0;
		}
	}
	if (coverTimer>1) {coverTimer--}
	sendUpdate();
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function generateCovers(){
	TEMPcovers = [];
	console.log("GEN")
	while (TEMPcovers.length < 6){
		let tempC = new cover(getRndInteger(100,400),getRndInteger(100,400));
		let good = true;
		TEMPcovers.forEach(i => {
			//Vector cover collision checking but i lost the padding that you added because i didnt really understand it sry - hank
			let xCol = (i.x - tempC.x)**2 <= 45**2
			let yCol = (i.y - tempC.y)**2 <= 45**2

			if (xCol && yCol) {good = false}

			/*
			let tlX = (tempC.x - (tempC.scale*23) <= i.x + (i.scale *40) && tempC.x - (tempC.scale*23) >= i.x - (i.scale *40));
			let tlY = (tempC.y - (tempC.scale*23) <= i.y + (i.scale *40) && tempC.y - (tempC.scale*23) >= i.y - (i.scale *40));
			let trX = (tempC.x + (tempC.scale*23) <= i.x + (i.scale *40) && tempC.x + (tempC.scale*23) >= i.x - (i.scale *40));
			let trY = (tempC.y - (tempC.scale*23) <= i.y + (i.scale *40) && tempC.y - (tempC.scale*23) >= i.y - (i.scale *40));
			let dlX = (tempC.x - (tempC.scale*23) <= i.x + (i.scale *40) && tempC.x - (tempC.scale*23) >= i.x - (i.scale *40));
			let dlY = (tempC.y + (tempC.scale*23) <= i.y + (i.scale *40) && tempC.y + (tempC.scale*23) >= i.y - (i.scale *40));
			let drX = (tempC.x + (tempC.scale*23) <= i.x + (i.scale *40) && tempC.x + (tempC.scale*23) >= i.x - (i.scale *40));
			let drY = (tempC.y + (tempC.scale*23) <= i.y + (i.scale *40) && tempC.y + (tempC.scale*23) >= i.y - (i.scale *40));
			if ((tlX&&tlY)||(trX&&trY)||(dlX&&dlY)||(drX&&drY)){
				good = false;
			} */
			//Please henry help me implement collision for this uwu
			//function generates empty array called covers(var covers was originally
			// in restartGame func, replaced by generateCovers func.)
			//creates a cover and collision is to check whether it overlaps
			//if no overlap push to array
			//if overlap, do an extra loop
			//return the final array and hope that link 657 works :D
		});
		if (good){
			TEMPcovers.push(tempC);
		}
	}
	return TEMPcovers;
}
function restartGame(){
	gameState=false;
	console.log("RESTART "+ gameUsers.length);
	if (gameUsers.length >= 2){
		io.emit("startPlaying",gameUsers[0].id,gameUsers[1].id, gameUsers[0].userName, gameUsers[1].userName);
		console.log(gameUsers[0].id,gameUsers[1].id);
		gamePieces = [new playerChar(250,40,0,0),new playerChar(250,460,Math.PI,1)];
		covers = generateCovers();
		let positions = [];
		covers.forEach((element)=> {positions.push([element.x,element.y])})
		gameUsers.forEach((element)=> {element.placedCover = false})
		io.emit("startGame",positions);
		countdown = 180;
		coverTimer = 350;
		votes = [0,0,0];
		options = [0,0,0];
		timer = 0;
		pollPause = (Math.floor(Math.random()*500))+200;
		cheats = [0,0,0,0,0,0,0,0,0,0,0];
		//setTimeout(()=>{gameState=true},4800);
	}else{
		gameState=false;
		io.emit("stopGame");
	}
}
function startPoll(){
	options = [];
	while (options.length != 3){
		let tempCh = Math.floor(Math.random()*cheats.length)
		if (!options.includes(tempCh)){
			options.push(tempCh)
		}
	}
	gameUsers.forEach((elem)=>{
		elem.vote = false;
	});
	votes = [0,0,0];
	timer = 500;
	io.emit("POLL",timer,options);
}
function endPoll(){
	let indexes = [];
	if (Math.max(...votes) != 0){
		//console.log(options);
		console.log("MAX "+Math.max(...votes));
		for(let loopind = 0; loopind < votes.length; loopind++){
			if (votes[loopind] == Math.max(...votes)){
				indexes.push(loopind);
				//console.log(loopind);
				//console.log(options[loopind]);
				cheats[options[loopind]] = 500;
			}
		}
		//let winnInd = votes.indexOf()
		gamePieces[0].updateCheats();
		gamePieces[1].updateCheats();
		console.log(cheats);
	}
	io.emit("ENDPOLL",indexes);
}

//Normalises vectors for me cause I do it so much
function norm(array,mag,cap=false){ //If cap is false, it won't change mag if mag is less than deseired
	let dis = ((array[0]**2) + (array[1]**2))**0.5
    if (dis != 0){
        if (cap || (dis > mag)){
        	array[0] = (array[0] / dis) * mag
        	array[1] = (array[1] / dis) * mag
		}
	}
	return array

}
//Updates players
function sendUpdate(){
	sendingthing = [gamePieces[0].x,gamePieces[0].y,gamePieces[0].angle,
					gamePieces[1].x,gamePieces[1].y,gamePieces[1].angle];
	io.emit('updatePos', sendingthing);
}
//update LEADERBOARD

function updateLeaderboard(){
	topTen=[];
  playersRef.orderByChild("kills").once("value", function(dataSnapshot) {
      var i = 0;
      dataSnapshot.forEach(function(childSnapshot) {
        var childRef = childSnapshot.ref;
        var r = (dataSnapshot.numChildren() - i);
        childRef.update({rank: r},function(error) {
            if (error != null)
              console.log("update error: " + error);
        });
        i++;
      });
  });
  setTimeout(() =>{
	playersRef.orderByChild("rank").limitToFirst(10).once("value", function(snap){
		snap.forEach(function(childSnap){
			var item = childSnap.val();

			var userid = childSnap.ref.key;
			item = Object.entries(item)
			console.log(item);
			newArr = [];
			newArr = newArr.concat(userid)
			for(i=0; i<item.length;i++){
				newArr = newArr.concat(item[i])
			}
			topTen.push(newArr)
		});
		console.log(topTen);
		//send the leaderboard data to the html file
		io.emit('leaderboard',topTen);
	});
  },2000);
};
//Just network code. You can ignore.
http.listen(80, () => {
  console.log('listening on *:80');
});
