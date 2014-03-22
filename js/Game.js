(function(g) {

    var Game = g.Game = g.Class.extend({

        initialize: function() {
            var self = this;
            g.runtime.game = this;
            this.grid = null;
            this.score = 0;
            new Processing(g.$("#canvas1")[0], function(processing) {
                self.gameStart(processing);
            });
            g.$("#canvas1")[0].focus();
        },

        initGame : function() {
            var self = this;
            g.runtime.p.size(this.options.width, this.options.height);
            g.runtime.p.fill(0, 0, 0);
            g.runtime.p.rect(0, 0, this.options.width, this.options.height);
            this.grid = new g.Grid({
                width: this.options.width,
                height: this.options.height,
                rows: this.options.rows,
                cols: this.options.cols
            });
            this.grid.prepareGrid();
            this.grid.draw(0, 0, this.options.rows, this.options.cols);
            this.pacman = new g.Pacman({
                tile: this.grid.startingTile
            });
            this.ghost = new g.Ghost({
                "tile": this.grid.ghostTile,
                "name": "a"
            });

            g.runtime.p.keyPressed = function(e) {
                self.pacman.control(e);
            }
        },

        gameStart: function(processing) {
            var self = this;
            g.runtime.p = processing;
            g.runtime.p.setup = function () {
                self.initGame();
            }
            g.runtime.p.draw = function() {
                self.gameLoop();
            }
        },

        gameLoop: function() {
            this.pacman.move();
            this.pacman.draw();
            this.grid.drawScore();
            this.ghost.move();
            this.ghost.draw();
        }

    })

    window.createNewGame = function(w, h, rows, cols) {
        new Game({
            width:w,
            height:h,
            rows:rows,
            cols:cols
        });
    }
}(pacmanLib));