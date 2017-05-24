var app = angular.module('groundCombat', ['ngMaterial'])
.config(function ($mdThemingProvider) {

    $mdThemingProvider.theme('default')
    .primaryPalette('deep-purple', {
        'default': "900",
        'hue-1': "A200",
        'hue-2': "A400",
        'hue-3': "A700"
    })
    .accentPalette('brown', {
    })
    .warnPalette('red', {
    })
    .dark();
});