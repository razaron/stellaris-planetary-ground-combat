app.factory('ConfigDataFactory', function ($http, $q) {
    var deffered = $q.defer();
    $http({
        method: 'GET',
        url: 'json/config.json'
    }).then(
        function successCallback(data, status, headers, config) {
            deffered.resolve(data);
        },
        function errorCallback(data, status, headers, config) {
            console.log(data);

            deffered.reject(status);
        }
    );

    return deffered.promise;
});

app.factory('RosterDataFactory', function ($http, $q) {
    var deffered = $q.defer();
    $http({
        method: 'GET',
        url: 'json/roster.json'
    }).then(
        function successCallback(data, status, headers, config) {
            deffered.resolve(data);
        },
        function errorCallback(data, status, headers, config) {
            console.log(data);

            deffered.reject(status);
        }
    );

    return deffered.promise;
});

app.factory('TileMapFactory', function () {
    var tileMap = [];

    for (var y = 0; y < 5; y++) {
        for (var x = 0; x < 5; x++) {
            tileMap.push({
                'pos': { 'x': x, 'y': y },
                'attacker': {},
                'defender': {},
                'exists': true,
                'selected': false
            });
        }
    }
    return tileMap;
});