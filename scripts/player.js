function Player(x, y, map) {
	var _x = x;
	var _y = y;
	var _color = "#0f0";
	var _inventory = [];

	this.rep = "@";

	this.map = map;
	this.display = map.display;
	this.game = map.game;

	this.canMove = false;

	this.getX = function () { return _x; }
	this.getY = function () { return _y; }

	this.getColor = function () { return _color; }
	this.setColor = function (c) {
		_color = c;
		this.draw();
	}

	this.init = function () {
	}

	this.draw = function () {
		var bgColor = this.map.getGrid()[_x][_y].bgColor
		this.display.draw(_x, _y, this.rep, _color, bgColor);
	}

	this.atLocation = function (x, y) {
		return (_x === x && _y === y);
	}

	this.move = function (direction) {
		// are we allowing keyboard input right now?
		if (!this.canMove) {
			return false;
		}

		var cur_x = _x;
		var cur_y = _y;
		var new_x;
		var new_y;

		if (direction === 'up') {
			new_x = cur_x;
			new_y = cur_y - 1;
		}
		else if (direction === 'down') {
			new_x = cur_x;
			new_y = cur_y + 1;
		}
		else if (direction === 'left') {
			new_x = cur_x - 1;
			new_y = cur_y;
		}
		else if (direction === 'right') {
			new_x = cur_x + 1;
			new_y = cur_y;
		}
		else if (direction === 'rest') {
			new_x = cur_x;
			new_y = cur_y;
		}

		if (this.map.canMoveTo(new_x, new_y)) {
			this.display.drawObject(map, cur_x, cur_y, this.map.getGrid()[cur_x][cur_y].type, this.map.getGrid()[cur_x][cur_y].bgColor);
			_x = new_x;
			_y = new_y;
			this.draw();
			this.afterMove(_x, _y);
		}
	};

	this.afterMove = function (x, y) {
		player = this;

		// check for collision with static object
		var objectName = this.map.getGrid()[x][y].type;
		var object = this.map.objects[objectName];
		if (object.type == 'item') {
			this.pickUpItem(objectName, object);
		} else if (object.onCollision) {
			this.game.validateCallback(function () {
				object.onCollision(player, player.game)
			});
		}

		// check for collision with dynamic object
		for (var i = 0; i < this.map.getDynamicObjects().length; i++) {
			var object = this.map.getDynamicObjects()[i];
			if (object.getX() === x && object.getY() === y) {
				this.map.objects[object.getType()].onCollision(player, object);
			}
		}

		this.game.display.drawAll(this.map); // in case there are any artifacts

		this.map.moveAllDynamicObjects();
	}

	this.killedBy = function (killer) {
		this.game.sound.playSound('hurt');
		this.game.restartLevel();
		this.game.output.write('You have been killed by ' + killer + '!');
	}

	this.pickUpItem = function (objectName, object) {
		player = this;

		if (object.isGlobal) {
			this.game.addToGlobalInventory(objectName);
		} else {
			_inventory.push(objectName);
		}
		map.itemPickedUp(_x, _y, objectName);
		map.refresh();

		if (object.onPickUp) {
			this.game.validateCallback(function () {
				object.onPickUp(player, player.game)
			});
		}
	}

	this.hasItem = function (item) {
		return (_inventory.indexOf(item) > -1) || (this.game.checkGlobalInventory(item));
	}

	this.setPhoneCallback = function(func) {
	    this._phoneFunc = func;
	}

	// Constructor
	this.init();
}
