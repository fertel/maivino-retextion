(() => {
    const updateCartCount = (cart) => {
        // get real items 
        let count = cart.items().filter((item) => !item.properties.bundle_id).reduce(
            (total, item) => total + item.quantity
            , 0)

        const bundles = getBundles(cart)
        count += Object.entries(bundles).filter(([_k, bundle]) => bundle.parent).reduce(
            (total, [_k, bundle]) => total + bundle.parent.quantity
            , 0)
        document.querySelector(".cart-menu .count").innerText = count;
        const stLabel = document.querySelector(".rebuy-cart__flyout-subtotal-label span")
        if (stLabel) {
            stLabel.innerText = stLabel.innerText.replace(/[0-9]+/, count)

        }


    }
    const setParentCartValue = (cart) => {
        const bundles = getBundles(cart)
        Object.entries(bundles).forEach(([k, bundle]) => {
            if (bundle.parent) {
                const total = bundle.items.reduce((total, item) => total + (item.quantity * item.price),
                    0)
                const className = ".property-value-" + k.replace(/[-]/g, "") + ".property-key-bundle_parent"

                const elem = document.querySelector(className + " .rebuy-money")
                if (elem) {
                    elem.innerText = cart.formatMoney(total)
                }
            }
        })

    }
    const deleteCartItems = (cart) => {
        const bundlesObj = getBundles(cart)
        Object.entries(bundlesObj).forEach(([_k, bundle]) => {
            if (!bundle.parent) {
                bundle.items.forEach((item) => window.Rebuy.Cart.removeItem(item))
            }
        })
    }

    const getBundles = (cart) => {
        const bundles = {}
        cart.items().filter((a) => a.properties.bundle_id).forEach(
            (item) => {
                bundles[item.properties.bundle_id] = bundles[item.properties.bundle_id] || { items: [] }
                if (item.properties.bundle_parent)
                    bundles[item.properties.bundle_id].parent = item
                else
                    bundles[item.properties.bundle_id].items.push(item)
            }
        )
        return bundles;
    }
    const setBundleCart = (cart) => {
        deleteCartItems(cart)
        updateCartCount(cart)
        setParentCartValue(cart)
    }
    document.addEventListener('rebuy:cart.change', function (event) {
        setBundleCart(event.detail.cart)
        setTimeout(() => setBundleCart(event.detail.cart), 1)
    });
    document.addEventListener('rebuy:cart.ready', function (event) {
        setBundleCart(event.detail.cart)
    });
    const productForm = document.querySelector("product-form")
    if (productForm) {
        productForm.addEventListener("add-to-cart", () => {
            setBundleCart(Rebuy.Cart.cart)
        })
    }

})()
