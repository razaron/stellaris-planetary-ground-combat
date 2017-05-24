app.controller('PlanetCtrl', function ($scope, TileMapService) {
    var cvs = document.getElementById('planet');
    var tMapOffset = { 'x': 3, 'y': 3 };
    var tSize = 18;

    function initPlanet() {
        TileMapService.initTileMap(tMapOffset, tSize);

        var metaballs = [];
        for (var i = 0; i < 1 + Math.floor(5 * Math.random()); i++) {
            metaballs.push({ x: 1 + Math.random() * 3, y: 1 + Math.random() * 3, k: 3 + 2 * Math.random() });
        }

        console.log(metaballs.length);

        /* Generate map */
        for (var i = 0; i < TileMapService.tileMap.map.length; i++) {
            var tile = TileMapService.tileMap.map[i];

            var magnitude = 0;
            for (var j = 0; j < metaballs.length; j++) {
                var p1 = tile.pos;
                var p2 = metaballs[j];

                var distSqr = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
                magnitude += p2.k / distSqr;
            }

            if (magnitude > 2) {

            }
            else {
                tile.exists = false;
            }
        }

        TileMapService.drawScene($scope.$parent.overlay.selected);
    };

    function selectTile(e) {
        var tile = TileMapService.getTile(e);

        if (tile === null || !tile.exists) return;

        if ($scope.$parent.curTile === tile) {
            if ($scope.$parent.defender.selected) {
                addUnit("defender", tile);
            }
            else{
                resetUnit("defender", tile.units.defender);
            }

            if ($scope.$parent.attacker.selected) {
                addUnit("attacker", tile);
            }
            else{
                resetUnit("attacker", tile.units.attacker);
            }
        }

        $scope.$parent.curTile.selected = false;
        $scope.$parent.curTile = tile;
        $scope.$parent.curTile.selected = true;

        $scope.$apply(function () {
            $scope.$parent.defender.show = (tile.units.defender.health !== undefined);
            $scope.$parent.attacker.show = (tile.units.attacker.health !== undefined);
        });

        TileMapService.drawScene($scope.$parent.overlay.selected);
    };

    function addUnit(sideStr, tileObj) {
        var unit = {};

        _.merge(unit, $scope.$parent[sideStr].selected);
        unit.curHealth = unit.health;
        unit.curMorale = unit.morale;

        tileObj.units[sideStr] = (typeof tileObj.units[sideStr] === "object") ? tileObj.units[sideStr] : {};
        tileObj.units[sideStr] = unit;

        $scope.$parent[sideStr].units.push(unit);
    };

    function resetUnit(sideStr, unitObj) {
        // removes reference to unitObj on a side
        var side = $scope.$parent[sideStr];
        var unitIndex = side.units.indexOf(unitObj);
        side.units.splice(unitIndex, 1);
        
        console.log(side.units);
        // removes reference to unitObj on a tile
        var tMap = TileMapService.tileMap.map;
        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];

            if (t.units[sideStr] === unitObj)
                t.units[sideStr] = {};
        }

        TileMapService.drawScene($scope.$parent.overlay.selected);
    };

    function resetUnits(sideStr) {
        // removes references to a sides units
        var side = $scope.$parent[sideStr];
        side.units = [];

        // removes references to the units on the tiles
        var tMap = TileMapService.tileMap.map;
        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];

            t.units[sideStr] = {};
        }

        TileMapService.drawScene($scope.$parent.overlay.selected);
    };

    function calcGank() {

    }

    angular.element(document).ready(function () {
        $scope.$parent.$watch('defender.roster', function (newValue, oldValue) {
            console.log("sad");
            resetUnits("defender");
            $scope.$parent.defender.selected = {};
        });

        $scope.$parent.$watch('attacker.roster', function (newValue, oldValue) {
            resetUnits("attacker");
            $scope.$parent.attacker.selected = {};
        });

        $scope.$parent.$watch('pendingRequests', function (newValue, oldValue) {
            if (newValue == 0) {
                console.log($scope.$parent.attacker);
                console.log($scope.$parent.defender);

                initPlanet();

                window.addEventListener('click', selectTile, false);
            }
        });
    });

});