(function () {
    'use strict';

    angular.module('app').controller('ProductController', ProductController);

    function ProductController() {
        var vm = this;

        vm.product = {
            ProductId: 1,
            ProductName: 'Video Training'
        };
    }

})();