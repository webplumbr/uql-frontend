(function () {
    var app = angular.module('library', []);

    app.service('LibraryService', LibraryService)
        .controller('LibraryListing', LibraryListing)
        .controller('LibraryDetails', LibraryDetails);

    function LibraryService($http)
    {
        this.getLibraryHours = function () {
            return $http.get('data/library-hours.json').then(function (response) {
                if (response.status === 200 && response.data.locations) {
                    return response.data.locations;
                }
            });
        }

        this.getComputerAvailability = function () {
            return $http.get('data/computer-availability.json').then(function (response) {
                if (response.status === 200 && response.data) {
                    return response.data;
                }
            });
        }

        this.getMappings = function () {
            return $http.get('data/mappings.json').then(function (response) {
                if (response.status === 200 && response.data) {
                    return response.data;
                }
            });
        }
    }

    function LibraryListing($rootScope, $scope, LibraryService)
    {
        $scope.selectedLibrary = function (library) {
            $rootScope.$broadcast('chosenLibrary', library);
        }

        $scope.searchLibraries = function (query) {

            if (query.length == 0) {
                LibraryService.getLibraryHours().then(function (result) {
                    $scope.locations = result;
                });
            }

            if  (query.length < 3) {
                return;
            }

            query = query.toLowerCase();

            var libraries = [];
            for (var i in $scope.locations) {
                //find matching libraries
                if ($scope.locations[i].name.toLowerCase().indexOf(query) !== -1) {
                    libraries.push($scope.locations[i]);
                }
            }

            $scope.locations = libraries;
        }

        LibraryService.getLibraryHours().then(function (result) {
            $scope.locations = result;
        });
    }

    function LibraryDetails($scope, LibraryService)
    {
        $scope.library      = null;
        $scope.availability = null;

        $scope.$on('chosenLibrary', function (event, data) {
            $scope.library = data;

            LibraryService.getComputerAvailability().then(function (result) {

                LibraryService.getMappings().then(function (map) {

                    if (map[$scope.library.lid] === undefined) {
                        $scope.availability = null;
                        return;
                    }

                    for (var i in result) {
                        if (map[$scope.library.lid] == result[i].buildingCode) {
                            $scope.availability = result[i];
                        }
                    }
                });

            });
        });

        $scope.isCurrentlyOpen = function () {
            return ($scope.library.times !== undefined) ? $scope.library.times.currently_open : false;
        }
    }
})();