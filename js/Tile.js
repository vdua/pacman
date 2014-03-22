(function (g) {
    var Tile = g.Tile = g.Class.extend({

        initialize: function() {
            this.x = this.col * this.w;
            this.y = this.row * this.h;
            this.visited = false;
            this.eaten = false;
            this.reachable = false;
            this.neighbours = {};
        },

        canMoveInDirection : function (dir) {
            return (this.data & (1 << dir)) !== 0;
        },

        addNeighbour : function (dir, tile) {
            var revDir = (dir + 2) % 4;
            this.data = this.data | (1 << dir);
            this.neighbours[dir] = tile;
            tile.data = tile.data | (1 << (revDir));
            tile.neighbours[revDir] = this;
        },

        eatFood : function () {
            if (this.eaten === false) {
                g.runtime.game.score += 10;
            }
            this.eaten = true;
        },

        draw : function () {
            var x = this.x,
                y = this.y + this.h,
                xi = [1, 0, -1, 0],
                yi = [0, -1, 0, 1],
                dotRadius = 10;
            g.runtime.p.noStroke();
            g.runtime.p.fill(0, 0, 0);
            g.runtime.p.rect(this.x, this.y, this.w, this.h);
            g.runtime.p.stroke(0, 255, 255);
            for (var i = 0; i < 4; i++) {
                if (this.canMoveInDirection(i) === false) {
                    g.runtime.p.line(x, y, x + xi[i] * this.w, y + yi[i] * this.h);
                }
                x = x + xi[i] * this.w;
                y = y + yi[i] * this.h;
            }
            if (this.reachable === true && this.eaten === false) {
                g.runtime.p.noStroke();
                g.runtime.p.fill(255, 255, 255);
                g.runtime.p.ellipse(this.x + this.w / 2 - dotRadius / 2,
                    this.y + this.h / 2 - dotRadius / 2, dotRadius, dotRadius);
            }
        }
    })

    Tile.createSimpleProps(["col","row","w","h", "data"])
}(pacmanLib));