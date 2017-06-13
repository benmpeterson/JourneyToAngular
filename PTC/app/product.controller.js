(function () {
    'use strict';

    angular.module('app').controller('ProductController', ProductController);

    function ProductController($http) {
        var vm = this;
        var dataService = $http;

        //hook up public events
        vm.resetSearch = resetSearch;
        vm.searchImmediate = searchImmediate;
        vm.search = search;

        vm.products = [];
        vm.product = {
            ProductId: 1,
            ProductName: 'Video Training'
        };

        vm.searchCategories = [];

        vm.searchInput = {
            selectedCategory: {
                CategoryId: 0,
                CategoryName: ''
            },
            productName:''
        };


        productList();
        searchCategoriesList();


        function resetSearch() {
            vm.searchInput = {
                selectedCategory: {
                    CategoryId: 0,
                    CategoryName: ''
                },
                productName: ''
            };

            productList();
        }

        function search() {
            //create object literal for search values
            var searchEntity = {
                CategoryId:
                vm.searchInput.selectedCategory.CategoryId,
                ProductName:
                vm.searchInput.productName
            };

            //Cal Web API to get a list of Products
            dataService.post("/api/Product/Search",
                searchEntity)
                .then(function (result) {
                    vm.products = result.data;
                }, function (error) {
                    handleException(error);
                });
        }

        function searchImmediate(item) {
            if ((vm.searchInput.selectedCategory.CategoryId == 0 ? true : vm.searchInput.selectedCategory.CategoryId == item.Category.CategoryId) &&
                (vm.searchInput.productName.length == 0 ? true : (item.ProductName.toLowerCase().indexOf(vm.searchInput.productName.toLowerCase()) >= 0))) {
                //debugger;
                return true;
                
            }
            //build
            //debugger;
            return false;
            
        }


        function productList() {
            dataService.get("/api/Product")
            .then(function (result) {
                vm.products = result.data;
                //debugger;
                },
                function (error) {
                    handleException(error);
                });
        }

        function searchCategoriesList() {
            dataService.get("/api/Category/GetSearchCategories")
                .then(function (result) {
                    vm.searchCategories = result.data;
                    //debugger;
                },
                function (error) {
                    handleException(error);
                });
        }

        function handleException(error) {
            alert(error.data.ExceptionMessage)
        }
    }

})();