/**
 * Created with IntelliJ IDEA.
 * User: vdua
 * Date: 19/3/14
 * Time: 10:24 AM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with IntelliJ IDEA.
 * User: vdua
 * Date: 19/3/14
 * Time: 10:20 AM
 * To change this template use File | Settings | File Templates.
 */
(function (g) {
    var Ghost = g.Ghost = g.Class.extend({

        dirs: [
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
        ],

        initialize: function () {
            this.startingTile = this.options.tile;
            this.dir = -1;
            this.x = this.options.tile.x + 2;
            this.y = this.options.tile.y + 2;
            this.w = this.options.tile.w - 4;
            this.h = this.options.tile.h - 4;
            this.animPos = 0;
            this.frames = 10;
        },

        getRandomDir : function (d) {
            if (this.dir !== -1) {
                var revDir = (this.dir + 2) % 4;
                d = d & (15 ^ (1 << revDir));
                if (d === 0) {
                    d = 1 << revDir;
                }
            }
            return this.dirs[d][parseInt(Math.random() * this.dirs[d].length, 10)];
        },

        move : function () {
            this.prevTile = null;
            if (this.tile === this.startingTile && this.dir === -1) {
                this.dir = this.getRandomDir(15);
            }
            this.animPos++;
            this.x += g.Pacman.prototype.tx[this.dir] * this.tile.w / this.frames;
            this.y += g.Pacman.prototype.ty[this.dir] * this.tile.h / this.frames;
            if (this.animPos === this.frames) {
                this.animPos = 0;
                this.prevTile = this.tile;
                if (this.tile === this.startingTile) {
                    var r = (this.tile.row + g.Pacman.prototype.ty[this.dir]) % 10,
                        c = (this.tile.col + g.Pacman.prototype.tx[this.dir]) % 10;
                    this.tile = g.runtime.game.grid.tiles[r][c];
                } else {
                    this.tile = this.tile.neighbours[this.dir];
                }
                this.x = this.tile.x + 1;
                this.y = this.tile.y + 1;
                this.dir = this.getRandomDir(this.tile.data);
            }
        },

        draw : function () {
            if (this.prevTile) {
                this.prevTile.draw();
            }
            this.tile.draw();
            g.runtime.p.fill(0, 0, 0);
            g.runtime.p.stroke(255, 0, 0);
            g.runtime.p.noStroke();
            g.runtime.p.rect(this.x, this.y, this.w, this.h);
            g.runtime.p.noFill();
            g.runtime.p.stroke(255, 0, 0);
            g.runtime.p.rect(this.x, this.y, this.w, this.h);
        }
    });

    Ghost.createSimpleProps(["tile", "name"]);
}(pacmanLib));
