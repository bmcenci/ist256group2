
const app = angular.module("returnsApp", []);

app.controller("ReturnsController", function($scope, $http) {

    $scope.products = [];
    $scope.selectedProduct = null;

    $scope.returnData = {
        name: "",
        productId: "",
        reason: "",
        condition: "",
        details: ""
    };

    $scope.message = "";

    // Load products from JSON
    $http.get("products.json").then(function(response) {
        $scope.products = response.data;
    });

    // Search products using jQuery
    $("#searchProduct").on("input", function() {
        const search = $(this).val().toLowerCase();

        $("select option").each(function() {
            if ($(this).text().toLowerCase().includes(search)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // Show selected product
    $scope.updateProduct = function() {
        $scope.selectedProduct = null;

        $scope.products.forEach(function(product) {
            if (product.id === $scope.returnData.productId) {
                $scope.selectedProduct = product;
            }
        });
    };

    // Submit return request
    $scope.submitReturn = function() {

        if (!$scope.returnData.name ||
            !$scope.returnData.productId ||
            !$scope.returnData.reason ||
            !$scope.returnData.condition) {

            $scope.message = "Please complete all required fields.";
            $scope.messageType = "danger";
            return;
        }

        const request = {
            name: $scope.returnData.name,
            productId: $scope.selectedProduct.id,
            productName: $scope.selectedProduct.description,
            price: $scope.selectedProduct.price,
            reason: $scope.returnData.reason,
            condition: $scope.returnData.condition,
            details: $scope.returnData.details
        };

        // Send JSON to Node.js
        $http.post("/api/returns", request).then(function() {
            $scope.message = "Return submitted successfully!";
            $scope.messageType = "success";
        }, function() {
            $scope.message = "Could not submit return.";
            $scope.messageType = "danger";
        });
    };

});
