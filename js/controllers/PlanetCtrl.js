app.controller('PlanetCtrl', function ($scope, $filter, TileMapService) {
    var cvs = document.getElementById('planet');
    var tMapOffset = { 'x': 3, 'y': 3 };
    var tSize = 18;

    function initPlanet() {
        TileMapService.initTileMap(tMapOffset, tSize);

        var metaballs = [];
        for (var i = 0; i < 1 + Math.floor(5 * Math.random()); i++) {
            metaballs.push({ x: 1 + Math.random() * 3, y: 1 + Math.random() * 3, k: 3 + 2 * Math.random() });
        }

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

        updateScene();
    };

    function selectTile(e) {
        var tile = TileMapService.getTile(e);

        if (tile === null || !tile.exists) return;

        if ($scope.$parent.curTile === tile) {
            if (!angular.equals($scope.$parent.attacker.selected, {})) {
                if (!angular.equals(tile.units.attacker, {}))
                    resetUnit("attacker", tile.units.attacker);

                addUnit("attacker", tile);
            }
            else {
                resetUnit("attacker", tile.units.attacker);
            }
            if (!angular.equals($scope.$parent.defender.selected, {})) {
                if (!angular.equals(tile.units.defender, {}))
                    resetUnit("defender", tile.units.defender);

                addUnit("defender", tile);
            }
            else {
                resetUnit("defender", tile.units.defender);
            }

        }

        $scope.$parent.curTile.selected = false;
        $scope.$parent.curTile = tile;
        $scope.$parent.curTile.selected = true;

        $scope.$apply();

        updateScene();
    };

    function addUnit(sideStr, tileObj) {
        var unit = {};

        _.merge(unit, $scope.$parent[sideStr].selected);
        unit.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        unit.curHealth = unit.health;
        unit.curMorale = unit.morale;

        tileObj.units[sideStr] = (typeof tileObj.units[sideStr] === "object") ? tileObj.units[sideStr] : {};
        tileObj.units[sideStr] = unit;

        $scope.$parent[sideStr].units.push(unit);

        updateScene();
    };

    function resetUnit(sideStr, unitObj) {
        // removes reference to unitObj on a side
        var side = $scope.$parent[sideStr];
        var unitIndex = side.units.indexOf(unitObj);

        if (unitIndex === -1) return;

        side.units.splice(unitIndex, 1);

        // removes reference to unitObj on a tile
        var tMap = TileMapService.tileMap.map;
        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];

            if (t.units[sideStr] === unitObj)
                t.units[sideStr] = {};
        }

        Object.keys(unitObj.svg).forEach(function (key) { delete unitObj.svg[key]; });
        
        updateScene();
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

        updateScene();
    };

    function calcGankMap() {
        var tMap = TileMapService.tileMap.map;
        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];
            t.gank.defender = 0;
            t.gank.attacker = 0;
        }

        /* 
            calculates non-normalized gank values
        */
        for (var i = 0; i < $scope.$parent.defender.units.length; i++) {
            var unitObj = $scope.$parent.defender.units[i];
            calcGank("defender", unitObj);
        }

        for (var i = 0; i < $scope.$parent.attacker.units.length; i++) {
            var unitObj = $scope.$parent.attacker.units[i];
            calcGank("attacker", unitObj);
        }

        /* 
            normalizes gank values
        */
        var aMax = 0,
            dMax = 0;
        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];

            if (t.gank.defender > dMax)
                dMax = t.gank.defender;

            if (t.gank.attacker > aMax)
                aMax = t.gank.attacker;
        }

        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];

            if (dMax !== 0)
                t.gank.defender /= dMax;

            if (aMax !== 0)
                t.gank.attacker /= aMax;
        }
    };

    function calcGank(sideStr, unitObj) {
        var tMap = TileMapService.tileMap.map;
        var t;

        if (sideStr === "defender")
            t = $filter('filter')(tMap, { units: { defender: unitObj } }, true);

        if (sideStr === "attacker")
            t = $filter('filter')(tMap, { units: { attacker: unitObj } }, true);

        if (t.length) {
            var t1 = t[0];
            var max = 0;

            for (var i = 0; i < tMap.length; i++) {
                var t2 = tMap[i];

                var p1 = t1.pos,
                    p2 = t2.pos;

                var dx = Math.abs(p2.x - p1.x),
                    dy = Math.abs(p2.y - p1.y);

                var distSqr = (dx) * (dx) + (dy) * (dy) + 1;
                distSqr = (distSqr === 0) ? 1 : distSqr;

                t2.gank[sideStr] += ((unitObj.mDamage + unitObj.hDamage) * (unitObj.curMorale / unitObj.morale)) / distSqr;
            }
        }
    };

    function calcTankMap() {
        var tMap = TileMapService.tileMap.map;
        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];
            t.tank.defender = 0;
            t.tank.attacker = 0;
        }

        /* 
            calculates non-normalized tank values
        */
        for (var i = 0; i < $scope.$parent.defender.units.length; i++) {
            var unitObj = $scope.$parent.defender.units[i];
            calcTank("defender", unitObj);
        }

        for (var i = 0; i < $scope.$parent.attacker.units.length; i++) {
            var unitObj = $scope.$parent.attacker.units[i];
            calcTank("attacker", unitObj);
        }

        /* 
            normalizes tank values
        */
        var aMax = 0,
            dMax = 0;
        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];

            if (t.tank.defender > dMax)
                dMax = t.tank.defender;

            if (t.tank.attacker > aMax)
                aMax = t.tank.attacker;
        }

        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];

            if (dMax !== 0)
                t.tank.defender /= dMax;

            if (aMax !== 0)
                t.tank.attacker /= aMax;
        }
    };

    function calcTank(sideStr, unitObj) {
        var tMap = TileMapService.tileMap.map;
        var t;

        if (sideStr === "defender")
            t = $filter('filter')(tMap, { units: { defender: unitObj } }, true);

        if (sideStr === "attacker")
            t = $filter('filter')(tMap, { units: { attacker: unitObj } }, true);

        if (t.length) {
            var t1 = t[0];
            var max = 0;

            for (var i = 0; i < tMap.length; i++) {
                var t2 = tMap[i];

                var p1 = t1.pos,
                    p2 = t2.pos;

                var dx = Math.abs(p2.x - p1.x),
                    dy = Math.abs(p2.y - p1.y);

                var distSqr = (dx) * (dx) + (dy) * (dy) + 1;
                distSqr = (distSqr === 0) ? 1 : distSqr;

                t2.tank[sideStr] += (unitObj.curHealth) / distSqr;
            }
        }
    };

    function updateScene() {
        calcGankMap();
        calcTankMap();
        TileMapService.drawScene($scope.$parent.overlay.selected);
    }

    function updateSim() {
        if (!$scope.$parent.pendingUpdate) return;

        unitsMove("defender", "light");
        unitsAttack("defender", "light");

        console.log("updated sim");
    }

    function unitsMove(sideStr, classStr) {
        var units = $scope.$parent[sideStr].units;
        var tMap = TileMapService.tileMap.map;

        //gets the subset of units belonging to class classStr
        units = $filter('filter')(units, { 'class': classStr }, true);

        for (var i = 0; i < units.length; i++) {
            var unit = units[i];

            var tile;

            if (sideStr === "defender")
                tile = $filter('filter')(tMap, { 'units': { 'defender': unit } }, true)[0];
            else if (sideStr === "attacker")
                tile = $filter('filter')(tMap, { 'units': { 'attacker': unit } }, true)[0];

            var destTile = getMoveTarget(sideStr, tile);

            console.log(tile.pos, destTile.pos);
            unitMove(sideStr, tile, destTile);
        }

        updateScene();
    }

    function unitMove(sideStr, curTile, nextTile) {
        if (!angular.equals(nextTile.units[sideStr], {})) return false;

        var unit = curTile.units[sideStr];

        curTile.units[sideStr] = {};
        nextTile.units[sideStr] = unit;

        return true;
    };

    function getMoveTarget(sideStr, tile) {
        if (sideStr !== "defender" && sideStr !== "attacker") return null;

        var tMap = TileMapService.tileMap.map;

        var opponentStr = (sideStr === "defender") ? "attacker" : "defender";
        var ratio = 0.5;

        var dPos = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: 1 }
        ];

        var threatMax = tile.tank[opponentStr] * ratio + tile.gank[opponentStr] * ratio;
        var destTile = tile;

        // if current tile has an opponent
        if (!angular.equals(tile.units[opponentStr], {})) return tile;

        for (var i = 0; i < dPos.length; i++) {
            // if destination is invalid
            if (tile.pos.y + dPos[i].y < 0 || tile.pos.y + dPos[i].y > 4 || tile.pos.x + dPos[i].x < 0 || tile.pos.x + dPos[i].x > 4)
                continue;

            var index = (tile.pos.y + dPos[i].y) * 5 + (tile.pos.x + dPos[i].x);

            if (typeof tMap[index] !== "undefined") {
                var threat = tMap[index].tank[opponentStr] * ratio + tMap[index].gank[opponentStr] * ratio;

                // if desired destination tile has greater threat than current tile and has a free unit slot for sideStr
                if (threat > threatMax && angular.equals(tMap[index].units[sideStr], {})) {
                    threatMax = threat;
                    destTile = tMap[index];
                }
                console.log(threat, threatMax, destTile);
            }
        }

        return destTile;
    }

    function unitsAttack(sideStr, classStr) {
        if (sideStr !== "defender" && sideStr !== "attacker") return null;

        var tMap = TileMapService.tileMap.map;
        var units = $scope.$parent[sideStr].units;

        //gets the subset of units belonging to class classStr
        units = $filter('filter')(units, { 'class': classStr }, true);

        var opponentStr = (sideStr === "defender") ? "attacker" : "defender";

        for (var i = 0; i < units.length; i++) {
            var tile;

            if (sideStr === "defender")
                tile = $filter('filter')(tMap, { 'units': { 'defender': units[i] } }, true)[0];
            else if (sideStr === "attacker")
                tile = $filter('filter')(tMap, { 'units': { 'attacker': units[i] } }, true)[0];

            unitAttack(sideStr, tile);
        }
    };

    function unitAttack(sideStr, tile) {
        var opponentStr = (sideStr === "defender") ? "attacker" : "defender";

        var srcUnit = tile.units[sideStr];
        var tgtUnit = getAttackTarget(sideStr, tile);

        if (!tgtUnit) return;

        tgtUnit.curHealth = Math.max(
            tgtUnit.curHealth - srcUnit.hDamage * (srcUnit.curMorale / srcUnit.morale),
            0
        );

        tgtUnit.curMorale = Math.max(
            tgtUnit.curMorale - srcUnit.mDamage * (srcUnit.curMorale / srcUnit.morale),
            0
        );

        if (tgtUnit.curHealth <= 0) {
            resetUnit(opponentStr, tgtUnit);
            
        }
    }

    function getAttackTarget(sideStr, tile) {
        var opponentStr = (sideStr === "defender") ? "attacker" : "defender";

        if (angular.equals(tile.units[opponentStr], {}))
            return null;
        else
            return tile.units[opponentStr];
    };

    angular.element(document).ready(function () {
        $scope.$parent.$watch('defender.roster', function (newValue, oldValue) {
            resetUnits("defender");
            $scope.$parent.defender.selected = {};
            $scope.$parent.defender.show = false;
        });

        $scope.$parent.$watch('attacker.roster', function (newValue, oldValue) {
            resetUnits("attacker");
            $scope.$parent.attacker.selected = {};
            $scope.$parent.attacker.show = false;
        });

        $scope.$parent.$watch('overlay.selected', function (newValue, oldValue) {
            TileMapService.drawScene($scope.$parent.overlay.selected);
        });

        $scope.$parent.$watch('pendingUpdate', function (newValue, oldValue) {
            if (newValue) {
                updateSim();
                updateScene();

                $scope.$parent.pendingUpdate = false;
            }
        });

        $scope.$parent.$watch('pendingRequests', function (newValue, oldValue) {
            if (newValue == 0) {
                initPlanet();

                window.addEventListener('click', selectTile, false);
            }
        });
    });

});