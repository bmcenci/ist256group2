const STORAGE_KEY = "clubProducts";

const CART_API_URL = "/api/cart";
const PRODUCTS_API_URL = "/api/products";

$(document).ready(function() {

    let products = [];   // JSON product collection
    let cart = [];

    // Load the JSON product data

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        products = JSON.parse(saved);
        init();
    } else {
        // jQuery loads the JSON document
        $.getJSON("products.json")
            .done(function(data) {
                products = data;
                saveProducts();
                init();
            })
            .fail(function() {
                $("#formMessage").html(
                    '<div class="alert alert-danger">Could not load products.json. Run the site from a server (not file://).</div>'
                );
                init();
            });
    }

    function init() {
        applySearch();
        displayCart();
        showProductJson();
    }

    function saveProducts() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }

    function showProductJson() {
        $("#productJson").text(JSON.stringify(products, null, 2));
    }

    function escapeHtml(text) {
        return $("<div>").text(text == null ? "" : text).html();
    }

    // Show products

    function displayProducts(list) {
        $("#productList").empty();

        list.forEach(function(product) {
            $("#productList").append(`
                <div class="col-md-4">
                    <div class="card p-3 h-100">
                        <span class="badge bg-secondary align-self-start mb-2">${escapeHtml(product.category)}</span>
                        <h5>${escapeHtml(product.description)}</h5>
                        <p class="text-muted small mb-1">ID: ${escapeHtml(product.id)}</p>
                        <p class="mb-1">Price: $${Number(product.price).toFixed(2)}
                            <span class="text-muted small">/ ${escapeHtml(product.unit)}</span></p>
                        <p class="text-muted small">${escapeHtml(product.info) || "No additional info"}</p>
                        <button class="btn btn-primary addBtn mt-auto"
                                data-id="${escapeHtml(product.id)}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `);
        });

        $("#noResults").toggleClass("d-none", list.length > 0);
        $("#resultCount").text("Showing " + list.length + " of " + products.length + " products");
    }

    // jQuery search of JSON collection

    function applySearch() {
        const searchText = $("#searchInput").val().toLowerCase().trim();

        const results = $.grep(products, function(p) {
            const text = [p.id, p.description, p.category, p.unit, p.info]
                .join(" ").toLowerCase();
            return text.indexOf(searchText) > -1;
        });

        displayProducts(results);
    }

    $("#searchInput").on("input", applySearch);

    // Add to cart / remove from cart 

    $("#productList").on("click", ".addBtn", function() {
        const productId = $(this).attr("data-id");
        const product = products.find(p => p.id === productId);

        if (product) {
            cart.push(product);
            displayCart();
            $("#cartMessage").html(
                '<div class="alert alert-success py-2">Added "' + escapeHtml(product.description) + '" to your cart.</div>'
            );
        }
    });

    function displayCart() {
        $("#cartItems").empty();

        let total = 0;

        cart.forEach(function(product, index) {
            total += Number(product.price);

            $("#cartItems").append(`
                <div class="d-flex justify-content-between border-bottom p-2">
                    <span>${escapeHtml(product.description)} - $${Number(product.price).toFixed(2)}</span>
                    <button class="btn btn-danger btn-sm removeBtn"
                            data-index="${index}">
                        Remove
                    </button>
                </div>
            `);
        });

        $("#cartTotal").text(total.toFixed(2));
        $("#cartJson").text(JSON.stringify(buildCartPayload(), null, 2));
    }

    $("#cartItems").on("click", ".removeBtn", function() {
        const index = Number($(this).attr("data-index"));
        cart.splice(index, 1);
        displayCart();
        $("#cartMessage").html(
            '<div class="alert alert-warning py-2">Item removed from your cart.</div>'
        );
    });

    function buildCartPayload() {
        let total = 0;
        cart.forEach(function(item) { total += Number(item.price); });

        return {
            items: cart,
            total: Number(total.toFixed(2))
        };
    }

    // Form validation

    function setFieldError(selector, message) {
        const $field = $(selector);
        $field.removeClass("is-valid").addClass("is-invalid");
        $field.siblings(".invalid-feedback").text(message);
    }

    function setFieldOk(selector) {
        $(selector).removeClass("is-invalid").addClass("is-valid");
    }

    function validateForm() {
        let valid = true;

        const id = $("#productId").val().trim();
        if (!/^[A-Za-z0-9\-]{3,15}$/.test(id)) {
            setFieldError("#productId", "Enter an ID of 3-15 letters, numbers, or dashes.");
            valid = false;
        } else if (products.some(p => p.id.toLowerCase() === id.toLowerCase())) {
            setFieldError("#productId", "That Product ID already exists.");
            valid = false;
        } else {
            setFieldOk("#productId");
        }

        // Description: at least 3 characters
        const description = $("#productDescription").val().trim();
        if (description.length < 3) {
            setFieldError("#productDescription", "Please enter a description (at least 3 characters).");
            valid = false;
        } else {
            setFieldOk("#productDescription");
        }

        // Category
        if ($("#productCategory").val() === "") {
            setFieldError("#productCategory", "Please choose a category.");
            valid = false;
        } else {
            setFieldOk("#productCategory");
        }

        // Unit of measure
        if ($("#productUnit").val() === "") {
            setFieldError("#productUnit", "Please choose a unit of measure.");
            valid = false;
        } else {
            setFieldOk("#productUnit");
        }

        // Price
        const priceText = $("#productPrice").val().trim();
        const price = Number(priceText);
        if (priceText === "" || !Number.isFinite(price) || price < 0) {
            setFieldError("#productPrice", "Enter a price of 0 or more.");
            valid = false;
        } else {
            setFieldOk("#productPrice");
        }

        return valid;
    }

    $("#productForm").on("submit", function(event) {
        event.preventDefault();

        if (!validateForm()) {
            $("#formMessage").html(
                '<div class="alert alert-danger">Please fix the highlighted fields.</div>'
            );
            return;
        }

        const newProduct = {
            id: $("#productId").val().trim(),
            description: $("#productDescription").val().trim(),
            category: $("#productCategory").val(),
            unit: $("#productUnit").val(),
            price: Number($("#productPrice").val()),
            info: $("#productInfo").val().trim()
        };

        products.push(newProduct);
        saveProducts();

        $("#searchInput").val("");
        applySearch();
        showProductJson();

        $("#formMessage").html(
            '<div class="alert alert-success">Product added successfully!</div>'
        );

        $("#productForm")[0].reset();
        $("#productForm .is-valid, #productForm .is-invalid").removeClass("is-valid is-invalid");
    });

    // AJAX: send JSON to API 

    function postJson(url, data, label) {
        $("#ajaxMessage").html(
            '<div class="alert alert-info mt-3">Sending ' + label + '...</div>'
        );

        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: "json"
        })
            .done(function() {
                $("#ajaxMessage").html(
                    '<div class="alert alert-success mt-3">The ' + label + ' was sent successfully.</div>'
                );
            })
            .fail(function(xhr, status, error) {
                $("#ajaxMessage").html(
                    '<div class="alert alert-warning mt-3">The API is not available yet (' +
                    escapeHtml(error || status) + '). The ' + label +
                    ' JSON above is ready to send once the RESTful API is built.</div>'
                );
            });
    }

    $("#sendCart").on("click", function() {
        if (cart.length === 0) {
            $("#ajaxMessage").html(
                '<div class="alert alert-danger mt-3">Add at least one item to the cart before sending.</div>'
            );
            return;
        }
        postJson(CART_API_URL, buildCartPayload(), "cart");
    });

    $("#sendProducts").on("click", function() {
        postJson(PRODUCTS_API_URL, products, "product collection");
    });

});