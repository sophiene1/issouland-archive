var Arm = Arm || {
	x: 0,
	y: 0,
	length:50,
	angle: 0,
	centerAngle: 0,
	rotationRange: Math.PI / 4,
	parent: null,
	phaseOffset: 0,

	create: function(length, centerAngle, rotationRange, phaseOffset) {
		var obj = Object.create(this);
		obj.init(length, centerAngle, rotationRange, phaseOffset);
		return obj;
	},

	init: function(length, centerAngle, rotationRange, phaseOffset) {
		this.length = length;
		this.centerAngle = centerAngle;
		this.rotationRange = rotationRange;
		this.phaseOffset = phaseOffset;
	},

	setPhase: function(phase) {
		this.angle = this.centerAngle + Math.sin(phase + this.phaseOffset) * this.rotationRange;
	},

	getEndX: function() {
		var angle = this.angle,
			parent = this.parent;
		while(parent) {
			angle += parent.angle;
			parent = parent.parent;
		}
		return this.x + Math.cos(angle) * this.length;
	},

	getEndY: function() {
		var angle = this.angle,
			parent = this.parent;
		while(parent) {
			angle += parent.angle;
			parent = parent.parent;
		}
		return this.y + Math.sin(angle) * this.length;
	},

	render: function(context) {
		context.save();
		context.translate(this.x, this.y);
		context.rotate(this.angle);
		context.fillRect(0, -10, this.length, 20);
		context.restore();
	}
};