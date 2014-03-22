/**
 * Created with IntelliJ IDEA.
 * User: vdua
 * Date: 19/3/14
 * Time: 10:20 AM
 * To change this template use File | Settings | File Templates.
 */
(function (g) {
    var Grid = g.Grid = g.Class.extend({

        initialize: function () {
            this.tile_w = this.width / this.rows;
            this.tile_h = this.height / this.cols;
            this.tiles = [];
            this.startingTile = null;
            this.ghostTile = null;
        },

        addTile : function (tile, start, ghost) {
            this.tiles[tile.row] = this.tiles[tile.row] || [];
            this.tiles[tile.row][tile.col] = tile;
            if (start === true && this.startingTile === null) {
                this.startingTile = tile;
            }
            if (ghost === true && this.ghostTile === null) {
                this.ghostTile = tile;
            }
        },

        checkForDirections : function (tile) {
            var r = tile.row,
                c = tile.col;
            if (r > 0 && this.tiles[r - 1][c].canMoveInDirection(g.globals._DOWN)) {
                tile.addNeighbour(g.globals._UP, this.tiles[r - 1][c]);
            }
            if (c > 0 && this.tiles[r][c - 1].canMoveInDirection(g.globals._RIGHT)) {
                tile.addNeighbour(g.globals._LEFT, this.tiles[r][c - 1]);
            }
            if (r === this.rows - 1 && tile.canMoveInDirection(g.globals._DOWN)) {
                tile.addNeighbour(g.globals._DOWN, this.tiles[0][c]);
            }
            if (c === this.cols - 1 && tile.canMoveInDirection(g.globals._RIGHT)) {
                tile.addNeighbour(g.globals._RIGHT, this.tiles[r][0]);
            }
        },

        prepareGrid : function () {
            var r, c;
            for (r = 0; r < this.rows; r++) {
                for (c = 0; c < this.cols; c++) {
                    var tmp = parseInt(4 * Math.random(), 10),
                        tile = new g.Tile( {
                            "row" : r,
                            "col" : c,
                            "w" : this.tile_w,
                            "h" : this.tile_h,
                            "data": tmp
                        });
                    this.checkForDirections(tile);
                    this.addTile(tile, (tile.data & 3) === 3, tile.data === 0);
                }
            }
            this.dfs();
        },

        dfs : function () {
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
                    if (nd instanceof g.Tile && nd.visited === false) {
                        nd.visited = true;
                        stack.push(nd);
                    }
                }
            }
        },

        print : function () {
            var s = "";
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    s += this.tiles[i][j].data + " ";
                }
                s += "\n";
            }
            //debug(s);
        },

        draw : function (s_r, s_c, e_r, e_c) {
            var t_s_r = s_r < 0 ? 0 : s_r,
                t_s_c = s_c < 0 ? 0 : s_c,
                t_e_r = e_r > this.rows ? this.rows - 1
                    : e_r,
                t_e_c = e_c > this.cols ? this.cols - 1
                    : e_c,
                x = t_s_c * this.tile_w,
                y = t_s_r * this.tile_h;
            g.runtime.p.fill(0, 0, 0);
            g.runtime.p.stroke(0, 0, 0);
            g.runtime.p.rect(x, y, this.tile_w * (t_e_c - t_s_c) + g.globals.offsetx + 5,
                this.tile_h * (t_e_r - t_s_r) + g.globals.offsety + 5);
            for (var r = t_s_r; r < t_e_r; r++) {
                for (var c = t_s_c; c < t_e_c; c++) {
                    this.tiles[r][c].draw();
                }
            }
        },

        drawScore : function () {
            g.runtime.p.fill(0, 0, 0);
            g.runtime.p.noStroke();
            g.runtime.p.rect(this.width - this.tile_w,
                this.height + g.globals.offsety + 1,
                this.tile_w,
                20);
            g.runtime.p.fill(255, 255, 255);
            g.runtime.p.text(g.runtime.gameScore + "",
                this.width - this.tile_w + 15,
                this.height + g.globals.offsety + 20);
        }
    })

    Grid.createSimpleProps(["rows", "cols", "width", "height"])
}(pacmanLib));
