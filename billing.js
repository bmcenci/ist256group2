
const app = angular.module("billingApp", []);

app.controller("BillingController", function($scope, $http) {

    $scope.billing = {
        name: "",
        address: "",
        city: "",
        zip: "",
        cardNumber: "",
        expiration: "",
        cvv: ""
    };

    $scope.cart = JSON.parse(
        localStorage.getItem("clubShoppingCart") || "[]"
    );

    $scope.message = "";

    $scope.getTotal = function() {
        let total = 0;

        $scope.cart.forEach(function(item) {
            total += item.price * item.quantity;
        });

        return total;
    };

    $scope.submitBilling = function() {

        const card = $scope.billing.cardNumber.replace(/\s/g, "");
        const expiration = $scope.billing.expiration;
        const cvv = $scope.billing.cvv;

        if (!$scope.billing.name || !$scope.billing.address ||
            !$scope.billing.city || !$scope.billing.zip ||
            !/^\d{5}$/.test($scope.billing.zip) ||
            !/^\d{13,19}$/.test(card) ||
            !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiration) ||
            !/^\d{3,4}$/.test(cvv)) {

            $scope.message = "Please enter valid billing information.";
            $scope.messageType = "danger";
            return;
        }

        if ($scope.cart.length === 0) {
            $scope.message = "Your cart is empty.";
            $scope.messageType = "danger";
            return;
        }

        const order = {
            name: $scope.billing.name,
            address: $scope.billing.address,
            city: $scope.billing.city,
            zip: $scope.billing.zip,
            paymentMethod: "Demo Card",
            items: $scope.cart,
            total: $scope.getTotal()
        };

        $http.post("/api/billing", order).then(function() {
            $scope.message = "Order submitted successfully!";
            $scope.messageType = "success";
        }, function() {
            $scope.message = "Could not submit order.";
            $scope.messageType = "danger";
        });

    };

});
