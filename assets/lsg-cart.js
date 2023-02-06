document.addEventListener('DOMContentLoaded', function () {
    window.lsgRenderCart = function () {
        renderCart();
    };
    function renderCart() {
        $.ajax({
            type: 'GET',
            url: '/cart.js',
            dataType: 'json',
            success: function (cart) {
                debugger
                clearCartDrawer();
                const obscuredCartData = obscureCartData(cart);

                updateQuantityElements(obscuredCartData);

                $(`[shipping-bar-percent]`).css('max-width', '0%');
                const freeShipText = $(`[slidecart-shipping-bar]`).attr('free-shipping-text');
                const freeShipping = $(`[slidecart-shipping-bar]`).attr('free-shipping-minimum');
                const cartSubtotal = `<p>$${parseFloat(cart.items_subtotal_price / 100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1").toString()}</p>`;
                const cartSubtotalInfo = `<h2>Subtotal</h2> ${cartSubtotal}`;
                $(`[cart-subtotal]`).html(cartSubtotalInfo);
                $('[shipping-notice]').each(function () {
                    var text = $(this).text();
                    if (text.includes('{{ price }}')) {
                        text = text.replace('{{ price }}', `$${freeShipping}`);
                        $(this).text(text);
                    }
                });
                var amountToShipping = (parseInt(freeShipping) - parseFloat(cart.items_subtotal_price / 100).toFixed(2)).toFixed(2);
                if (amountToShipping <= 0) {
                    $(`[shipping-bar-percent]`).css('max-width', '100%');
                    $('[shipping-notice]').each(function () {
                        var text = $(this).attr('shipping-text');
                        if (text.includes('{{ amount }}')) {
                            text = `${freeShipText}`;
                            $(this).text(text);
                        }
                    });
                    $('.shipping-info-amount-pre-threshold').addClass('hidden');
                    $('.shipping-info-amount-post-threshold').removeClass('hidden');
                } else if (parseInt(amountToShipping) == parseInt(freeShipping)) {
                    $('[slidecart-product-wrapper]').html('');
                    $('[shipping-notice]').each(function () {
                        var text = $(this).attr('shipping-text');
                        if (text.includes('{{ amount }}')) {
                            text = 'Your cart is empty';
                            $(this).text(text);
                        }
                    });
                    $('.shipping-info-amount-pre-threshold').removeClass('hidden');
                    $('.shipping-info-amount-post-threshold').addClass('hidden');
                } else {
                    $('[shipping-notice]').each(function () {
                        var text = $(this).attr('shipping-text');
                        if (text.includes('{{ amount }}')) {
                            text = text.replace('{{ amount }}', `$${amountToShipping}`);
                            $(this).text(text);
                        }
                    });
                    $(`[shipping-label]`).html('');
                    var maxWidth = (parseFloat(cart.items_subtotal_price / 100).toFixed(1) / parseInt(freeShipping)) * 100;
                    $(`[shipping-bar-percent]`).css('max-width', maxWidth + '%');
                    $('.shipping-info-amount-pre-threshold').removeClass('hidden');
                    $('.shipping-info-amount-post-threshold').addClass('hidden');
                }

                obscuredCartData.forEach((item, index) => {
                    const productTitle = `<h2>${item.itemTitle}</h2>`;
                    const productHandle = item.itemHandle;
                    const productId = item.itemID;
                    const productImage = `<img src="${item.itemImage}" >`;
                    const productPrice = `<p>${item.itemPrice}</p>`;
                    const productQuantity = item.itemQuantity;
                    const productUrl = item.itemUrl;
                    const productKey = item.itemKey;
                    const productPlanAllocation = item.itemSellingPlanAllocation;
                    const productBundleID = item.itemBundleID;
                    const isBundleChild = item.isBundleChild;
                    const isBundleParent = item.isBundleParent;
                    const bundleChildKeys = item.bundleChildKeys;
                    const bundleChildQuantities = item.bundleChildQuantities;
                    const bundleItemList = item.bundleItemList;
                    const bundleParentKey = item.bundleParentKey;

                    let productPackSize,
                        sellingPlanId,
                        planType,
                        planIdLoaded = false,
                        toggleButtonClass,
                        subscribeDropdownClass,
                        sellingPlanGroup,
                        percentOff,
                        sellingPlans,
                        productBundleId;

                    jQuery.getJSON(window.Shopify.routes.root + `products/${productHandle}.js`, (product) => {
                        if (product.selling_plan_groups.length > 0) {
                            sellingPlans = product.selling_plan_groups[0].selling_plans;
                        }
                    }).done((product) => {
                        // Item is a subscription
                        if (productPlanAllocation) {
                            sellingPlanId = item.itemPlanId;
                            planType = item.itemPlanType;
                            toggleButtonClass = 'hidden';
                            subscribeDropdownClass = '';
                        }
                        // Item is one-time purchase
                        else {
                            if (product.selling_plan_groups.length > 0) {
                                sellingPlans = product.selling_plan_groups[0].selling_plans;
                                sellingPlanId = product.selling_plan_groups[0].selling_plans[0].id;
                                sellingPlanGroup = product.selling_plan_groups[0].name;
                                percentOff = sellingPlanGroup.substring(sellingPlanGroup.indexOf('(') + 1, sellingPlanGroup.lastIndexOf(')'));
                                toggleButtonClass = '';
                                subscribeDropdownClass = 'hidden';
                            } else {
                                toggleButtonClass = 'hidden';
                                subscribeDropdownClass = '';
                            }
                            planType = 'One-time purchase';
                        }
                        planIdLoaded = true;
                    });

                    function renderItem() {
                        if (planIdLoaded === false) window.setTimeout(renderItem, 100);
                        else {
                            let concatSellingPlanOptions = '';
                            if (sellingPlans) {
                                sellingPlans.forEach(plan => {
                                    let sellingPlanSelectAttr;
                                    if (plan.id === sellingPlanId) sellingPlanSelectAttr = 'selected'
                                    concatSellingPlanOptions = `
                                        ${concatSellingPlanOptions} 
                                        <option value="${plan.id}" 
                                            product_id="${productId}" 
                                            qty="${productQuantity}" 
                                            key="${productKey}"
                                            plan_id="${sellingPlanId}"
                                            ${sellingPlanSelectAttr}
                                        >
                                            ${plan.name}
                                        </option>
                                    `;
                                });
                            }

                            const concatSubscribeDropdown = `
                                <select name="selling_plan" class="cart_item_selling_plan ${subscribeDropdownClass}" data-subscribe-select>
                                    <option value="" 
                                        product_id="${productId}" 
                                        qty="${productQuantity}" 
                                        key="${productKey}"
                                        plan_id="${sellingPlanId}"
                                    >
                                        One-Time Purchase 
                                    </option>
                                    ${concatSellingPlanOptions}
                                </select>
                            `;

                            const concatProductInfo = `
                                <div class="slidecart-item-wrapper" 
                                    data-slidecart-item="${productId}" 
                                    data-line="${Number(index + 1)}" 
                                    data-bundle-child-keys="${bundleChildKeys}" 
                                    data-bundle-child-quantities="${bundleChildQuantities}" 
                                    data-bundle-id="${productBundleID}" 
                                    data-bundle-parent-key="${bundleParentKey}" 
                                >
                                    <div class="slidecart-item-image-wrapper">${productImage}</div>
                                    <div class="slidecart-item-details-wrapper">
                                        <div class="slidecart-item-details-top">
                                            <div class="slidecart-item-description-wrapper">
                                                <a class="slidecart-item-title" href="${productUrl}">${productTitle}</a>
                                                ${bundleItemList}
                                                <span class="slidecart-item-purchase-frequency ${toggleButtonClass}">${planType}</span>
                                                ${concatSubscribeDropdown}
                                            </div>
                                            <div class="slidecart-item-qty-wrapper">
                                                <span class="removeItem" data-remove-key="${productKey}">Remove</span>
                                                <span class="slidecart-item-price">${productPrice}</span>
                                                <div class="slidecart-qty-wrapper" >
                                                    <button class="qty-button qty-minus-button js-minus-button" data-minus data-qty-button data-key="${productKey}">-</button>
                                                    <input class="cart-qty-input js-cart-qty-input" type="number" pattern="[0-9]*" data-input-key="${productKey}" value="${productQuantity}"/>
                                                    <button class="qty-button qty-plus-button js-plus-button" data-plus data-qty-button data-key="${productKey}">+</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button class="cart-item-payment-options__button ${toggleButtonClass}"
                                            key="${productKey}" 
                                            qty="${productQuantity}" 
                                            plan_id="${sellingPlanId}"
                                            product_id="${productId}" 
                                            data-cart-toggle-subscribe 
                                        >
                                            Subscribe
                                        </button>
                                    </div>
                                </div>`;

                            $(`[slidecart-product-wrapper]`).html($(`[slidecart-product-wrapper]`).html() + concatProductInfo);
                        }
                    }
                    if (isBundleChild) return;
                    renderItem();
                });
            },
            complete: () => {
                // renderUpsells();
            }
        });
    }
    window.lsgSlideCartOpen = function () {
        slideCartOpen();
    };
    function slideCartOpen() {
        $(`#slidecart-wrapper`).addClass('active');
        $(`[slidecart-overlay]`).addClass('active');
        $('html, body').css('overflow', 'hidden');
        renderCart();
        // mixpanel.track('Open Cart'); 
    };
    window.lsgSlideCartClose = function () {
        slideCartClose();
    };
    function slideCartClose() {
        $(`#slidecart-wrapper`).removeClass('active');
        $('html, body').css('overflow', 'auto');
        $(`[slidecart-overlay]`).removeClass('active');
    }
    $('[href="/cart"]').on('click', function (e) {
        e.preventDefault();
        slideCartOpen();
    });
    /* $('form[action="/cart/add"]').on('submit', function(e){
        e.preventDefault();
        console.log(e);
    }); */
    $(document).on('click', '[data-slidecart-trigger]', function () {
        slideCartOpen();
    });
    $(document).on('click', '[data-close-slidecart], [slidecart-overlay]', function () {
        slideCartClose();
    });
    renderCart();
    if (window.location.href.indexOf('?cart-opened') > -1) {
        slideCartOpen();
    }
    function clearCartDrawer() {
        $(`[slidecart-product-wrapper]`).html('');
    }
    const bindSlideCartUIActions = () => {

        function updateItemQuantity(target, key, newQty, currentQty = 1) {
            const bundleChildKeys = $(target).closest('[data-bundle-child-keys]').attr('data-bundle-child-keys');
            const bundleChildQuantities = $(target).closest('[data-bundle-child-keys]').attr('data-bundle-child-quantities');
            const isBundleParent = bundleChildKeys !== '' ? true : false;

            // if this is a bundle parent product
            if (isBundleParent) {
                const childKeysArray = bundleChildKeys.split(',');
                const childQuantitiesArray = bundleChildQuantities.split(',');

                let formData = {
                    updates: {}
                };

                childKeysArray.forEach((childKey, i) => {
                    const currentChildQty = parseInt(childQuantitiesArray[i]);
                    let newChildQty = (currentChildQty / currentQty) * newQty;
                    if (newChildQty < 0) newChildQty = 0;

                    formData['updates'][String(childKey)] = newChildQty;
                });

                $.ajax({
                    type: 'POST',
                    url: '/cart/update.js',
                    data: formData,
                    dataType: 'json',
                    success: function () {
                        renderCart();
                    }
                });
            } else {
                const data = {
                    "id": key,
                    "quantity": newQty
                };

                $(`[data-input-key="${key}"]`).attr('value', newQty);

                $.ajax({
                    type: 'POST',
                    url: '/cart/change.js',
                    data: data,
                    dataType: 'json',
                    success: function () {
                        renderCart();
                    }
                });
            }
        }

        // Update item quantity
        // $(document).off().on('click', `[data-qty-button]`, (event) => {
        $(document).on('click', `[data-qty-button]`, (event) => {
            event.preventDefault();

            const key = $(event.target).attr('data-key');
            const currentQty = parseInt($(`[data-input-key="${key}"]`).attr('value'));
            let newQty;

            if ($(event.target).hasClass('js-plus-button')) {
                newQty = currentQty + 1;
            } else {
                newQty = currentQty - 1;
                if (newQty < 0) newQty = 0;
            }

            updateItemQuantity(event.target, key, newQty, currentQty);
        });

        // Remove item
        // $(`span.removeItem`).click(function () {
        $(document).on('click', `.slidecart-wrapper span.removeItem`, function (e) {
            var key = $(this).attr('data-remove-key');
            updateItemQuantity(e.target, key, 0);
        });

        // Add upsell
        $(document).on('click', '[data-upsell-atc]', (event) => {
            var variantId = $(event.target).attr('data-upsell-atc');
            var data = {
                "id": variantId,
                "quantity": 1,
            };
            $.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: data,
                dataType: 'json',
                success: () => {
                    renderCart();
                }
            });
        });

        // Toggle OTP to Subscribe
        $(document).on('click', '[data-cart-toggle-subscribe]', (event) => {
            event.preventDefault();
            updateItemSubscription(event);
        });

        // Change Subscription Plan
        $(document).on('change', '[data-subscribe-select]', (event) => {
            event.preventDefault();
            updateItemSubscription(event);
        });

        $(document).on('click', '[add-upsell]', function () {
            var id = $(this).attr('variant-id');
            var data = {
                "id": id,
                "quantity": 1,
            };
            $.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: data,
                dataType: 'json',
                success: function () {
                    renderCart();
                }
            });
        });
    };
    bindSlideCartUIActions();
    const obscureCartData = (cart) => {
        let obscuredCartData = [];

        cart.items.forEach((item) => {

            const itemPrice = parseFloat(item.line_price / 100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1").toString();
            const itemSellingPlanAllocation = (item.selling_plan_allocation !== undefined) ? true : false;
            const itemPlanId = (item.selling_plan_allocation !== undefined) ? item.selling_plan_allocation.selling_plan.id : false;
            const itemPlanType = (item.selling_plan_allocation !== undefined) ? item.selling_plan_allocation.selling_plan.name : false;
            const itemBundleID = (item.properties !== null) ? ((item.properties.bundle_id !== undefined) ? item.properties.bundle_id : false) : false;
            const isBundleChild = (item.properties !== null) ? ((item.properties.bundle_id !== undefined && item.properties.bundle_parent === undefined) ? true : false) : false;
            const isBundleParent = (item.properties !== null) ? ((item.properties.bundle_parent === true) ? true : false) : false;

            let cartDataItem = {
                itemID: item.id,
                itemTitle: item.title,
                itemHandle: item.handle,
                itemImage: item.image,
                itemPrice: itemPrice,
                itemQuantity: item.quantity,
                itemGrams: item.grams,
                itemUrl: item.url,
                itemKey: item.key,
                itemSellingPlanAllocation: itemSellingPlanAllocation,
                itemPlanId: itemPlanId,
                itemPlanType: itemPlanType,
                itemBundleID: itemBundleID,
                isBundleChild: isBundleChild,
                isBundleParent: isBundleParent,
                bundleChildKeys: '',
                bundleChildQuantities: '',
                bundleItemList: '',
                bundleParentKey: '',
                itemTags: [],
            };

            obscuredCartData.push(cartDataItem);
        });

        let removalIndexes = [];
        obscuredCartData.forEach((mainItem) => {

            if (mainItem.isBundleParent) {

                const mainItemBundleID = mainItem.itemBundleID;

                if (mainItemBundleID) {
                    let bundleChildKeys = [];
                    let bundleChildQuantities = [];
                    let bundleItemList = '';

                    obscuredCartData.forEach((comparedItem, i) => {
                        const comparedItemBundleID = comparedItem.itemBundleID;
                        const comparedItemPrice = parseFloat(comparedItem.itemPrice);

                        if (comparedItem.isBundleParent === false && comparedItemBundleID === mainItemBundleID) {
                            bundleChildKeys.push(comparedItem.itemKey)
                            bundleChildQuantities.push(comparedItem.itemQuantity)
                            bundleItemList += '<li class="cart-item-bundle-el">' + comparedItem.itemTitle + (comparedItem.itemQuantity > 1 ? ' (' + comparedItem.itemQuantity + ')' : '') + '</li>';
                            mainItem.itemPrice = parseFloat(parseFloat(mainItem.itemPrice) + comparedItemPrice).toFixed(2);
                            removalIndexes.push(i);
                        }
                        if (comparedItem.isBundleParent === true && comparedItemBundleID === mainItemBundleID) {
                            bundleChildKeys.push(comparedItem.itemKey)
                            bundleChildQuantities.push(comparedItem.itemQuantity)
                            mainItem.bundleParentKey = comparedItem.itemKey;
                        }
                    });

                    mainItem.bundleChildKeys = bundleChildKeys;
                    mainItem.bundleChildQuantities = bundleChildQuantities;
                    mainItem.bundleItemList = (bundleItemList != '' ? '<ul class="cart-item-bundle-items">' + bundleItemList + '</ul>' : '');
                }
            }
        });

        obscuredCartData = obscuredCartData.filter((item, index) => {
            return removalIndexes.indexOf(index) == -1;
        });

        return obscuredCartData;
    };
    const initQuantityElements = () => {
        $.ajax({
            type: 'GET',
            url: '/cart.js',
            dataType: 'json',
            success: function (cart) {
                const obscuredCartData = obscureCartData(cart);
                let cartQty = 0;
                obscuredCartData.forEach((item, index) => {
                    if (item.isBundleChild) return;
                    cartQty = cartQty + item.itemQuantity;
                });
                $('[data-cart-slider-total-quantity]').html(`(${cartQty})`);
                $('[data-lsg-cart-count]').html(cartQty);
            }
        });
    };
    const updateQuantityElements = (data) => {
        const obscuredCartData = data;
        let cartQty = 0;
        obscuredCartData.forEach((item, index) => {
            if (item.isBundleChild) return;
            cartQty = cartQty + item.itemQuantity;
        });
        $('[data-cart-slider-total-quantity]').html(`(${cartQty})`);
        $('[data-lsg-cart-count]').html(cartQty);
    }
    const updateItemSubscription = (event) => {

        let key,
            qty,
            plan,
            oldPlan,
            id,
            additionDataArray = {},
            removalData = {
                updates: {}
            };


        if ($(event.target).is('[data-cart-toggle-subscribe]')) {
            key = $(event.target).attr('key');
            id = parseInt($(event.target).attr('product_id'));
            qty = parseInt($(event.target).attr('qty'));
            plan = parseInt($(event.target).attr('plan_id'));
        }
        if ($(event.target).is('[data-subscribe-select]')) {
            key = $("option:selected", $(event.target)).attr('key');
            id = parseInt($("option:selected", $(event.target)).attr('product_id'));
            qty = parseInt($("option:selected", $(event.target)).attr('qty'));
            plan = parseInt($("option:selected", $(event.target)).attr('value'));
            oldPlan = parseInt($("option:selected", $(event.target)).attr('plan_id'));
        }

        const isOTP = isNaN(parseFloat(plan));

        if (oldPlan === plan) return

        // Determine if this is a bundle parent
        const bundleChildKeys = $(event.target).closest('[data-bundle-child-keys]').attr('data-bundle-child-keys');
        const bundleChildQuantities = $(event.target).closest('[data-bundle-child-quantities]').attr('data-bundle-child-quantities');
        const bundleID = $(event.target).closest('[data-bundle-id]').attr('data-bundle-id');
        const bundleParentKey = $(event.target).closest('[data-bundle-parent-key]').attr('data-bundle-parent-key');

        const isBundleParent = bundleChildKeys !== '' ? true : false;

        // if this is a bundle parent product
        if (isBundleParent === true) {
            const childKeysArray = bundleChildKeys.split(',');
            const childQuantitiesArray = bundleChildQuantities.split(',');

            let product_data = childKeysArray.map((childKey, i) => {
                const childIsBundleParent = childKey === bundleParentKey ? true : false;
                const currentChildQty = parseInt(childQuantitiesArray[i]);
                const childID = parseInt(childKey.split(':')[0]);

                removalData['updates'][childKey] = 0;

                if (isOTP) {
                    return {
                        quantity: currentChildQty,
                        id: childID,
                        properties: {
                            bundle_id: bundleID,
                            bundle_parent: childIsBundleParent
                        }
                    }
                } else {
                    return {
                        quantity: currentChildQty,
                        id: childID,
                        selling_plan: plan,
                        properties: {
                            bundle_id: bundleID,
                            bundle_parent: childIsBundleParent
                        }
                    }
                }
            })

            additionDataArray = {
                items: product_data
            };
        }
        else {

            removalData['updates'][key] = 0;

            if (isOTP) {
                additionDataArray = {
                    items: [{
                        quantity: qty,
                        id: id,
                        properties: {
                            bundle_id: false,
                            bundle_parent: false
                        }
                    }]
                }
            } else {
                additionDataArray = {
                    items: [{
                        quantity: qty,
                        id: id,
                        selling_plan: plan,
                        properties: {
                            bundle_id: false,
                            bundle_parent: false
                        }
                    }]
                }
            }
        }

        const reAddToCart = () => {

            fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(additionDataArray)
            }).then((response) => {
                /* products were added */

                if (isBundleParent === true) {
                    renderCart();
                } else {
                    // Add item if not added - edge case where added product gets deleted
                    // ajax get cart
                    $.ajax({
                        type: 'GET',
                        url: '/cart.js',
                        dataType: 'json',
                        success: (cart) => {
                            // check cart for product key,
                            let productExists = false;
                            cart.items.forEach((item) => {
                                const itemBundleID = (item.properties !== null) ? ((item.properties.bundle_id !== undefined) ? item.properties.bundle_id : false) : false;
                                if (itemBundleID == false && item.id === id) {
                                    productExists = true;
                                }
                            })

                            // if key doesn't exist add product again
                            if (productExists === false) {
                                reAddToCart();
                            } else {
                                // setTimeout(renderCart(), 500)
                                renderCart();
                            }
                        }
                    });
                }
            })
                .catch((error) => {
                    console.error('Error:', error);
                });
        };

        $.ajax({
            type: 'POST',
            url: '/cart/update.js',
            data: removalData,
            dataType: 'json',
            success: () => {
                setTimeout(function () {
                    reAddToCart();
                }, 750);
            }
        });
    };
    // function renderUpsells() {
    //     $(`[slidecart-upsell-wrapper].flickity-enabled`).flickity('destroy');
    //     $(`[slidecart-upsell-wrapper]`).html('');
    //     $.ajax({
    //         type: 'GET',
    //         url: '/cart/?view=upselljson',
    //         dataType: 'html',
    //         success: function(data) {
    //             $(`[slidecart-upsell-wrapper]`).html(data.trim());
    //             setTimeout(function(){
    //                 renderUpsellSlider();
    //             }, 50);
    //         } 
    //     });

    // }
    // function renderUpsellSlider() {
    //     if ($('[slidecart-upsell-wrapper] .slidecart-upsell').length > 1) {
    //         $(`[slidecart-upsell-wrapper]`).flickity({
    //             prevNextButtons: true,
    //             freeScroll: true,
    //             wrapAround: true,
    //             adaptiveHeight: true,
    //             contain: true
    //         });
    //     }
    // }
});