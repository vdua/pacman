(function($, processingLib) {
    window.pacmanLib = {
        $: jQuery.noConflict(),
        p: processingLib,
        runtime: {

        },
        globals: {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            fmRate: 30,
            _DOWN: 0,
            _RIGHT: 1,
            _UP: 2,
            _LEFT: 3,
            dirs: ["Bottom", "Right", "Up", "Left"],
            keys: {

            },
            offsetx: 5,
            offsety: 5
        }
    }
    pacmanLib.globals.keys[pacmanLib.globals.DOWN] = pacmanLib.globals._DOWN;
    pacmanLib.globals.keys[pacmanLib.globals.RIGHT] = pacmanLib.globals._RIGHT;
    pacmanLib.globals.keys[pacmanLib.globals.LEFT] = pacmanLib.globals._LEFT;
    pacmanLib.globals.keys[pacmanLib.globals.UP] = pacmanLib.globals._UP;
}(jQuery, Processing));