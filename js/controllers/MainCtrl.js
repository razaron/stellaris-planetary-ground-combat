app.controller('MainCtrl', function ($scope, $http, $timeout, ConfigDataFactory, RosterDataFactory, TileMapFactory) {
    $scope.config = {};
    $scope.defender = {
        units: [],
        roster: {}
    };
    $scope.attacker = {
        units: [],
        roster: {}
    };

    $scope.roster = {};
    $scope.factionButtons = [];

    $scope.tiles = TileMapFactory;
    $scope.curTile = $scope.tiles[0];
    $scope.curTile.selected = true;

    $scope.overlay = {
        selected: "defender.tank",
        types: ["none", "defender.tank", "defender.gank", "attacker.tank", "attacker.gank"]
    };

    $scope.pendingUpdate = false;
    $scope.pendingRequests = 6;

    ConfigDataFactory.then(function (response) {
        $scope.config = response.data;

        _.merge($scope.defender, $scope.config.default, $scope.config.defender);

        _.merge($scope.attacker, $scope.config.default, $scope.config.attacker);
        $scope.pendingRequests--;
    }, function (error) {
        console.log(error);
    });

    RosterDataFactory.then(function (response) {
        var data = response.data;

        _.merge($scope.roster, data);
        _.merge($scope.roster.psionic, data.default, data.psionic);
        _.merge($scope.roster.biological, data.default, data.biological);
        _.merge($scope.roster.synthetic, data.default, data.synthetic);

        $scope.roster.default.color = "#ffffff";
        $scope.roster.psionic.color = "#0090C2";
        $scope.roster.biological.color = "#2A8835";
        $scope.roster.synthetic.color = "#CB8200";

        $scope.defender.roster = $scope.roster.default;
        $scope.attacker.roster = $scope.roster.default;

        $scope.factionButtons.push(
            {name: "Default", roster: $scope.roster.default},
            {name: "Psionic", roster: $scope.roster.psionic},
            {name: "Biological", roster: $scope.roster.biological},
            {name: "Synthetic", roster: $scope.roster.synthetic}                
        );

        generateSVG();

        $scope.pendingRequests--;
    }, function (data, status, headers, config) {
        console.log(status);
    });

    function generateSVG() {
        /* Generates light unit SVGs */
        $http({
            method: 'GET',
            url: 'img/svg/light.svg'
        }).then(function successCallback(response) {
            var element = angular.element(response.data);
            var string = '<svg width="500" height="300" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><g><title>Layer 1</title><rect id="svg_2" height="300" width="500" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="#ff0000"></rect><rect stroke="#000000" id="flagContents" height="200" width="400" y="50" x="50" stroke-width="5" fill="#ffffff"></rect><line id="line_1" y2="247" x2="447" y1="53" x1="53" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="10" stroke="#000000" fill="none"></line><line id="line_2" y2="53" x2="447" y1="247" x1="53" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="10" stroke="#000000" fill="none"></line></g></svg>';

            /* Create defender unit cards */
            angular.element('rect', element).attr('fill', '#00ff00');

            angular.element('#flagContents', element).attr('fill', '#ffffff');
            $scope.roster.default.light.svg.defender = element[0].outerHTML;

            angular.element('#flagContents', element).attr('fill', '#0090C2');
            $scope.roster.psionic.light.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#2A8835');
            $scope.roster.biological.light.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#CB8200');
            $scope.roster.synthetic.light.svg.defender = encodeURIComponent(element[0].outerHTML);

            /* Create attacker unit cards */
            angular.element('rect', element).attr('fill', '#ff0000');

            angular.element('#flagContents', element).attr('fill', '#ffffff');
            $scope.roster.default.light.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#0090C2');
            $scope.roster.psionic.light.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#2A8835');
            $scope.roster.biological.light.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#CB8200');
            $scope.roster.synthetic.light.svg.attacker = encodeURIComponent(element[0].outerHTML);

            $scope.pendingRequests--;
        }, function errorCallback(response) {
            alert("fucked up");
        });

        /* Generates heavy unit SVGs */
        $http({
            method: 'GET',
            url: 'img/svg/heavy.svg'
        }).then(function successCallback(response) {
            var element = angular.element(response.data);

            /* Create defender unit cards */
            angular.element('rect', element).attr('fill', '#00ff00');

            angular.element('#flagContents', element).attr('fill', '#ffffff');
            $scope.roster.default.heavy.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#0090C2');
            $scope.roster.psionic.heavy.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#2A8835');
            $scope.roster.biological.heavy.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#CB8200');
            $scope.roster.synthetic.heavy.svg.defender = encodeURIComponent(element[0].outerHTML);

            /* Create attacker unit cards */
            angular.element('rect', element).attr('fill', '#ff0000');

            angular.element('#flagContents', element).attr('fill', '#ffffff');
            $scope.roster.default.heavy.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#0090C2');
            $scope.roster.psionic.heavy.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#2A8835');
            $scope.roster.biological.heavy.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#CB8200');
            $scope.roster.synthetic.heavy.svg.attacker = encodeURIComponent(element[0].outerHTML);

            $scope.pendingRequests--;
        }, function errorCallback(response) {
            alert("fucked up");
        });

        /* Generates specOps unit SVGs */
        $http({
            method: 'GET',
            url: 'img/svg/specOps.svg'
        }).then(function successCallback(response) {
            var element = angular.element(response.data);

            /* Create defender unit cards */
            angular.element('rect', element).attr('fill', '#00ff00');

            angular.element('#flagContents', element).attr('fill', '#ffffff');
            $scope.roster.default.specOps.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#0090C2');
            $scope.roster.psionic.specOps.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#2A8835');
            $scope.roster.biological.specOps.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#CB8200');
            $scope.roster.synthetic.specOps.svg.defender = encodeURIComponent(element[0].outerHTML);

            /* Create attacker unit cards */
            angular.element('rect', element).attr('fill', '#ff0000');

            angular.element('#flagContents', element).attr('fill', '#ffffff');
            $scope.roster.default.specOps.svg.attacker = element[0].outerHTML;

            angular.element('#flagContents', element).attr('fill', '#0090C2');
            $scope.roster.psionic.specOps.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#2A8835');
            $scope.roster.biological.specOps.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#CB8200');
            $scope.roster.synthetic.specOps.svg.attacker = encodeURIComponent(element[0].outerHTML);

            $scope.pendingRequests--;
        }, function errorCallback(response) {
            alert("fucked up");
        });

        /* Generates artillery unit SVGs */
        $http({
            method: 'GET',
            url: 'img/svg/artillery.svg'
        }).then(function successCallback(response) {
            var element = angular.element(response.data);

            /* Create defender unit cards */
            angular.element('rect', element).attr('fill', '#00ff00');
            angular.element('circle', element).attr('fill', '#00ff00');

            angular.element('#flagContents', element).attr('fill', '#ffffff');
            $scope.roster.default.artillery.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#0090C2');
            $scope.roster.psionic.artillery.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#2A8835');
            $scope.roster.biological.artillery.svg.defender = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#CB8200');
            $scope.roster.synthetic.artillery.svg.defender = encodeURIComponent(element[0].outerHTML);

            /* Create attacker unit cards */
            angular.element('rect', element).attr('fill', '#ff0000');
            angular.element('circle', element).attr('fill', '#ff0000');

            angular.element('#flagContents', element).attr('fill', '#ffffff');
            $scope.roster.default.artillery.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#0090C2');
            $scope.roster.psionic.artillery.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#2A8835');
            $scope.roster.biological.artillery.svg.attacker = encodeURIComponent(element[0].outerHTML);

            angular.element('#flagContents', element).attr('fill', '#CB8200');
            $scope.roster.synthetic.artillery.svg.attacker = encodeURIComponent(element[0].outerHTML);

            $scope.pendingRequests--;
        }, function errorCallback(response) {
            alert("fucked up");
        })
    };

    $scope.isNumber = function(val) { return typeof val === 'number'; };
    $scope.isObject = function(val) { return typeof val === 'object'; };
    $scope.isDefined = function(val) { return typeof val !== 'undefined'; };

    $scope.selectUnit = function(unitObj, sideObj){
        if(unitObj != sideObj.selected)
            sideObj.selected = unitObj;
        else
            sideObj.selected = {};
    }
});