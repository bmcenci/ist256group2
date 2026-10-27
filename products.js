const STORAGE_KEY = "clubProducts";
const CART_STORAGE_KEY = "clubShoppingCart";

// Replace this URL when your group's REST API is developed.
const API_URL = "/api/products";

let products = [];
let cart = [];
let editingId = null;

$(document).ready(function () {
    const savedProducts = localStorage.getItem(STORAGE_KEY);
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            if (!Array.isArray(cart)) cart = [];
        } catch (error) {
            cart = [];
        }
    }

    if (savedProducts) {
        try {
            products = JSON.parse(savedProducts);
            if (!Array.isArray(products)) products = [];
            render();
        } catch (error) {
            loadFromJsonFile();
        }
    } else {
        loadFromJsonFile();
    }

    function loadFromJsonFile() {
        $.getJSON("products.json")
            .done(function (data) {
                products = Array.isArray(data) ? data : [];
                saveProducts();
                showMessage("Product data loaded.", "success");
            })
            .fail(function () {
                products = [];
                render();
                showMessage(
                    "Could not load products.json. Check that the file exists.",
                    "danger"
                );
            });
    }

    function saveProducts() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        render();
    }

    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        renderCart();
    }

    function escapeHtml(value) {
        return $("<div>").text(value == null ? "" : String(value)).html();
    }

    function render() {
        const $body = $("#productTableBody").empty();

        products.forEach(function (product) {
            const id = escapeHtml(product.id);
            $body.append(`
                <tr data-id="${id}">
                    <td>${id}</td>
                    <td>${escapeHtml(product.description)}</td>
                    <td>${escapeHtml(product.category)}</td>
                    <td>${escapeHtml(product.unit)}</td>
                    <td>$${Number(product.price).toFixed(2)}</td>
                    <td>${escapeHtml(product.info) || "N/A"}</td>
                    <td>
                        <div class="d-flex flex-wrap gap-1">
                            <button type="button" class="btn btn-sm btn-success add-cart-btn">Add to Cart</button>
                            <button type="button" class="btn btn-sm btn-warning edit-btn">Edit</button>
                            <button type="button" class="btn btn-sm btn-danger delete-btn">Delete</button>
                        </div>
                    </td>
                </tr>
            `);
        });

        $("#productJson").text(JSON.stringify(products, null, 2));
        applyFilters();
        renderCart();
    }

    function applyFilters() {
        const term = $("#searchBox").val().toLowerCase().trim();
        const category = $("#categoryFilter").val();
        let visible = 0;

        $("#productTableBody tr").each(function () {
            const rowText = $(this).text().toLowerCase();
            const rowCategory = $(this).children().eq(2).text();
            const matches = rowText.includes(term) &&
                (category === "" || rowCategory === category);

            $(this).toggle(matches);
            if (matches) visible++;
        });

        $("#noResults").toggleClass(
            "d-none",
            visible > 0 || products.length === 0
        );
    }

    $("#searchBox").on("input", applyFilters);
    $("#categoryFilter").on("change", applyFilters);

    $("#productForm").on("submit", function (event) {
        event.preventDefault();

        const form = this;
        const id = $("#productId").val().trim();

        const duplicate = products.some(function (product) {
            return product.id.toLowerCase() === id.toLowerCase()
                && product.id !== editingId;
        });

        if (duplicate) {
            $("#productId")[0].setCustomValidity("duplicate");
            $("#productIdFeedback").text("That Product ID already exists.");
        } else {
            $("#productId")[0].setCustomValidity("");
            $("#productIdFeedback").text(
                "Enter a unique ID using 3-15 letters, numbers, or dashes."
            );
        }

        if (!form.checkValidity()) {
            $(form).addClass("was-validated");
            showMessage("Please fix the highlighted fields.", "danger");
            return;
        }

        const item = {
            id: id,
            description: $("#productDescription").val().trim(),
            category: $("#productCategory").val(),
            unit: $("#productUnit").val(),
            price: Number($("#productPrice").val()),
            info: $("#productInfo").val().trim()
        };

        if (editingId === null) {
            products.push(item);
            showMessage("Product added successfully!", "success");
        } else {
            const index = products.findIndex(function (product) {
                return product.id === editingId;
            });

            if (index !== -1) {
                products[index] = item;

                cart.forEach(function (cartItem) {
                    if (cartItem.id === editingId) {
                        cartItem.description = item.description;
                        cartItem.category = item.category;
                        cartItem.unit = item.unit;
                        cartItem.price = item.price;
                        cartItem.info = item.info;
                    }
                });
            }

            showMessage("Product updated successfully!", "success");
            resetFormState();
            saveCart();
        }

        saveProducts();
        form.reset();
        $(form).removeClass("was-validated");
    });

    $("#productTableBody").on("click", ".edit-btn", function () {
        const id = String($(this).closest("tr").attr("data-id"));
        const product = products.find(function (item) {
            return item.id === id;
        });

        if (!product) return;

        $("#productId").val(product.id);
        $("#productDescription").val(product.description);
        $("#productCategory").val(product.category);
        $("#productUnit").val(product.unit);
        $("#productPrice").val(product.price);
        $("#productInfo").val(product.info || "");

        editingId = product.id;
        $("#productSubmit").text("Update Product");
        $("#productCancel").removeClass("d-none");
        $("html, body").animate({ scrollTop: 0 }, 300);
    });

    $("#productCancel").on("click", function () {
        resetFormState();
        $("#productForm")[0].reset();
        $("#productForm").removeClass("was-validated");
        $("#productId")[0].setCustomValidity("");
    });

    function resetFormState() {
        editingId = null;
        $("#productSubmit").text("Add Product");
        $("#productCancel").addClass("d-none");
    }

    $("#productTableBody").on("click", ".delete-btn", function () {
        const id = String($(this).closest("tr").attr("data-id"));

        if (!confirm("Are you sure you want to delete product " + id + "?")) {
            return;
        }

        products = products.filter(function (product) {
            return product.id !== id;
        });
        cart = cart.filter(function (item) {
            return item.id !== id;
        });

        if (editingId === id) {
            resetFormState();
            $("#productForm")[0].reset();
        }

        saveCart();
        saveProducts();
        showMessage("Product deleted.", "warning");
    });

    $("#productTableBody").on("click", ".add-cart-btn", function () {
        const id = String($(this).closest("tr").attr("data-id"));
        const product = products.find(function (item) {
            return item.id === id;
        });

        if (!product) return;

        const cartItem = cart.find(function (item) {
            return item.id === id;
        });

        if (cartItem) {
            cartItem.quantity = Math.min(99, cartItem.quantity + 1);
        } else {
            cart.push({
                id: product.id,
                description: product.description,
                price: Number(product.price),
                quantity: 1
            });
        }

        saveCart();
        showCartMessage(product.description + " added to your cart.", "success");
    });

    function renderCart() {
        const $body = $("#cartTableBody").empty();
        let total = 0;
        let itemCount = 0;

        cart.forEach(function (item) {
            const subtotal = Number(item.price) * Number(item.quantity);
            total += subtotal;
            itemCount += Number(item.quantity);

            $body.append(`
                <tr data-id="${escapeHtml(item.id)}">
                    <td>
                        <strong>${escapeHtml(item.description)}</strong>
                        <div class="small text-muted">ID: ${escapeHtml(item.id)}</div>
                    </td>
                    <td>$${Number(item.price).toFixed(2)}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm cart-quantity"
                               min="1" max="99" step="1" value="${Number(item.quantity)}"
                               aria-label="Quantity for ${escapeHtml(item.description)}">
                    </td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-danger remove-cart-btn">Remove</button>
                    </td>
                </tr>
            `);
        });

        $("#cartTotal").text("$" + total.toFixed(2));
        $("#cartCount").text(itemCount + (itemCount === 1 ? " item" : " items"));
        $("#emptyCart").toggleClass("d-none", cart.length > 0);
    }

    $("#cartTableBody").on("change", ".cart-quantity", function () {
        const id = String($(this).closest("tr").attr("data-id"));
        const quantity = Number($(this).val());
        const item = cart.find(function (cartItem) {
            return cartItem.id === id;
        });

        if (!item) return;

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
            showCartMessage("Quantity must be a whole number from 1 to 99.", "danger");
            renderCart();
            return;
        }

        item.quantity = quantity;
        saveCart();
    });

    $("#cartTableBody").on("click", ".remove-cart-btn", function () {
        const id = String($(this).closest("tr").attr("data-id"));
        cart = cart.filter(function (item) {
            return item.id !== id;
        });
        saveCart();
        showCartMessage("Item removed from your cart.", "warning");
    });

    $("#clearCart").on("click", function () {
        if (cart.length === 0) {
            showCartMessage("Your cart is already empty.", "warning");
            return;
        }

        if (confirm("Remove all items from your shopping cart?")) {
            cart = [];
            saveCart();
            showCartMessage("Your cart has been cleared.", "success");
        }
    });

    // AJAX request for the future REST API. This endpoint will not work
    // until the backend is implemented and available at API_URL.
    $("#sendToApi").on("click", function () {
        if (products.length === 0) {
            showMessage("There are no products to send.", "warning");
            return;
        }

        $.ajax({
            url: API_URL,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ products: products })
        })
        .done(function () {
            showMessage("Product data was sent to the API successfully.", "success");
        })
        .fail(function (xhr) {
            if (xhr.status === 0 || xhr.status === 404) {
                showMessage(
                    "The API is not available yet. The JSON request code is ready for the future backend.",
                    "warning"
                );
            } else {
                showMessage("The API request failed (HTTP " + xhr.status + ").", "danger");
            }
        });
    });

    $("#downloadJson").on("click", function () {
        const blob = new Blob(
            [JSON.stringify(products, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "products.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });

    $("#resetData").on("click", function () {
        if (confirm("Discard catalog changes and reload products.json?")) {
            localStorage.removeItem(STORAGE_KEY);
            products = [];
            loadFromJsonFile();
            showMessage("Reloading the original JSON product data.", "warning");
        }
    });

    function showMessage(message, type) {
        $("#productMessage").empty().append(
            $("<div>").addClass("alert alert-" + type)
                .attr("role", "alert").text(message)
        );
    }

    function showCartMessage(message, type) {
        $("#cartMessage").empty().append(
            $("<div>").addClass("alert alert-" + type)
                .attr("role", "status").text(message)
        );
    }
});
