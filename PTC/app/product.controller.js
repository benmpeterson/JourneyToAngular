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
        vm.searchPrice = searchPrice;
        vm.searchPriceAndMake = searchPriceAndMake
        vm.addClick = addClick;
        vm.cancelClick = cancelClick;
        vm.editClick = editClick;
        vm.deleteClick = deleteClick;
        vm.saveClick = saveClick;

        vm.product = {};
        vm.categories = [];
        vm.products = [];
        vm.product = {
            ProductId: 1,
            ProductName: 'Video Training'
        };

        vm.searchCategories = [];

        vm.searchInput = {
            selectedCategory: {
                CategoryId: 0,
                CategoryName: '',
            },
            productName: '',
            MinPrice: '',
            MaxPrice: '',
        };


        const pageMode = {
            LIST: 'List',
            EDIT: 'Edit',
            ADD: 'Add'
        };

        vm.uiState = {
            mode: pageMode.LIST,
            isDetailAreaVisible: false,
            isListAreaVisible: true,
            isSearchAreaVisuble: true,
            isValid: true,
            messages: []
        };


        productList();
        searchCategoriesList();
        categoryList();

        function addClick() {
            vm.product = initEntity();           
            setUIState(pageMode.ADD)
        }

        function cancelClick(productForm) {
            productForm.$setPristine();
            productForm.$valid = true;
            vm.uiState.isValid = true;
            setUIState(pageMode.LIST);
        }

        function editClick(id) {
            productGet(id)
            setUIState(pageMode.EDIT)
        }

        function deleteClick(id) {
            if (confirm("Delete this Product?")) {
                deleteData(id);
            }
        }

        function saveClick(productForm) {
            if (productForm.$valid) {
                if (validateData()) {
                    productForm.$setPristine();
                    if (vm.uiState.mode == pageMode.ADD) {
                        insertData();
                    } 
                    else {
                        updateData();
                    }
                }
                else {
                    productForm.$valid = false;
                }
            }
            else {
                vm.uiState.isValid = false;
            }
        }

        function insertData() {
            dataService.post(
                "/api/Product",
                vm.product)
                .then(function (result) {
                    //update product object
                    vm.product = result.data;

                    //Add Product to Array so new prodect will be see in list mode
                    vm.products.push(vm.product);

                    setUIState(pageMode.LIST);
                }, function (error) {
                    handleException(error);
                });
        }

        function updateData() {
            dataService.put("/api/Product/" +
                vm.product.ProductId,
                vm.product)
            .then(function (result){
                //Update product object
                vm.product = result.data;

                //Get index of this product
                var index = vm.products.map(function (p) {
                    return p.ProductId;
                })
                    .indexOf(vm.product.ProductId);

                //update product in array
                vm.products[index] = vm.product;

                setUIState(pageMode.LIST);
            }, function (error) {
                handleException(error);
            });
        }

        function addValidationMessage(prop, msg) {
            vm.uiState.messages.push({
                property: prop,
                message: msg
            });
        }

        function deleteData(id) {
            dataService.delete(
                "/api/Product/" + id)
                .then(function (result){
                //Get index of this product
                var index = vm.products.map(function (p)
                { return p.ProductId; }).indexOf(id);

                //Remove product from array
                vm.products.splice(index, 1);

                setUIState(pageMode.LIST);
            }, function (error) {
                handleException(error);
                });
        }

        function validateData() {
            var ret = true;

            //Fix up date (IE 11 bug workaround)
            vm.product.IntroductionDate =
                vm.product.IntroductionDate.
                    replace(/\u200E/g, '');

            vm.uiState.messages = [];

            if (vm.product.IntroductionDate != null) {
                if (isNaN(Date.parse(
                    vm.product.IntroductionDate))) {
                    addValidationMessage('IntroductionDate', 'Invalid Introduction Date');
                }
            }

            if (vm.product.Url.
                toLowerCase().indexOf("microsoft") >= 0) {
                addValidationMessage('url', 'URL can not contain the word microsoft')
            }

            vm.uiState.isValid = (vm.uiState.messages.length == 0);

            return vm.uiState.isValid;
        }


        function productGet(id) {
            //Call Web API to get a product
            dataService.get("/api/Product/" + id)
                .then(function (result) {
                    //Display product
                    vm.product = result.data;

                    //Convert data to local date/time format 
                    if (vm.product.IntroductionDate != null) {
                        vm.product.IntroductionDate =
                            new Date(vm.product.IntroductionDate).
                                toLocaleDateString();
                    }
                }, function (error) {
                    handleException(error);
                });
        }

        function categoryList() {
            dataService.get("/api/Category")
                .then(function (result) {
                    vm.categories = result.data;
                });
        }



        function setUIState(state) {
            vm.uiState.mode = state;

            vm.uiState.isDetailAreaVisible = (state == pageMode.ADD || state == pageMode.EDIT);
            vm.uiState.isListAreaVisible = (state == pageMode.LIST);
            vm.uiState.isSearchAreaVisible = (state == pageMode.LIST);            
        }

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

        function initEntity() {
            return {
                ProductId: 0,
                ProductName: '',
                IntroductionDate: new Date().toLocaleDateString(),
                Url: 'http://benmpeterson.github.io',
                Price: 0,
                Category: {
                    CategoryId: 1,
                    CategoryName: ''
                }
            };
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
                    setUIState(pageMode.LIST);
                }, function (error) {
                    handleException(error);
                });
        }


        function searchPrice() {
            //create object literal for search values
            var searchEntity = {
                CategoryId:
                vm.searchInput.selectedCategory.CategoryId,
                MaxPrice:
                vm.searchInput.MaxPrice,               
                MinPrice:
                vm.searchInput.MinPrice
                
            };
            

            //Cal Web API to get a list of Products
            dataService.post("/api/Product/SearchPrice",
                searchEntity)
                .then(function (result) {
                    vm.products = result.data;
                    setUIState(pageMode.LIST);
                }, function (error) {
                    handleException(error);
                });
        }

        function searchPriceAndMake() {
            //create object literal for search values
            var searchEntity = {
                CategoryId:
                vm.searchInput.selectedCategory.CategoryId,
                ProductName:
                vm.searchInput.productName,
                MaxPrice:
                vm.searchInput.MaxPrice,
                MinPrice:
                vm.searchInput.MinPrice

            };


            //Cal Web API to get a list of Products
            dataService.post("/api/Product/SearchPriceAndMake",
                searchEntity)
                .then(function (result) {
                    vm.products = result.data;
                    setUIState(pageMode.LIST);
                }, function (error) {
                    handleException(error);
                });
        }


        function searchImmediate(item) {
            if ((vm.searchInput.selectedCategory.CategoryId == 0 ? true : vm.searchInput.selectedCategory.CategoryId == item.Category.CategoryId) &&
                (vm.searchInput.productName.length == 0 ? true : (item.ProductName.toLowerCase().indexOf(vm.searchInput.productName.toLowerCase()) >= 0)) &&
                (vm.searchInput.MinPrice == 0 ? true : (item.Price.indexOf(vm.searchInput.MinPrice) >= 0)))

            {                
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


                setUIState(pageMode.LIST);
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
                    vm.uiState.isValid = false;
                    handleException(error);
                });
        }

        function handleException(error) {
            alert(error.data.ExceptionMessage)
        }

        function handleException(error) {
            vm.uiState.isValid = false;
            var msg = {
                property: 'Error',
                message: ''
            };

            vm.uiState.messages = [];

            switch (error.status) {
                case 400:
                    var errors = error.data.ModelState;
                    debugger

                    for (var key in errors) {
                        for (var i = 0; i < errors[key].length; i++) {
                            addValidationMessage(key, errors[key][i])
                        }
                    }
                    break;



                case 404:
                    msg.message = 'The product you were ' +
                        'requesting could not be found';

                    vm.uiState.messages.push(msg);

                    break;

                case 500:
                    msg.message =
                        error.data.ExceptionMessage;
                    vm.uiState.messages.push(msg);

                    break

                default:
                    msg.message = 'Status: ' +
                        error.status +
                        ' - Error Message: ' +
                        error.statusText;

                    vm.uiState.messages.push(msg);

                    break;

            }
        }
    }

})();