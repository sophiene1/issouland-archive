'use strict';
(function() {
	const ws = new WebSocket('ws://164.90.226.213:40510'),
	gameArea = document.getElementById('gameArea'),
	context = gameArea.getContext('2d');

	const MAP = {x:6080, y:2400};
	const perso = particle.create(0, 100, 0, 0, 0);
	const thrust = {x:0, y:0};
	const mouseDIRECTION = {x:0, y:0};
	const DIRECTION = {left:0, right:0, up:0, down:0};
	perso.friction = 0.9;

	let direction = 0;
	let id = 0;
	let users = [];
	let balls = [];

	ws.onopen = () => {
		console.log('connected');
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({start:'ent'}));
		}
	}

	ws.onmessage = event => {
		const data = JSON.parse(event.data);
		if (data.direction) {
			direction = data.direction;
		}

		if (data.id) {
			id = data.id;
		}

		if (data.users) {
			users = data.users;
		}


		if (data.paz) {
			perso.x = data.paz;
		}
	}

	ws.onclose = () => {
		console.log('connected');
	}

	function drawRotateRect(rect, angle) {
		context.save();
		context.translate(rect.x+perso.width*.5, rect.y+perso.width*.5);
		context.rotate(angle);
		context.fillRect(0, -10, 100, 20);
		context.restore();
	}

	function drawPerso(p, angle, color, id) {
		context.fillText(id, p.x+20, p.y-20);
		context.strokeRect(p.x, p.y, perso.width, 100);
		context.fillStyle = color;
		context.fillRect(p.x, p.y, perso.width, p.hp);
		context.fillStyle = 'dimgray';
		context.fillStyle = 'black';
		drawRotateRect(p, angle);
	}

	function render(){
		const width = gameArea.width = window.innerWidth;
		const height = gameArea.height = window.innerHeight;

		context.clearRect(0, 0, width, height);
		context.save();
		context.translate(width*.5-50, height*.5-50);
		context.translate(-perso.x, -perso.y);

		// contour de la map
		context.strokeRect(0, -MAP.y, MAP.x, MAP.y+200);
		// cadrillage
		context.fillStyle='#004365'
		for (let i=0;38>i;i++) {
			context.fillRect(160*i,-MAP.y ,4,MAP.y);
			if(15>i) context.fillRect(0, -160*i,MAP.x,4);
		}

		for (let i = 0; i < users.length; i++) {
			const u = users[i];
			if (u.id != id) {
				drawPerso(u, u.direction, 'red', u.id);
			}

			else {
				drawPerso(u, u.direction, 'red', u.id);
			}
		}
		drawPerso(perso, direction, 'orange', id);

		/*perso.update();
		perso.accelerate(thrust.x, thrust.y);*/

		if (perso.x < 0) {
			perso.x = 0;
		}
		if (perso.x > MAP.x-100) {
			perso.x = MAP.x-100;
		}

		console.log(perso.x);

	}

	(function animLoop(){
		render();
		window.requestAnimationFrame(animLoop, gameArea);
	})();

	setInterval(()=> {
		perso.update();
		perso.accelerate(thrust.x, thrust.y);
	}, 16);

	//direction avec la souris
	document.body.addEventListener('mousemove', event => {
		const width = window.innerWidth;
		const height = window.innerHeight;
		mouseDIRECTION.x = event.clientX-width*.5;
		mouseDIRECTION.y = event.clientY-height*.5;
		direction = (Math.atan2(mouseDIRECTION.y, mouseDIRECTION.x)).toFixed(2);
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({direction:{x:mouseDIRECTION.x, y:mouseDIRECTION.y}}));
		}
	});

	/*document.body.addEventListener('mousedown', event =>{
		if (ws.readyState == 1) {
			ws.send(JSON.stringify({button:event.buttons}));
		}
		const ball = particle.create(perso.x+50, perso.y+50, 0, 0, 0);
		bullet.friction = 0.98;

		balls.push(ball);

	});*/

	//commande clavier
	document.addEventListener('keydown', event =>{
		const key = event.key;
		switch(key){
			case 'z': case 'Z': case 'ArrowUp':
				DIRECTION.up = 1;
				break;
			case 's': case 'S': case 'ArrowDown':
				DIRECTION.down = 1;
				break;
			case 'd': case 'D': case 'ArrowRight':
				DIRECTION.right = 1;
				thrust.x = 1.7;
				break;
			case 'q': case 'Q': case 'ArrowLeft':
				DIRECTION.left = 1;
				thrust.x = -1.7;
				break;
			default: return false;
		}
		if (ws.readyState == 1) {
			ws.send(JSON.stringify({DIRECTION:DIRECTION}));
		}
		return false;
	});

	document.addEventListener('keyup', event =>{
		const key = event.key;
		switch(key){
			case 'z': case 'Z': case 'ArrowUp':
				DIRECTION.up = 0;
				break;
			case 's': case 'S': case 'ArrowDown':
				DIRECTION.down = 0;
				break;
			case 'd': case 'D': case 'ArrowRight':
				DIRECTION.right = 0;
				thrust.x = 0;
				break;
			case 'q': case 'Q': case 'ArrowLeft':
				DIRECTION.left = 0;
				thrust.x = 0;
				break;
			default: return false;
		}
		if (ws.readyState == 1) {
			ws.send(JSON.stringify({DIRECTION:DIRECTION}));
		}
		return false;
	});

})();
