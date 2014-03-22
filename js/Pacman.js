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
    var Pacman = g.Pacman = g.Class.extend({

        tx: [0, 1, 0, -1],

        ty: [1, 0, -1, 0],

        initialize: function () {
            this.tile.eatFood();
            this.x = this.tile.x + 2;
            this.y = this.tile.y + 2;
            this.size = Math.min(this.tile.w - 4, this.tile.h - 4);
            this.dir = g.globals._RIGHT;
            this.nxtDir = g.globals._RIGHT;
            this.animState = -1;
            this.animPos = 0;
            this.frames = 10;
            this.state = 135 - this.dir * 90;
            this.animate = true;
        },
        move : function () {
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
                //debug("stop animation");
            }
        },
        setDirection : function (dir) {
            this.nxtDir = dir;
            if (this.animPos === 0) {
                this.dir = this.nxtDir;
                this.state = 135 - this.dir * 90;
                this.animate = true;
            }
        },

        draw : function () {
            if (this.animate === true) {
                if (this.prevTile) {
                    this.prevTile.draw();
                }
                this.tile.draw();
                g.runtime.p.fill(0, 0, 0);
                g.runtime.p.stroke(255, 0, 0);
                g.runtime.p.noStroke();
                g.runtime.p.rect(this.x, this.y, this.size, this.size);
                g.runtime.p.fill(255, 255, 0);
                this.animState = (this.animState + 1) % 9;
                g.runtime.p.noStroke();
                g.runtime.p.arc(this.x + this.size / 2,
                    this.y + this.size / 2,
                    this.size,
                    this.size,
                    g.runtime.p.radians(this.state - 5 * (this.animState + 1)),
                    g.runtime.p.radians(this.state + 270 + 5 * (this.animState + 1)));
                g.runtime.p.fill(0, 0, 0);
                if (this.x + this.size > g.runtime.game.grid.width + g.globals.offsetx) {
                    g.runtime.p.rect(this.tile.x + this.tile.w,
                        this.tile.y,
                        (this.x + this.size) - (g.runtime.game.grid.width + g.globals.offsetx),
                        this.tile.h);
                }
                if (this.x < 0) {
                    g.runtime.p.rect(0,
                        this.tile.y,
                        g.globals.offsetx,
                        this.tile.h);
                }
                if (this.y + this.size > g.runtime.game.grid.height + g.globals.offsety) {
                    g.runtime.p.rect(this.tile.x,
                        this.tile.y + this.tile.h,
                        this.tile.w,
                        (this.y + this.size) - (g.runtime.game.grid.height + g.globals.offsety));
                }
                if (this.y < 0) {
                    g.runtime.p.rect(this.x,
                        0,
                        this.tile.w,
                        g.globals.offsety);
                }
            }
        },
        control: function() {
            var keyCode = g.runtime.p.keyCode;
            switch (keyCode) {
                case 32:
                    //pause on space;
                    break;
                default:
                    if (typeof g.globals.keys[keyCode] !== "undefined") {
                        this.setDirection(g.globals.keys[keyCode]);
                    } else {
                        console.log(keyCode);
                    }
            }
        }
    });

    Pacman.createSimpleProps(["tile"])
}(pacmanLib));
