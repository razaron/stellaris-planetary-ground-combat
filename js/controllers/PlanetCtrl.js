app.controller('PlanetCtrl', function ($scope, $interval, TileMapService) {
    var cvs = document.getElementById('planet');
    var tMapOffset = { 'x': 3, 'y': 3 };
    var tSize = 18;

    var landingTime = 5;
    var landingAmount = 5;

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

        for (var i = 0; i < TileMapService.tileMap.map.length; i++) {
            var tile = TileMapService.tileMap.map[i];

            if (!tile.exists) continue;

            if (Math.random() > 0.5) {
                var w = Math.random();
                var key;

                if(w < 0.25){
                    key = "light";
                }
                else if(w < 0.5){
                    key = "heavy"
                }
                else if(w < 0.75){
                    key = "specOps"
                }
                else{
                    key = "artillery"
                }

                $scope.$parent.attacker.selected = $scope.$parent.attacker.roster[key];

                addUnit("attacker", tile);
            }

            if (Math.random() > 0.5) {
                var w = Math.random();
                var key;

                if(w < 0.25){
                    key = "light";
                }
                else if(w < 0.5){
                    key = "heavy"
                }
                else if(w < 0.75){
                    key = "specOps"
                }
                else{
                    key = "artillery"
                }

                $scope.$parent.defender.selected = $scope.$parent.defender.roster[key];

                addUnit("defender", tile);
            }
        }

        var foo = $scope.$parent;
        var bar = TileMapService;

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

        if (sideStr === "defender") {
            tileObj.units[sideStr] = (typeof tileObj.units[sideStr] === "object") ? tileObj.units[sideStr] : {};
            tileObj.units[sideStr] = unit;
            $scope.$parent[sideStr].units.push(unit);
        }
        else if (sideStr === "attacker") {
            $scope.$parent[sideStr].orbitingUnits.push(unit);
            sortUnits();
        }


        updateScene();
    };

    function resetUnit(sideStr, unitObj) {
        if(angular.equals(unitObj, {})) return;

        // removes reference to unitObj on a side
        var side = $scope.$parent[sideStr];

        if (side.units.indexOf(unitObj) !== -1) {
            side.units.splice(side.units.indexOf(unitObj), 1);
        }

        if (side.landingUnits.indexOf(unitObj) !== -1) {
            side.landingUnits.splice(side.landingUnits.indexOf(unitObj), 1);
        }

        if (side.orbitingUnits.indexOf(unitObj) !== -1) {
            side.orbitingUnits.splice(side.orbitingUnits.indexOf(unitObj), 1);
        }


        // removes reference to unitObj on a tile
        var tMap = TileMapService.tileMap.map;
        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];

            if (t.units[sideStr] === unitObj)
                t.units[sideStr] = {};
        }

        delete unitObj.svg.attacker;
        delete unitObj.svg.defender;

        updateScene();
    };

    function resetUnits(sideStr) {
        // removes references to a sides units
        var side = $scope.$parent[sideStr];
        side.units = [];
        side.orbitingUnits = [];
        side.landingUnits = [];

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
            t = tMap.filter(tile => tile.units.defender === unitObj);

        if (sideStr === "attacker")
            t = tMap.filter(tile => tile.units.attacker === unitObj);

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

                var rangeMult = 1;
                var rangeDist = 0;
                for (var j = 0; j < unitObj.ranges.length; j++) {
                    var r = unitObj.ranges[j];

                    rDist = Math.sqrt(r.x * r.x + r.y * r.y);

                    if (rDist > rangeDist) {
                        rangeDist = rDist;
                        rangeMult = rDist + 1;
                    }
                }

                t2.gank[sideStr] += ((unitObj.mDamage + unitObj.hDamage) * (unitObj.curMorale / unitObj.morale) * (rangeMult)) / distSqr;
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
            t = tMap.filter(tile => tile.units.defender === unitObj);

        if (sideStr === "attacker")
            t = tMap.filter(tile => tile.units.attacker === unitObj);

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

    var red = 0, green = 0, numGames = 0;
    function updateSim() {
        landUnits();

        unitsMove("defender", "specOps");
        unitsAttack("defender", "specOps");

        unitsMove("attacker", "specOps");
        unitsAttack("attacker", "specOps");

        unitsMove("defender", "heavy");
        unitsMove("attacker", "heavy");

        unitsAttack("defender", "heavy");
        unitsAttack("attacker", "heavy");


        unitsMove("defender", "light");
        unitsMove("attacker", "light");

        unitsAttack("defender", "light");
        unitsAttack("attacker", "light");

        unitsMove("defender", "artillery");
        unitsMove("attacker", "artillery");

        unitsAttack("defender", "artillery");
        unitsAttack("attacker", "artillery");

        if (!$scope.$parent.defender.units.length) {
            resetUnits("defender");
            resetUnits("attacker");
            initPlanet();

            red++;
            numGames++;
            console.log(red, green, $scope.$parent.turnCounter);

            $scope.$parent.turnCounter = 0;
        }
        else if (!($scope.$parent.attacker.units.length + $scope.$parent.attacker.landingUnits.length + $scope.$parent.attacker.orbitingUnits.length)) {
            resetUnits("defender");
            resetUnits("attacker");
            initPlanet();

            green++;
            numGames++;
            console.log(red, green, $scope.$parent.turnCounter);

            $scope.$parent.turnCounter = 0;
        }
    }

    var landingCooldown = landingTime;
    function landUnits() {
        landingCooldown--;

        var orbitingUnits = $scope.$parent.attacker.orbitingUnits;
        var landingUnits = $scope.$parent.attacker.landingUnits;

        if (landingCooldown <= 0) {
            if (landingUnits.length) {
                for (var i = 0; i < landingAmount; i++) {
                    var unit = landingUnits[0];
                    landUnit(unit);

                    if (!landingUnits.length) break;
                }
            }

            if (orbitingUnits.length) {
                for (var i = 0; i < landingAmount; i++) {
                    var unit = orbitingUnits.splice(0, 1)[0];

                    if (typeof unit === "object") {
                        landingUnits.push(unit);
                    }

                    if (!orbitingUnits.length) break;
                }
            }

            landingCooldown = landingTime;
        }
    }

    function landUnit(unit) {
        var tMap = TileMapService.tileMap.map;
        var landingUnits = $scope.$parent.attacker.landingUnits;
        var units = $scope.$parent.attacker.units;

        var classStr = unit.class;
        var ratio = (classStr === "light") ? 0.5 : ((classStr === "heavy") ? 0.75 : ((classStr === "specOps") ? 0.25 : ((classStr === "artillery") ? 0.5 : 0.5)));

        var threatMax = -1000;
        var tile = null;
        for (var i = 0; i < tMap.length; i++) {
            var t = tMap[i];

            if (!t.exists || !angular.equals(t.units.attacker, {})) continue;

            var threat = t.tank.defender * ratio + t.gank.defender * (1 - ratio);

            threat = (unit.class === "light" || unit.class === "artillery") ? threat * -1 : threat;

            if (threat > threatMax) {
                threatMax = threat;
                tile = t;
            }
        }

        if (!tile)
            return;
        else {
            tile.units.attacker = landingUnits.splice(landingUnits.indexOf(unit), 1)[0];
            units.push(tile.units.attacker);
        }
    }

    function sortUnits() {
        var units = $scope.$parent.attacker.orbitingUnits;
        var sorted = [];

        for (var i = 0; i < units.length; i++) {
            var pos = Math.random();

            if (units[i].class === "heavy") {
                pos = randomRanged(0.0, 0.4);
            }
            else if (units[i].class === "specOps") {
                pos = randomRanged(0.2, 0.6);
            }
            else if (units[i].class === "light") {
                pos = randomRanged(0.4, 0.8);
            }
            else if (units[i].class === "artillery") {
                pos = randomRanged(0.6, 1.0);
            }

            sorted.push({ 'pos': pos, 'unit': units[i] });
        }

        sorted.sort((a, b) => a.pos - b.pos);

        units = [];
        for (var i = 0; i < sorted.length; i++) {
            units.push(sorted[i].unit);
        }

        $scope.$parent.attacker.orbitingUnits = units;
    }

    function randomRanged(start, end) {
        var length = end - start;

        return start + Math.random() * length;
    };

    function unitsMove(sideStr, classStr) {
        var units = $scope.$parent[sideStr].units;
        var tMap = TileMapService.tileMap.map;

        //gets the subset of units belonging to class classStr
        units = units.filter(unit => unit.class === classStr);

        for (var i = 0; i < units.length; i++) {
            var unit = units[i];

            var tile;

            if (sideStr === "defender")
                tile = tMap.filter(t => t.units.defender === unit)[0];
            else if (sideStr === "attacker")
                tile = tMap.filter(t => t.units.attacker === unit)[0];

            var destTile = getMoveTarget(sideStr, tile);

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

        var classStr = tile.units[sideStr].class;
        var ratio = (classStr === "light") ? 0.5 : ((classStr === "heavy") ? 0.75 : ((classStr === "specOps") ? 0.25 : ((classStr === "artillery") ? 0.5 : 0.5)));


        var dPos = tile.units[sideStr].movement;

        var threatMax = tile.tank[opponentStr] * ratio + tile.gank[opponentStr] * (1 - ratio);
        var destTile = tile;

        // if attack target is available
        if (getAttackTarget(sideStr, tile)) return tile;

        for (var i = 0; i < dPos.length; i++) {
            // if destination is invalid
            if (tile.pos.y + dPos[i].y < 0 || tile.pos.y + dPos[i].y > 4 || tile.pos.x + dPos[i].x < 0 || tile.pos.x + dPos[i].x > 4)
                continue;

            var index = (tile.pos.y + dPos[i].y) * 5 + (tile.pos.x + dPos[i].x);

            if (typeof tMap[index] !== "undefined" && tMap[index].exists) {
                var threat = tMap[index].tank[opponentStr] * ratio + tMap[index].gank[opponentStr] * (1 - ratio);

                // if desired destination tile has greater threat than current tile and has a free unit slot for sideStr
                if (threat > threatMax && angular.equals(tMap[index].units[sideStr], {})) {
                    threatMax = threat;
                    destTile = tMap[index];
                }
            }
        }

        return destTile;
    }

    function unitsAttack(sideStr, classStr) {
        if (sideStr !== "defender" && sideStr !== "attacker") return null;

        var tMap = TileMapService.tileMap.map;
        var units = $scope.$parent[sideStr].units;

        //gets the subset of units belonging to class classStr
        units = units.filter(unit => unit.class === classStr);

        for (var i = 0; i < units.length; i++) {
            var unit = units[i];

            var tile;

            if (sideStr === "defender")
                tile = tMap.filter(t => t.units.defender === unit)[0];
            else if (sideStr === "attacker")
                tile = tMap.filter(t => t.units.attacker === unit)[0];

            unitAttack(sideStr, tile);
        }
    };

    function unitAttack(sideStr, tile) {
        var opponentStr = (sideStr === "defender") ? "attacker" : "defender";

        var srcUnit = tile.units[sideStr];
        var tgtUnit = getAttackTarget(sideStr, tile);


        if (!tgtUnit && srcUnit.class === "artillery" && sideStr === "defender" && $scope.$parent.attacker.landingUnits.length) {
            tgtUnit = $scope.$parent.attacker.landingUnits[Math.floor($scope.$parent.attacker.landingUnits.length * Math.random())];
        }

        if (!tgtUnit) return;

        tgtUnit.curHealth = Math.max(
            tgtUnit.curHealth - $scope.$parent.calcDamage(srcUnit).hDamage,
            0
        );

        if (tgtUnit.faction !== "synthetic") {
            tgtUnit.curMorale = Math.max(
                tgtUnit.curMorale - $scope.$parent.calcDamage(srcUnit).mDamage,
                0
            );
        }

        if (tgtUnit.curHealth <= 0) {
            resetUnit(opponentStr, tgtUnit);
        }
    }

    $scope.$parent.calcDamage = function (unit) {
        if (typeof unit !== "object") return { mDamage: 0, hDamage: 0 };

        var m = unit.mDamage * (0.25 + 0.75 * (unit.curMorale / unit.morale)),
            h = unit.hDamage * (0.25 + 0.75 * (unit.curMorale / unit.morale));

        return { mDamage: m, hDamage: h };
    }

    function getAttackTarget(sideStr, tile) {
        var opponentStr = (sideStr === "defender") ? "attacker" : "defender";

        var ranges = tile.units[sideStr].ranges;

        //if melee range is available and current tile has enemy
        if (ranges.indexOf({ x: 0, y: 0 }) !== -1 || !angular.equals(tile.units[opponentStr], {}))
            return tile.units[opponentStr];

        var classStr = tile.units[sideStr].class;
        var ratio = (classStr === "light") ? 0.5 : ((classStr === "heavy") ? 0.75 : ((classStr === "specOps") ? 0.25 : ((classStr === "artillery") ? 0.5 : 0.5)));

        var threatMax = 0;
        var tgtUnit = null;
        for (var i = 0; i < ranges.length; i++) {
            if (tile.pos.y + ranges[i].y < 0 || tile.pos.y + ranges[i].y > 4 || tile.pos.x + ranges[i].x < 0 || tile.pos.x + ranges[i].x > 4)
                continue;

            var index = (tile.pos.y + ranges[i].y) * 5 + (tile.pos.x + ranges[i].x);
            var tgtTile = TileMapService.tileMap.map[index];

            if (!tgtTile.exists) continue;

            var threat = tgtTile.tank[opponentStr] * ratio + tgtTile.gank[opponentStr] * (1 - ratio);

            if (angular.equals(tgtTile.units[opponentStr], {}))
                continue;
            else if (threat > threatMax) {
                threatMax = threat;
                tgtUnit = tgtTile.units[opponentStr];
            }
        }

        return tgtUnit;
    };

    function nextTurn() {
        updateSim();
        updateScene();
        $scope.$parent.turnCounter++;


        if (numGames < 0) {
            nextTurn();
        }
    }

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
            updateScene();
        });

        var promise = null;
        var funqueue = [];
        $scope.$parent.turnCounter = 0;
        $scope.$parent.$watch('isRunning', function (v, u) {
            if (v) {
                /*
                for(var i=0;i<10000;i++)
                    funqueue.push(nextTurn);

                while(funqueue.length)    
                   (funqueue.shift())();

                console.log("finished");
                */
                promise = $interval(function () {
                    nextTurn()
                }, 100);
            }
            else {
                $interval.cancel(promise);
            }
        });

        $scope.$parent.$watch('pendingRequests', function (newValue, oldValue) {
            if (newValue == 0) {
                initPlanet();
                //nextTurn();
                window.addEventListener('click', selectTile, false);
            }
        });
    });
});