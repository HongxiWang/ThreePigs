var boardBuilder = {
	isOutside: function(r, c) {
		if(r === 0) {
			return c == 0 || c == 3;
		}
		return r == 3 && c == 0;
	},
	createCells: function() {
		var cells = [];
		for(var r = 0; r < 4; r++) {
			for(var c = 0; c < 4; c++) {
				var cell = new Cell(r, c);
				if(this.isOutside(r, c)) {
					cell.enabled = false;
				}
				cells.push(cell);
			}
		}
		return cells;
	},
	createBar1: function() { //直边
		var bar = new Bar('1');
		var cells1 = [];
		cells1.push(new Cell(0, 0));
		cells1.push(new Cell(0, 1, true));
		cells1.push(new Cell(0, 2));
		bar.cells.push(cells1);
		var cells2 = [];
		cells2.push(new Cell(0, 0));
		cells2.push(new Cell(1, 0, true));
		cells2.push(new Cell(2, 0));
		bar.cells.push(cells2);
		return bar;
	},
	createBar2: function() { //等边
		var bar = new Bar('2');
		var cells = [];
		cells.push(new Cell(0, 0));
		cells.push(new Cell(0, 1, true));
		cells.push(new Cell(1, 1));
		bar.cells.push(cells);

		cells = [];
		cells.push(new Cell(0, 0));
		cells.push(new Cell(1, 0, true));
		cells.push(new Cell(1, -1));
		bar.cells.push(cells);

		cells = [];
		cells.push(new Cell(0, 0));
		cells.push(new Cell(0, -1, true));
		cells.push(new Cell(-1, -1));
		bar.cells.push(cells);

		cells = [];
		cells.push(new Cell(0, 0));
		cells.push(new Cell(-1, 0, true));
		cells.push(new Cell(-1, 1));
		bar.cells.push(cells);
		return bar;
	},
	createBar3: function() { //不等边
		var bar = new Bar('3');
		var cells = [];
		cells.push(new Cell(0, 0));
		cells.push(new Cell(0, 1, true));
		cells.push(new Cell(1, 1));
		cells.push(new Cell(2, 1));
		bar.cells.push(cells);

		cells = [];
		cells.push(new Cell(0, 0));
		cells.push(new Cell(1, 0, true));
		cells.push(new Cell(1, -1));
		cells.push(new Cell(1, -2));
		bar.cells.push(cells);

		cells = [];
		cells.push(new Cell(0, 0));
		cells.push(new Cell(0, -1, true));
		cells.push(new Cell(-1, -1));
		cells.push(new Cell(-2, -1));
		bar.cells.push(cells);

		cells = [];
		cells.push(new Cell(0, 0));
		cells.push(new Cell(-1, 0, true));
		cells.push(new Cell(-1, 1));
		cells.push(new Cell(-1, 2));
		bar.cells.push(cells);
		return bar;
	}
};

function Cell(r, c, h) {
	this.r = r;
	this.c = c;
	this.enabled = true;
	if(typeof h !== undefined) {
		this.house = h;
	} else {
		this.house = false;
	}
	this.used = false;
}

function Place(index, r, c) {
	this.index = index;
	this.r = r;
	this.c = c;
}

function Puzzle(p1, p2, p3) {
	this.blanks=[];
	this.housed=[];
	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;
}

function Bar(name) {
	this.name = name;
	this.index = 0;
	this.r = 0;
	this.c = 0;
	this.used = false;
	this.tried = false;
	this.cells = [];
	this.places = [];
	this.drawCells = function() {
			var barCells = this.cells[this.index];
			var draws = [];
			var self = this;
			barCells.forEach(function(cell) {
				var dc = new Cell(cell.r + self.r, cell.c + self.c);
				dc.house = cell.house;
				draws.push(dc);
			});
			return draws;
		},
		this.reset = function() {
			this.index = 0;
			this.r = 0;
			this.c = 0;
			this.used = false;
			this.tried = false;
		}
}

var puzzle = new Vue({
	el: '#puzzle',
	data: {
		cells: boardBuilder.createCells(),
		bars: [boardBuilder.createBar1(), boardBuilder.createBar2(), boardBuilder.createBar3()],
		puzzles:[],
		solve: false,
		index:0,
		mode:'day',
		dayPuzzles:[]
	},
	created: function() {
		this.puzzles = this._placeBars(this.bars);
		var days = [];
		var nights = [];
		var self = this;
		this.puzzles.forEach(function(p){
			self.resetCells();
			self._solvePuzzle(p);
			for(var i=0;i<self.cells.length;i++){
				var cell = self.cells[i];
				if (cell.enabled && !cell.used){
					p.blanks.push(i);
				}
			}
			if(!self.findDayPuzzle(p,days)){
				days.push(p);
			}
		});
		this.dayPuzzles = days;
		this.changePuzzle();
	},
	computed: {
		bar1Cells: function() {
			var barCells = this.cells[this.index];
			var draws = [];
			barCells.forEach(function(cell) {
				var dc = new Cell(cell.r + this.r, cell.c + this.c);
				dc.house = cell.house;
				draws.push(dc);
			});
			return draws;
		}
	},
	methods: {
		getCell: function(r, c) {
			if(r < 0 || c < 0 || r > 3 || c > 3) {
				return null;
			}
			var index = r * 4 + c;
			if(index < 0 || index >= this.cells.length) {
				return null;
			}
			var cell = this.cells[index];
			if(!cell.enabled) {
				return null;
			}
			return cell;
		},
		findDayPuzzle:function(p,lst){
			if(lst.length===0){
				return null;
			}
			for(var i=0;i<lst.length;i++){
				var po = lst[i];
				if(p.blanks.join('-')===po.blanks.join('-')){
					return po;
				}
			}
			return null;
		},
		findNightPuzzle:function(p,lst){
			if(lst.length===0){
				return null;
			}
			for(var i=0;i<lst.length;i++){
				var po = lst[i];
				if(p.housed.join('-')===po.housed.join('-') && p.wolf === po.wolf){
					return po;
				}
			}
			return null;
		},
		_placeable: function(bar, r, c) { //计算bar是否可以放置
			bar.r = r;
			bar.c = c;
			var barCells = bar.drawCells();
			for(var i = 0; i < barCells.length; i++) {
				var bc = barCells[i];
				var cell = this.getCell(bc.r, bc.c);
				if(cell == null || cell.used) {
					return false;
				}
			}
			return true;
		},
		placeBar: function(bar) {
			var cells = bar.drawCells();
			var self = this;
			cells.forEach(function(obj) {
				var cell = self.getCell(obj.r, obj.c);
				cell.used = true;
				cell.house = obj.house;
			});
			bar.used = true;
		},
		_resetBar: function(bar) {
			var barCells = bar.drawCells();
			for(var i = 0; i < barCells.length; i++) {
				var bc = barCells[i];
				var cell = this.getCell(bc.r, bc.c);
				if(cell != null) {
					cell.used = false;
				}
			}
		},
		resetCells: function() {
			this.cells.forEach(function(obj) {
				obj.used = false;
				obj.house = false;
			});
		},
		resetBars: function() {
			this.bars.forEach(function(obj) {
				obj.reset();
			});
		},
		solvePuzzle:function(){
			var puzzle = this.dayPuzzles[this.index];
			this._solvePuzzle(puzzle);	
			this.solve = true;
		},
		_solvePuzzle:function(puzzle){
			var bar1 = this.bars[0];
			bar1.index = puzzle.p1.index;
			bar1.r = puzzle.p1.r;
			bar1.c = puzzle.p1.c;
			var bar2 = this.bars[1];
			bar2.index = puzzle.p2.index;
			bar2.r = puzzle.p2.r;
			bar2.c = puzzle.p2.c;
			var bar3 = this.bars[2];
			bar3.index = puzzle.p3.index;
			bar3.r = puzzle.p3.r;
			bar3.c = puzzle.p3.c;
			this.placeBar(bar1);
			this.placeBar(bar2);
			this.placeBar(bar3);
		},
		changePuzzle:function(){
			this.resetCells();
			this.resetBars();
			this._solvePuzzle(this.dayPuzzles[this.index]);
			this.solve = false;
		},
		_getBar: function(bars) {
			for(var i = 0; i < bars.length; i++) {
				var bar = bars[i];
				if(!bar.used && !bar.tried) {
					return bar;
				}
			}
			return null;
		},
		_allPlaces: function(bar) {
			bar.places = [];
			for(var ci = 0; ci < this.cells.length; ci++) {
				bar.reset();
				var cell = this.cells[ci];
				if(!cell.enabled) {
					continue;
				}
				for(var i = 0; i < bar.cells.length; i++) {
					bar.index = i;
					if(this._placeable(bar, cell.r, cell.c)) {
						bar.places.push(new Place(i, cell.r, cell.c));
					}
				}
			}
		},
		_placeBars: function(bars) {
			var bar = bars[0];
			this._allPlaces(bar);
			var puzzles = [];
			for(var i = 0; i < bar.places.length; i++) {
				this.resetCells();
				this.resetBars();
				var p = bar.places[i];
				bar.index = p.index;
				bar.r = p.r;
				bar.c = p.c;
				this.placeBar(bar);
				for(var ci = 0; ci < this.cells.length; ci++) {
					var bar2 = bars[1];
					this._allPlaces(bar2);
					if(bar2.places.length > 0) {
						for(var j = 0; j < bar2.places.length; j++) {
							var p2 = bar2.places[j];
							bar2.index = p2.index;
							bar2.r = p2.r;
							bar2.c = p2.c;
							this.placeBar(bar2);
							var bar3 = bars[2];
							this._allPlaces(bar3);
							if(bar3.places.length > 0) { //print all out
								for(var z = 0; z < bar3.places.length; z++) {
									var p3 = bar3.places[z];
									puzzles.push(new Puzzle(p, p2, p3));
								}
							}
							this._resetBar(bar2);
						}
					}
				}
			}
			return puzzles;
		}
	}
});