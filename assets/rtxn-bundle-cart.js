class BundleCart {
    constructor() {
        // Set definitions for dom elements

        // Remove from cart button class
        this.removeCartItem = 'cart__remove-bundle';

        // Remove from cart button elements
        this.removeCartEls = Array.from(document.getElementsByClassName(this.removeCartItem));
    }

    init = () => {
        // Remove from cart button event handles
        this.removeCartEls.forEach(i => {
            const bundle_id = i.dataset.bundleId;
            i.addEventListener("click", () => this.removeBundleItems(bundle_id));
        });
    }

    // Remove bundle from cart
    removeBundleItems = (bundle_id) => {
        jQuery.getJSON("/cart.js", function (cart) {
            // Create new updates object to send to cart update AJAX call
            // Loop through each cart item
            // If the item's bundle id matches the id passed in,
            // add the cart item key along with quantity of 0 to the data object
            let bundle_items = [];
            let qty = 0;
            let data = { updates: {} };
            cart.items.forEach((item, i) => {
                if (
                    item.properties.bundle_id &&
                    item.properties.bundle_id == bundle_id
                ) {
                    data.updates[item.key] = 0;
                }
            });
    
            // API call to update the cart contents and set the bundle item quantities to 0
            $.ajax({
                type: "POST",
                url: "/cart/update.js",
                data: data,
                dataType: "json",
                success: function () {
                    window.location.href = "/cart";
                },
            });
        });
    }
}

bundleCart = new BundleCart();
bundleCart.init();


