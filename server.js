'use strict';
const WebSocket = require('ws'),
server = new WebSocket.Server({ port: 40510 }),
express = require('express'),
ent = require('ent'),
encode = require('ent/encode'),
//decode = require('ent/decode'),
app = express();

app.use(express.static(__dirname + '/public'));

const MAP = {x:6080, y:2400};

const particle = {
	id:0,x:0,y:0,vx:0,vy:0,gravity:0,friction:0.9,
	speed:0,direction:0,width:100,height:100,hp:0,
	create: function(x, y, speed, direction, grav){
		const obj = Object.create(this);
		obj.x = x;
		obj.y = y;
		obj.vx = Math.cos(direction) * speed;
		obj.vy = Math.sin(direction) * speed;
		obj.gravity = grav || 0;
		return obj;
	},

	accelerate: function(ax, ay) {
		this.vx += ax;
		this.vy += ay;
	},

	update: function() {
		this.vx *= this.friction;
		this.vy *= this.friction;
		this.vy += this.gravity;
		this.x += Math.trunc(this.vx);
		this.y += Math.trunc(this.vy);
	}
};

const users = [];

function createId(len = 12, chars = 'abcdefghjkmnopqrstvwxyz01234567890') {
	let id = '';
	while (len--) id += chars[Math.random() * chars.length | 0];
	return id;
}

function randomInt(min, max) {
	return Math.floor(min + Math.random() * (max - min + 1));
}

server.on('connection', (ws, req) => {
	const currentPlayer = particle.create(0, 100, 0, 0);
	const thrust = {x:0, y:0};
	const currentPlayerMin = {id:0, x:0, y:100, direction:0, hp:0, score:0};

	let DIRECTION = {left:0, right:0, up:0, down:0};
	let direction = 0;
	ws.on('message', data => {
		const DATA = JSON.parse(data);
		if (DATA.start) {
			currentPlayerMin.id = createId();
			currentPlayerMin.x = 0;
			currentPlayerMin.y = 0;
			users.push(currentPlayerMin);
			ws.send(JSON.stringify({id:currentPlayerMin.id}));
			server.clients.forEach(client => {
				client.send(JSON.stringify({users:users}));
			});
			console.log('[INFO] '+currentPlayerMin.id+' connected');


		}
		if (DATA.direction) {
			const mouseDIRECTION = DATA.direction;
			currentPlayerMin.direction = (Math.atan2(mouseDIRECTION.y, mouseDIRECTION.x)).toFixed(2);
			server.clients.forEach(client => {
				client.send(JSON.stringify({users:users}));
			});

		}

		if (DATA.buttons) {
			const button = DATA.buttons;
			
		}

		if (DATA.DIRECTION) {
			DIRECTION = DATA.DIRECTION;
			if (DIRECTION.right) {
				thrust.x = 1.7;
			}
			else if (DIRECTION.left) {
				thrust.x = -1.7;
			}
			else if (DIRECTION.right == 0 || DIRECTION.left == 0) {
				thrust.x = 0;
			}
		}
	});

	// send users info every 33ms
	setInterval(()=> {
		currentPlayer.update();
		currentPlayer.accelerate(thrust.x, thrust.y);
		if(ws.readyState === WebSocket.OPEN) {
			server.clients.forEach(client => {
				client.send(JSON.stringify({users:users}));
			});
		}
		console.log(currentPlayer.x);
		
		if (currentPlayer.x < 0) {
			currentPlayer.x = 0;
		}
		if (currentPlayer.x > MAP.x-100) {
			currentPlayer.x = MAP.x-100;
		}
		currentPlayerMin.x = currentPlayer.x;
		currentPlayerMin.y = currentPlayer.y;
	}, 16);

	/*setInterval(()=> {
		if (ws.readyState === WebSocket.OPEN) {
			//ws.send(JSON.stringify({paz:currentPlayer.x}));
		}
	}, 100); // send users info every 33ms*/



	ws.on('close', () => {
		console.log('[INFO] '+currentPlayerMin.id+' disconnected');
		users.splice(users.indexOf(currentPlayerMin), 1);
		server.clients.forEach(client => {
			client.send(JSON.stringify({users:users}));
		});
		console.log(users);
	});
});
app.listen(8080);