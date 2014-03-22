var fmRate = 30,
    _DOWN = 0,
    _RIGHT = 1,
    _UP = 2,
    _LEFT = 3,
    dirs = ["Bottom", "Right", "Up", "Left"],
    keys = {},
    offsetx = 5,
    offsety = 5,
    grid = null,
    pacMan = null,
    gameScore = 0,
    ghost = null;

keys[DOWN] = _DOWN;
keys[RIGHT] = _RIGHT;
keys[UP] = _UP;
keys[LEFT] = _LEFT;

var Tile = function (r, c, w, h, data) {
    this.row = r;
    this.col = c;
    this.w = w;
    this.h = h;
    this.x = offsetx + this.col * this.w;
    this.y = offsety + this.row * this.h;
    this.data = data;

};

Tile.prototype.canMoveInDirection = function (dir) {
    return (this.data & (1 << dir)) !== 0;
};

Tile.prototype.addNeighbour = function (dir, tile) {
    var revDir = (dir + 2) % 4;
    this.data = this.data | (1 << dir);
    this.neighbours[dir] = tile;
    tile.data = tile.data | (1 << (revDir));
    tile.neighbours[revDir] = this;
};

Tile.prototype.eatFood = function () {
    if (this.eaten === false) {
        gameScore += 10;
    }
    this.eaten = true;
};

Tile.prototype.draw = function () {
    var x = this.x,
        y = this.y + this.h,
        xi = [1, 0, -1, 0],
        yi = [0, -1, 0, 1],
        dotRadius = 10;
    noStroke();
    fill(0, 0, 0);
    rect(this.x, this.y, this.w, this.h);
    stroke(0, 255, 255);
    for (var i = 0; i < 4; i++) {
        if (this.canMoveInDirection(i) === false) {
            line(x, y, x + xi[i] * this.w, y + yi[i] * this.h);
        }
        x = x + xi[i] * this.w;
        y = y + yi[i] * this.h;
    }
    if (this.reachable === true && this.eaten === false) {
        noStroke();
        fill(255, 255, 255);
        ellipse(this.x + this.w / 2 - dotRadius / 2,
            this.y + this.h / 2 - dotRadius / 2, dotRadius, dotRadius);
    }
};

var Grid = function (r, c) {
    this.rows = r;
    this.cols = c;
    this.tile_w = this.width / this.rows;
    this.tile_h = this.height / this.cols;
    this.tiles = {};
    this.startingTile = null;
    this.ghostTile = null;
};
Grid.prototype.width = 360;
Grid.prototype.height = 360;
Grid.prototype.addTile = function (tile, start, ghost) {
    this.tiles[tile.row] = this.tiles[tile.row] || {};
    this.tiles[tile.row][tile.col] = tile;
    if (start === true && this.startingTile === null) {
        debug(tile);
        this.startingTile = tile;
    }
    if (ghost === true && this.ghostTile === null) {
        this.ghostTile = tile;
    }
};

Grid.prototype.checkForDirections = function (tile) {
    var r = tile.row,
        c = tile.col;
    if (r > 0 && this.tiles[r - 1][c].canMoveInDirection(_DOWN)) {
        tile.addNeighbour(_UP, this.tiles[r - 1][c]);
    }
    if (c > 0 && this.tiles[r][c - 1].canMoveInDirection(_RIGHT)) {
        tile.addNeighbour(_LEFT, this.tiles[r][c - 1]);
    }
    if (r === this.rows - 1 && tile.canMoveInDirection(_DOWN)) {
        tile.addNeighbour(_DOWN, this.tiles[0][c]);
    }
    if (c === this.cols - 1 && tile.canMoveInDirection(_RIGHT)) {
        tile.addNeighbour(_RIGHT, this.tiles[r][0]);
    }
};

Grid.prototype.prepareGrid = function () {
    var r, c;
    for (r = 0; r < this.rows; r++) {
        for (c = 0; c < this.cols; c++) {
            var tmp = parseInt(random(0, 4), 10),
                tile = new Tile(r, c, this.tile_w, this.tile_h, tmp);
            this.checkForDirections(tile);
            this.addTile(tile, (tile.data & 3) === 3, tile.data === 0);
        }
    }
    this.dfs();
};

Grid.prototype.dfs = function () {
    var stack = [];
    this.startingTile.visited = true;
    stack.push(this.startingTile);
    while (stack.length > 0) {
        var node = stack.pop(),
            n;
        node.reachable = true;
        //debug(node);
        for (n in node.neighbours) {
            var nd = node.neighbours[n];
            if (nd instanceof Tile && nd.visited === false) {
                nd.visited = true;
                stack.push(nd);
            }
        }
    }
};

Grid.prototype.print = function () {
    var s = "";
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            s += this.tiles[i][j].data + " ";
        }
        s += "\n";
    }
    debug(s);
};

Grid.prototype.draw = function (s_r, s_c, e_r, e_c) {
    var t_s_r = s_r < 0 ? 0 : s_r,
        t_s_c = s_c < 0 ? 0 : s_c,
        t_e_r = e_r > this.rows ? this.rows - 1
            : e_r,
        t_e_c = e_c > this.cols ? this.cols - 1
            : e_c,
        x = t_s_c * this.tile_w,
        y = t_s_r * this.tile_h;
    fill(0, 0, 0);
    stroke(0, 0, 0);
    rect(x, y, this.tile_w * (t_e_c - t_s_c) + offsetx + 5,
        this.tile_h * (t_e_r - t_s_r) + offsety + 5);
    for (var r = t_s_r; r < t_e_r; r++) {
        for (var c = t_s_c; c < t_e_c; c++) {
            this.tiles[r][c].draw();
        }
    }
};

Grid.prototype.drawScore = function () {
    fill(0, 0, 0);
    noStroke();
    rect(this.width - this.tile_w,
        this.height + offsety + 1,
        this.tile_w,
        20);
    fill(255, 255, 255);
    text(gameScore + "",
        this.width - this.tile_w + 15,
        this.height + offsety + 20);
};

var PacMan = function (tile) {
    this.tile = tile;
    this.tile.eatFood();
    this.x = this.tile.x + 2;
    this.y = this.tile.y + 2;
    this.w = this.tile.w - 4;
    this.h = this.tile.h - 4;
    this.dir = _RIGHT;
    this.nxtDir = _RIGHT;
    this.animState = -1;
    this.animPos = 0;
    this.frames = 10;
    this.state = 135 - this.dir * 90;
    this.animate = true;
};

PacMan.prototype.tx = [0, 1, 0, -1];
PacMan.prototype.ty = [1, 0, -1, 0];

PacMan.prototype.move = function () {
    if (this.tile.canMoveInDirection(this.dir)) {
        this.prevTile = null;
        this.animate = true;
        this.animPos++;
        this.x += this.tx[this.dir] * this.tile.w / this.frames;
        this.y += this.ty[this.dir] * this.tile.h / this.frames;
        if (this.animPos === this.frames) {
            this.animPos = 0;
            this.prevTile = this.tile;
            this.tile = this.tile.neighbours[this.dir];
            this.x = this.tile.x + 1;
            this.y = this.tile.y + 1;
            this.tile.eatFood();
            this.dir = this.nxtDir;
            this.state = 135 - this.dir * 90;
        }
    } else if (this.animate === true) {
        this.animate = false;
        debug("stop animation");
    }
};

PacMan.prototype.setDirection = function (dir) {
    this.nxtDir = dir;
    if (this.animPos === 0) {
        this.dir = this.nxtDir;
        this.state = 135 - this.dir * 90;
        this.animate = true;
    }
};

PacMan.prototype.draw = function () {
    if (this.animate === true) {
        if (this.prevTile) {
            this.prevTile.draw();
        }
        this.tile.draw();
        fill(0, 0, 0);
        stroke(255, 0, 0);
        noStroke();
        rect(this.x, this.y, this.w, this.h);
        fill(255, 255, 0);
        this.animState = (this.animState + 1) % 9;
        noStroke();
        arc(this.x + this.tile.w / 2,
            this.y + this.tile.w / 2,
            this.w,
            this.h,
            this.state - 5 * (this.animState + 1),
            this.state + 270 + 5 * (this.animState + 1));
        fill(0, 0, 0);
        if (this.x + this.w > grid.width + offsetx) {
            rect(this.tile.x + this.tile.w,
                this.tile.y,
                (this.x + this.w) - (grid.width + offsetx),
                this.tile.h);
        }
        if (this.x < 0) {
            rect(0,
                this.tile.y,
                offsetx,
                this.tile.h);
        }
        if (this.y + this.h > grid.height + offsety) {
            rect(this.tile.x,
                this.tile.y + this.tile.h,
                this.tile.w,
                (this.y + this.h) - (grid.height + offsety));
        }
        if (this.y < 0) {
            rect(this.x,
                0,
                this.tile.w,
                offsety);
        }
    }
};

var Ghost = function (tile, name) {
    this.startingTile = tile;
    this.tile = tile;
    this.name = name;
    this.dir = -1;
    this.x = tile.x + 2;
    this.y = tile.y + 2;
    this.w = tile.w - 4;
    this.h = tile.h - 4;
    this.animPos = 0;
    this.frames = 10;
};

Ghost.prototype.dirs = [
    [],
    [0],
    [1],
    [1, 0],
    [2],
    [2, 0],
    [2, 1],
    [2, 1, 0],
    [3],
    [3, 0],
    [3, 1],
    [3, 1, 0],
    [3, 2],
    [3, 2, 0],
    [3, 2, 1],
    [3, 2, 1, 0]
];

Ghost.prototype.getRandomDir = function (d) {
    if (this.dir !== -1) {
        var revDir = (this.dir + 2) % 4;
        d = d & (15 ^ (1 << revDir));
        if (d === 0) {
            d = 1 << revDir;
        }
    }
    return this.dirs[d][parseInt(random(0, this.dirs[d].length), 10)];
};

Ghost.prototype.move = function () {
    this.prevTile = null;
    if (this.tile === this.startingTile && this.dir === -1) {
        this.dir = this.getRandomDir(15);
        debug(dirs[this.dir]);
    }
    this.animPos++;
    this.x += PacMan.prototype.tx[this.dir] * this.tile.w / this.frames;
    this.y += PacMan.prototype.ty[this.dir] * this.tile.h / this.frames;
    if (this.animPos === this.frames) {
        this.animPos = 0;
        this.prevTile = this.tile;
        if (this.tile === this.startingTile) {
            debug(this.tile.row + " " + this.tile.col);
            debug(PacMan.prototype.tx[this.dir]);
            var r = this.tile.row + PacMan.prototype.ty[this.dir],
                c = this.tile.col + PacMan.prototype.tx[this.dir];
            this.tile = grid.tiles[r][c];
        }
        else {
            this.tile = this.tile.neighbours[this.dir];
        }
        this.x = this.tile.x + 1;
        this.y = this.tile.y + 1;
        this.dir = this.getRandomDir(this.tile.data);
    }
};

Ghost.prototype.draw = function () {
    if (this.prevTile) {
        this.prevTile.draw();
    }
    this.tile.draw();
    fill(0, 0, 0);
    stroke(255, 0, 0);
    noStroke();
    rect(this.x, this.y, this.w, this.h);
    noFill();
    stroke(255, 0, 0);
    rect(this.x, this.y, this.w, this.h);
};

