app.service("TileMapService", function (CanvasService) {
    var canvas;
    var context;

    var overlay = "none";

    this.tileMap = {
        size: 50,
        offset: { x: 0, y: 0 },
        map: [],
        spacing: 1
    };

    this.initTileMap = function (offset, size) {
        CanvasService.initContext('planet', '#ff0000')
        this.tileMap.offset.x = offset.x;
        this.tileMap.offset.y = offset.y;
        this.tileMap.size = size;

        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                this.tileMap.map.push({
                    'pos': { 'x': x, 'y': y },
                    'units': {
                        'attacker': {},
                        'defender': {}
                    },
                    'tank': {
                        'attacker': 0,
                        'defender': 0
                    },
                    'gank': {
                        'attacker': 0,
                        'defender': 0
                    },
                    'exists': true,
                    'selected': false
                });
            }
        }
    };

    this.drawTileMap = function () {
        for (var i = 0; i < this.tileMap.map.length; i++) {
            var tile = this.tileMap.map[i];

            if (tile.exists)
                this.drawTile(tile);
        }
    };

    this.drawTile = function (tile) {
        var tOrigin = {
            x: (tile.pos.x * this.tileMap.size) + (tile.pos.x * this.tileMap.spacing) + this.tileMap.offset.x,
            y: (tile.pos.y * this.tileMap.size) + (tile.pos.y * this.tileMap.spacing) + this.tileMap.offset.y
        };

        var fillStyle = "rgb(255,255,255)";

        if (overlay === "defender.gank")
            fillStyle = "rgb(255,"
                + Math.floor(255 - (tile.gank.defender * 255))
                + ","
                + Math.floor(255 - (tile.gank.defender * 255))
                + ")";

        if (overlay === "attacker.gank")
            fillStyle = "rgb(255,"
                + Math.floor(255 - (tile.gank.attacker * 255))
                + ","
                + Math.floor(255 - (tile.gank.attacker * 255))
                + ")";

        if (overlay === "defender.tank")
            fillStyle = "rgb("
                + Math.floor(255 - (tile.tank.defender * 255))
                + ","
                + Math.floor(255 - (tile.tank.defender * 255))
                + ",255)";
                
        if (overlay === "attacker.tank")
            fillStyle = "rgb("
                + Math.floor(255 - (tile.tank.attacker * 255))
                + ","
                + Math.floor(255 - (tile.tank.attacker * 255))
                + ",255)";

        CanvasService.drawRect(
            {
                x: tOrigin.x,
                y: tOrigin.y
            },
            {
                x: this.tileMap.size,
                y: this.tileMap.size
            },
            fillStyle,
            (tile.selected) ? "#fff" : "#000",
            (tile.selected) ? "6" : "4"
        );

        this.drawUnit(tile.units.attacker, tile.pos, true);
        this.drawUnit(tile.units.defender, tile.pos, false);
    };

    this.drawUnit = function (unit, pos, attacker) {
        if (!angular.isDefined(unit.src)) return;

        var tOrigin = {
            x: (pos.x * this.tileMap.size) + (pos.x * this.tileMap.spacing) + this.tileMap.offset.x,
            y: (pos.y * this.tileMap.size) + (pos.y * this.tileMap.spacing) + this.tileMap.offset.y
        };

        /* draw unit card */
        var src = (attacker) ? unit.svg.attacker : unit.svg.defender;

        CanvasService.drawSVG(
            src,
            {
                x: tOrigin.x + (this.tileMap.size * (0.8 - 0.48)) / 2,
                y: tOrigin.y + ((attacker) ? 0 : this.tileMap.size * 0.5) + (this.tileMap.size * (0.5 - 0.3)) / 2,
                foo: unit.curHealth / unit.health
            },
            {
                x: 0.48 * this.tileMap.size,
                y: 0.30 * this.tileMap.size
            },
            unit.svg
        );

        /* draw health bar */
        var hp = unit.curHealth / unit.health;

        CanvasService.drawRect(
            {
                x: tOrigin.x + this.tileMap.size * 0.8,
                y: tOrigin.y + ((attacker) ? 0 : this.tileMap.size * 0.5) + this.tileMap.size * 0.5
            },
            {
                x: 0.1 * this.tileMap.size,
                y: -hp * 0.5 * this.tileMap.size
            },
            "#f00"
        );

        /* draw morale bar */
        var mp = unit.curMorale / unit.morale;

        CanvasService.drawRect(
            {
                x: tOrigin.x + this.tileMap.size * 0.9,
                y: tOrigin.y + ((attacker) ? 0 : this.tileMap.size * 0.5) + this.tileMap.size * 0.5
            },
            {
                x: 0.1 * this.tileMap.size,
                y: -mp * 0.5 * this.tileMap.size
            },
            "#00f"
        );
    };

    this.drawScene = function (o) {
        if (typeof CanvasService.context === "undefined") return;

        CanvasService.context.clearRect(0, 0, CanvasService.canvas.width, CanvasService.canvas.height);

        overlay = o;
        this.drawTileMap();
    }

    this.getTile = function (evt) {
        var pos = CanvasService.getMousePos(evt);
        pos.x = pos.x / (CanvasService.canvas.width / 100);
        pos.y = pos.y / (CanvasService.canvas.height / 100);

        if (
            (pos.x < this.tileMap.offset.x) ||
            (pos.x > this.tileMap.offset.x + this.tileMap.size * 5 + this.tileMap.spacing * 4) ||
            (pos.y < this.tileMap.offset.y) ||
            (pos.y > this.tileMap.offset.y + this.tileMap.size * 5 + this.tileMap.spacing * 4)
        ) {
            return null;
        }

        var x = Math.floor((pos.x - this.tileMap.offset.x) / (this.tileMap.size + this.tileMap.spacing));
        var y = Math.floor((pos.y - this.tileMap.offset.y) / (this.tileMap.size + this.tileMap.spacing));

        return this.tileMap.map[y * 5 + x];
    };
});