class RtxnBundle {
    constructor() {
        /*
        *
        *   Set definitions for elements to target
        *
        *   If you wish to change dom elements targeted by this script
        *   this is where you can do so, simply be aware of where a 
        *   class or id is called for and insert it as only text i.e. 
        *   without # or . 
        *   
        *   You can create a custom front end, as long as these classes
        *   and ids are used in the way that is expected (quantity button
        *   wrappers must have a button element inside of them) and that
        *   the relevant data attributes are properly populated on their
        *   elements.
        * 
        *   The rest of this script can be ignored unless you need to
        *   customize functionality as well.
        * 
        */

        // Container element id
        this.container = 'rtxn-bundle';
        // Add to cart button id
        this.addToCart = 'rtxn-bundle-add-to-cart';
        // Product class name
        this.productClass = 'rtxn-bundle-item';
        // Class name for quantity increase button wrapper
        this.quantityInc = "plus";
        // Class name for quantity decrease button wrapper
        this.quantityDec = "minus";
        // Class name for quantity indicator (number)
        this.quantityIndicator = "bundle_quantity";
        // Item counter current quantity id
        this.itemCountFrom = "rtxn-item-count-from";
        // Item counter max quantity id
        this.itemCountTo = "rtxn-item-count-to";
        // Buy box one-time purchase price (id)
        this.otPrice = "one_time_price"
        // Buy box subscription purchase price (id)
        this.subPrice = "sub_price"
        /*
        *   Use definitions to target elements
        */
        
        this.containerEl = document.getElementById(this.container);
        this.addToCartEl = document.getElementById(this.addToCart);
        this.productEls = Array.from(document.getElementsByClassName(this.productClass));
        this.itemCountFromEl = document.getElementById(this.itemCountFrom);
        this.itemCountToEl = document.getElementById(this.itemCountTo);
        this.isSubscription = false;
        this.parentVariantId = document.getElementById('rtxn-parent-variant').value
        this.parentSellingPlan = document.getElementById('rtxn-parent-sellingplan').value
        this.otPriceEl = document.getElementById(this.otPrice);
        this.subPriceEl = document.getElementById(this.subPrice);
    }

    init = () => {
        /*
        *   Initialize bundle data
        */

        // Data object
        this.data = {
            bundleQuantity: 0,
            bundleMin: this.containerEl.dataset.bundleMin,
            bundleMax: this.containerEl.dataset.bundleMax,
            items: {},
        }

        // Add product items to data
        this.productEls.forEach(p => {
            const newProduct = {}
            newProduct.sellingPlanId = p.dataset.sellingPlanId;
            newProduct.productId = p.dataset.productId;
            newProduct.variantId = p.dataset.variantId;
            newProduct.subscriptionPrice = p.dataset.subscriptionPrice;
            newProduct.oneTimePrice = p.dataset.onetimePrice;
            newProduct.quantity = 0;
            newProduct.inventoryLimit = p.dataset.inventoryQuantity;

            this.data.items[p.dataset.variantId] = newProduct;
        });

        // Set client side
        this.setClientSide();

        /*
        *   Init event listeners
        */

        // Iterate product quantity button event listeners
        this.productEls.forEach(p => {
            // Increment
            p.querySelectorAll(`.${this.quantityInc}`)[0]
                .querySelector('button')
                .addEventListener("click", () => this.incrementQuantity(p));
            
            // Decrement
            p.querySelectorAll(`.${this.quantityDec}`)[0]
                .querySelector('button')
                .addEventListener("click", () => this.decrementQuantity(p));
        });

        // Add to cart button event listener
        this.addToCartEl
            .addEventListener("click", () => this.addBundleToCart());
    }


    /*
    *   Set client state to match data
    */
    setClientSide = () => {
        // Establish current state of data
        const isAtMax =  this.data.bundleQuantity >= this.data.bundleMax ? true : false;
        const isAboveMin = this.data.bundleQuantity >= this.data.bundleMin ? true: false;
        const isBundleQuantityNegative = this.data.bundleQuantity < 0 ? true : false;

        // Catch accidental negative quantity on bundle
        if (isBundleQuantityNegative) { this.bundleQuantity = 0; }

        // Toggle disabled status on add to cart button
        this.addToCartEl.disabled = !isAboveMin;

        // Set if is subscription
        this.isSubscription = document.getElementById('radio_sub').checked;
        

        // Iterate products and set conditions
        this.productEls.forEach(p => {
            const currentVariant = p.dataset.variantId;
            let currentQuantity = this.data.items[currentVariant].quantity;
            const hasQuantity = currentQuantity > 0 ? true : false;

            // Catch accidental negative quantities for product
            if (!hasQuantity) { 
                this.data.items[currentVariant].quantity = 0;
                currentQuantity = 0;
            }

            // Set increment button disabled state
            p.querySelectorAll(`.${this.quantityInc}`)[0]
                    .querySelector('button')
                    .disabled = isAtMax; 
            
            // Set decrement button disabled state
            p.querySelectorAll(`.${this.quantityDec}`)[0]
                    .querySelector('button')
                    .disabled = !hasQuantity; 
            
            // Set value for quantity indicator for product
            p.querySelectorAll(`.${this.quantityIndicator}`)[0]
                .innerHTML = this.data.items[currentVariant].quantity; 
        
        });

        // Set counter values
        this.itemCountFromEl.innerHTML = this.data.bundleQuantity;
        this.itemCountToEl.innerHTML = this.data.bundleMax;

        // Set bundle price
        const priceHolder = this.calculatePrice();
        this.subPriceEl.innerHTML = this.formatCurrency(priceHolder.sub);
        this.otPriceEl.innerHTML = this.formatCurrency(priceHolder.ot);
    }

    // Format Currency (USD) - if you have access to the Shopify object in your theme, consider using Money filters
    formatCurrency = (cur) => {
        let dollars = cur / 100;
        dollars = dollars.toLocaleString("en-US", {style:"currency", currency:"USD"});
        return dollars;
    }

    incrementQuantity = (p) => {
        const target = this.data.items[p.dataset.variantId];
        target.quantity++;
        this.data.bundleQuantity++;
        this.setClientSide();
        this.createCart();
    }

    decrementQuantity = (p) => {
        const target = this.data.items[p.dataset.variantId];
        target.quantity--;
        this.data.bundleQuantity--;
        this.setClientSide();
        this.createCart();
    }

    calculatePrice = () => {
        const items = this.data.items;
        let price = {};
        let subPrice = 0;
        let otPrice = 0;

        for (const item in items) {
            subPrice += items[item].subscriptionPrice * items[item].quantity;
            otPrice += items[item].oneTimePrice * items[item].quantity;
        }

        price.sub = subPrice;
        price.ot = otPrice;

        return price;
    }

    generateGUID = () => {
        // Generates a unique guid to be used for the bundle_id
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                let r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    populateCart = (guid, variantId, quantity, sellingPlanId) => {
        let item = {
            id: variantId,
            quantity: quantity,
            properties: {
                'bundle_id': guid
            }
        }
        if(this.isSubscription) { item['selling_plan'] = sellingPlanId}
        return item;
    }

    createCart = () => {
        // Validate cart has minimum number of products
        if (this.data.bundleQuantity >= this.data.bundleMin) {
            let cart = [];
            const guid = this.generateGUID();

            // Parent product
            const parentItem = {
                id: this.parentVariantId,
                quantity: 1,
                properties: {
                    'bundle_id': guid,
                    'bundle_parent': true
                }
            }

            if(this.isSubscription) { parentItem['selling_plan'] = this.parentSellingPlan; }
            console.log("parent: ", parentItem);
            cart.push(parentItem);

            // Children products
            for(const item in this.data.items) {
                if (this.data.items[item].quantity > 0) {
                    const newItem = this.populateCart(
                        guid, 
                        this.data.items[item].variantId, 
                        this.data.items[item].quantity,
                        this.data.items[item].sellingPlanId);
                    console.log(newItem)
                    cart.push(newItem)
                }
            }

            return cart;
        } else {
            return;
        }
    }

    addBundleToCart = () => {
        const items = this.createCart();

        const data = {
            items: items,
        }

        fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log(response.status)
            //window.location.href = "/cart";
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

bundle = new RtxnBundle();
bundle.init();
