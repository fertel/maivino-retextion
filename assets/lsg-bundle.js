
let productSelectionButtonClicked = false,
    productSelectionIndex,
    selectedProducts = [];
document.querySelectorAll('.lsg-bundle-block').forEach(() => {
    selectedProducts.push([]);
})

const buildSelectedProductArray = (trigger) => {
    const method = (trigger.classList.contains('lsg-bundle-product-select-quantity-minus') ? 'minus' : (trigger.classList.contains('lsg-bundle-product-select-quantity-plus') ? 'plus' : 'err'));
    const triggeredProductWrapper = trigger.closest('.lsg-bundle-product-select-wrapper');
    const variantID = triggeredProductWrapper.getAttribute('data-lsg-bundle-variant-select-id');
    const productTitle = triggeredProductWrapper.querySelector('.lsg-bundle-product-select-title').innerHTML;
    const bundleBlock = getBundleBlock(trigger);
    const bundleIndex0 = Array.from(bundleBlock.parentNode.children).indexOf(bundleBlock);

    switch (method) {
        case 'minus':
            if (productSelectionButtonClicked == true) {
                selectedProducts[bundleIndex0].splice(productSelectionIndex, 1);
                productSelectionButtonClicked = false
            }
            else {
                productSelectionIndex = selectedProducts[bundleIndex0].findLastIndex(p => p.selectedVariantId == variantID);
                selectedProducts[bundleIndex0].splice(productSelectionIndex, 1);
            }
            break;
        case 'plus':
            const productImageUrl = triggeredProductWrapper.querySelector('img').src;
            const productImageAlt = triggeredProductWrapper.querySelector('img').alt;
            let selectedProductData = {
                selectedProductImageUrl: productImageUrl,
                selectedVariantId: variantID,
                selectedProductTitle: productTitle,
                selectedProductImageAlt: productImageAlt,
            };
            selectedProducts[bundleIndex0].push(selectedProductData);
            break;
    }
    updateSelectedProductGUI(trigger);
}

const updateSelectedProductGUI = (trigger) => {
    const bundleBlock = getBundleBlock(trigger);
    const bundleIndex0 = Array.from(bundleBlock.parentNode.children).indexOf(bundleBlock);
    if (selectedProducts[bundleIndex0].length > 0) {
        bundleBlock.classList.add('has-selected-product');
    } else {
        bundleBlock.classList.remove('has-selected-product');
    }

    const selectedProductsWrappers = bundleBlock.querySelectorAll('[data-bundle-builder-selected-products]');
    selectedProductsWrappers.forEach((selectedProductsWrapper) => {
        const selectedProductWrappers = selectedProductsWrapper.querySelectorAll('[data-bundle-builder-selected-variant-id]');

        selectedProductWrappers.forEach((productWrapper, i) => {
            const selectedProductData = selectedProducts[bundleIndex0][i];

            const productWrapperImage = productWrapper.querySelector('[data-bundle-builder-selected-product-image]');
            const productWrapperTitle = productWrapper.querySelector('[data-bundle-builder-selected-product-title]');

            if (typeof selectedProductData !== 'undefined') {

                productWrapper.setAttribute('data-bundle-builder-selected-variant-id', selectedProductData.selectedVariantId);

                productWrapperImage.src = selectedProductData.selectedProductImageUrl;
                productWrapperImage.alt = selectedProductData.selectedProductImageAlt;

                productWrapperTitle.innerHTML = selectedProductData.selectedProductTitle;

                productWrapper.classList.add('active');
            } else {

                productWrapper.setAttribute('data-bundle-builder-selected-variant-id', '');

                productWrapperImage.src = '';
                productWrapperImage.alt = '';

                productWrapperTitle.innerHTML = '';

                productWrapper.classList.remove('active');

            }
        });
    });

}

function setActiveBundle(trigger) {
    //sets different bundle blocks active
    const bundleIndex = trigger.dataset.bundleIndex;
    const bundleWrapper = trigger.closest('.lsg-bundle-wrapper');
    const bundleBlocks = bundleWrapper.querySelectorAll('.lsg-bundle-block');
    const targetBundle = bundleWrapper.querySelector('[data-bundle-index="' + bundleIndex + '"].lsg-bundle-block');
    if (targetBundle) {
        bundleBlocks.forEach(function (bundleBlock) {
            if (bundleBlock.dataset.bundleIndex != bundleIndex) {
                bundleBlock.classList.remove('lsg-bundle-block-active');
            } else {
                bundleBlock.classList.add('lsg-bundle-block-active');
            }
        });
        updateSelectedProductGUI(trigger);
        setUrl(targetBundle.querySelector('form'));
    }
}

function checkParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const bundleBlocks = document.querySelectorAll('.lsg-bundle-block');
    const queryString = window.location.search;
    const bundles = urlParams.getAll('bundle');
    let bundle_index = urlParams.getAll('bundle_index');
    const bundle_interval = urlParams.getAll('bundle_interval');
    const bundle_interval_frequency = urlParams.getAll('bundle_interval_frequency');
    if (bundles.length > 0 || urlParams.has('bundle_index') || urlParams.has('bundle_interval') || urlParams.has('bundle_interval_frequency')) {
        if (bundle_index.length > 0) {
            bundle_index = bundle_index[0]
        } else {
            bundle_index = 0;
        }
        if (isNaN(bundle_index)) {
            bundle_index = 0;
        }
        if (bundleBlocks.length < bundle_index) {
            bundle_index = 0;
        }
        const bundleBlock = bundleBlocks[bundle_index]
        if (bundle_index > 0) {
            const bundleBlockSelects = document.querySelectorAll('.lsg-bundle-size-select .lsg-bundle-size-select-el');
            bundleBlockSelects[bundle_index].click()
        }

        bundles.forEach(el => {
            const item = el.split('_')
            const id = item[0];
            const quantity = item[1];
            const quantityInput = bundleBlock.querySelector(`.lsg-bundle-product-select-quantity-input[data-product="${id}"]`);

            if (quantityInput != null) {
                quantityInput.value = parseInt(quantity, 10) - 1;
                const quantityInputPlus = quantityInput.closest('.lsg-bundle-product-select-quantity-wrap').querySelector(`.lsg-bundle-product-select-quantity-plus`);

                for (let i = 0; i < quantity; i++) {
                    quantityInput.value = i;
                    incrementSubProduct(quantityInputPlus);
                    buildSelectedProductArray(quantityInputPlus);
                    incrementEnableValidation(quantityInputPlus);
                    checkoutEnableValidation(quantityInputPlus);
                }
                // selectedProductsPlaceholderManager();
            }
        });
        bundle_interval.forEach(el => {
            const packSizeSelectorItem = bundleBlock.querySelector(`.lsg-bundle-interval-select input[name^="bundle_interval_select_"][value="${bundle_interval}"]`);
            if (packSizeSelectorItem != null) {
                packSizeSelectorItem.checked = true;
                updateInterval(packSizeSelectorItem);
                checkoutEnableValidation(packSizeSelectorItem);
            }
        });
        bundle_interval_frequency.forEach(el => {
            const bundleIntervalFrequencySelect = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select');
            if (bundleIntervalFrequencySelect != null) {
                bundleIntervalFrequencySelect.value = bundle_interval_frequency;
                updateFrequency(bundleIntervalFrequencySelect);
            }
        });
        if (history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;
            window.history.pushState({ path: newurl }, '', newurl);
        }
    }
}

function setUrl(trigger) {
    const bundleBlockWrapper = trigger.closest('.lsg-bundle-wrapper');
    if (bundleBlockWrapper && !bundleBlockWrapper.hasAttribute('data-lsg-bundle-set-url')) {
        return false;
    }
    const bundleBlock = getBundleBlock(trigger);
    const quantityInput = bundleBlock.querySelectorAll('.lsg-bundle-product-select-quantity-input');
    let url = '?';
    let paramName = 'bundle';
    quantityInput.forEach((el) => {
        const value = el.value;
        if (value > 0) {
            url += (url == '?') ? '' : '&';
            url += `${paramName}=${el.getAttribute('data-product')}_${value}`;
        }
    });
    const selectedBundle = bundleBlock.closest('.lsg-bundle-wrapper').querySelector('.lsg-bundle-block.lsg-bundle-block-active');
    if (selectedBundle != null) {
        paramName = 'bundle_index';
        url += (url == '?') ? '' : '&';
        url += `${paramName}=${Array.from(selectedBundle.parentNode.children).indexOf(selectedBundle)}`;
    }
    const bundleIntervalOption = bundleBlock.querySelector('.lsg-bundle-interval-select input[type="radio"]:checked');
    if (bundleIntervalOption != null) {
        paramName = 'bundle_interval';
        url += (url == '?') ? '' : '&';
        url += `${paramName}=${bundleIntervalOption.value}`;
        if (bundleIntervalOption.value == 'sub') {
            paramName = 'bundle_interval_frequency';
            url += (url == '?') ? '' : '&';
            const bundleIntervalFrequencySelect = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select');
            if (bundleIntervalFrequencySelect != null) {
                url += `${paramName}=${bundleIntervalFrequencySelect.value}`;
            }
        }
    }
    if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + url;
        window.history.pushState({ path: newurl }, '', newurl);
    }
}

function incrementEnableValidation(trigger) {
    //trigger is input or increment buttons
    const productSetList = trigger.closest('.lsg-bundle-product-set-list');
    const quantityIncrementButtons = productSetList.querySelectorAll('.lsg-bundle-product-select-quantity-increment');
    const bundleQuantity = getBundleQuantityByChild(trigger);
    const bundleMax = productSetList.dataset.bundleMax;

    //increment button enable/disable
    quantityIncrementButtons.forEach(function (quantityIncrementButton) {
        const method = (quantityIncrementButton.classList.contains('lsg-bundle-product-select-quantity-minus') ? 'minus' : (quantityIncrementButton.classList.contains('lsg-bundle-product-select-quantity-plus') ? 'plus' : 'err'));
        const input = quantityIncrementButton.closest('.lsg-bundle-product-select-quantity-wrap').querySelector('.lsg-bundle-product-select-quantity-input');
        const quantity = input.value;
        switch (method) {
            case 'minus':
                quantityIncrementButton.disabled = false;
                if (quantity <= 0) {
                    quantityIncrementButton.disabled = true;
                }
                if (quantity <= parseInt(input.min)) {
                    quantityIncrementButton.disabled = true;
                }
                break;
            case 'plus':
                quantityIncrementButton.disabled = false;
                if (quantity >= parseInt(input.max)) {
                    quantityIncrementButton.disabled = true;
                }
                if (parseInt(bundleMax) > 0) {
                    if (bundleQuantity >= parseInt(bundleMax)) {
                        quantityIncrementButton.disabled = true;
                    }
                }
                break;
        }
    });
}

function checkoutEnableValidation(trigger) {
    const bundleBlock = getBundleBlock(trigger);
    const addToCartButtons = bundleBlock.querySelectorAll('[data-lsg-bundle-atc');
    const bundleQuantity = getBundleQuantity(trigger);
    const interval = getBundleInterval(trigger);
    const bundleMin = (interval == 'otp' ? bundleBlock.dataset.otpBundleMin : bundleBlock.dataset.subBundleMin);
    const bundleMax = (interval == 'otp' ? bundleBlock.dataset.otpBundleMax : bundleBlock.dataset.subBundleMax);
    const quantityToAdd = bundleMin - bundleQuantity;

    //checkout button enable/disable
    addToCartButtons.forEach(function (addToCartButton) {
        const addToCartText = addToCartButton.querySelector('[data-lsg-bundle-submit-button-atc-text]');
        const addMoreText = addToCartButton.querySelector('[data-lsg-bundle-submit-button-add-more-text]');
        const addMoreQuantity = addToCartButton.querySelector('[data-lsg-bundle-submit-button-add-more-quantity]');

        if (bundleQuantity >= bundleMin && (bundleQuantity <= bundleMax || bundleMax < bundleMin)) {
            addToCartButton.classList.remove('disabled');
            addToCartText.classList.remove('hidden');
            addMoreText.classList.add('hidden');
            bundleBlock.classList.add('bundle-checkout-enabled');
        } else {
            addToCartButton.classList.add('disabled');
            addToCartText.classList.add('hidden');
            addMoreText.classList.remove('hidden');
            addMoreQuantity.innerHTML = quantityToAdd;
            bundleBlock.classList.remove('bundle-checkout-enabled');
        }
    });
}
function summateCounts(descriptions) {
    descriptions.sort()
    output = [[0, descriptions[0]]]
    descriptions.forEach((description) => {
        const [count, lastDesc] = output[output.length - 1]
        if (lastDesc == description) {
            output[output.length - 1] = [count + 1, lastDesc]
        }
        else {
            output[output.length] = [1, description]
        }
    })
    return output
}
function generateBundleDescription() {
    //hacking this instead of fixing stuff to make it easy for now
    const elems = document.querySelectorAll(".lsg-bundle-summary-block .bundle-builder__selected-product-title")
    const output = []
    elems.forEach((elem) => {
        output.push(elem.innerText)
    })
    return summateCounts(output).map(([count, text]) => {
        if (count == 1) {
            return text
        }
        else {
            return count.toString() + " x " + text
        }
    }).join(", ")
}
function addToCart(trigger) {
    const bundleID = getGuid();
    const bundleBlock = getBundleBlock(trigger);
    const bundleForm = bundleBlock.querySelector('.lsg-bundle-form');
    const bundleProductID = bundleForm.querySelector('input[name="id"]').value;
    const bundleSellingPlan = bundleForm.querySelector('input[name="selling_plan"]').value;
    const interval = (bundleSellingPlan == '' ? 'otp' : 'sub');
    const bundleMin = (interval == 'otp' ? bundleBlock.dataset.otpBundleMin : bundleBlock.dataset.subBundleMin);
    const bundleMax = (interval == 'otp' ? bundleBlock.dataset.otpBundleMax : bundleBlock.dataset.subBundleMax);
    const bundleProductList = bundleBlock.querySelector('.lsg-bundle-product-set-list');
    const bundleProductListInputs = bundleProductList.querySelectorAll('.lsg-bundle-product-select-quantity-input');
    let bundleCart = {
        'items': []
    };
    let bundleProductQuantity = 0;

    bundleProductListInputs.forEach(function (bundleProductInput) {
        bundleProductQuantity = bundleProductQuantity + parseInt(bundleProductInput.value);
        if (parseInt(bundleProductInput.value) > 0) {
            let cartItem = {
                id: bundleProductInput.dataset.product,
                quantity: parseInt(bundleProductInput.value),
                properties: {
                    "bundle_id": bundleID,
                    "is_child": true
                },
            };
            if (interval == 'sub') {
                cartItem["selling_plan"] = bundleSellingPlan;
            }
            bundleCart.items.push(cartItem);
        }
    });
    {

        let cartItem = {
            id: bundleProductID,
            quantity: 1,
            properties: {
                "bundle_id": bundleID,
                "bundle_parent": true,
                "bundle": generateBundleDescription(),
                "bundle_size": bundleProductQuantity
            },
        };
        if (interval == 'sub') {
            cartItem["selling_plan"] = bundleSellingPlan;
        }
        bundleCart.items.push(cartItem);
    }
    if (bundleProductQuantity > bundleMax || bundleProductQuantity < bundleMin) {
        //quantity is not within bundle size
        return false;
    }

    fetch('/cart/add.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(bundleCart),
        credentials: 'same-origin'
    }).then((response) => {
        if (response.status == 200) {
            // window.location.href = "/cart";
            // lsgSlideCartOpen();

        }
    }).catch((error) => {
        console.error(error);
    });
}

function updateFrequency(trigger) {
    //Render price and assign selling_plan in the form
    updateBundlePrice(trigger);
    updateSellingPlan(trigger);
}

function updateInterval(trigger) {
    //updates bundle block classes, resets displayed prices, and sets the selling_plan input value
    const bundleBlock = getBundleBlock(trigger);
    const sellingPlanInput = bundleBlock.querySelector('.lsg-bundle-form input[name="selling_plan"]');
    const frequencySelect = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select:not(.is-duplicate)');

    switch (trigger.value) {
        case 'otp':
            bundleBlock.classList.remove('lsg-bundle--sub-selected');
            bundleBlock.classList.add('lsg-bundle--otp-selected');
            sellingPlanInput.value = '';
            break;
        case 'sub':
            bundleBlock.classList.remove('lsg-bundle--otp-selected');
            bundleBlock.classList.add('lsg-bundle--sub-selected');
            sellingPlanInput.value = frequencySelect.value;
            break;
    }

    updateBundlePrice(trigger);
    updateSellingPlan(trigger);
}

function updateSellingPlan(trigger) {
    //set form selling_plan based on selected state
    const bundleBlock = getBundleBlock(trigger);
    const selling_plan = bundleBlock.querySelector('.lsg-bundle-form input[name="selling_plan"]');
    if (selling_plan) {
        if (bundleBlock.classList.contains('lsg-bundle--sub-selected') || bundleBlock.classList.contains('lsg-bundle--only-sub')) {
            const frequencySelect = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select:not(.is-duplicate)');
            if (frequencySelect) {
                selling_plan.value = frequencySelect.value;
            } else {
                selling_plan.value = '';
            }
        } else {
            selling_plan.value = '';
        }
    }
}

function inputChangeSubProduct(trigger) {
    //validates quantities for bundle products when the input field is updated
    if (isNaN(trigger.value) || trigger.value == '') {
        trigger.value = 0;
    }

    if (trigger.value > parseInt(trigger.max)) {
        trigger.value = parseInt(trigger.max);
    }

    if (trigger.value < 0) {
        trigger.value = 0;
    }

    if (trigger.value < parseInt(trigger.min)) {
        trigger.value = parseInt(trigger.min);
    }

    const bundleMax = trigger.closest('.lsg-bundle-product-set-list').dataset.bundleMax;
    const bundleQuantity = getBundleQuantity(trigger);

    if ((bundleQuantity > bundleMax) && bundleMax > 0) {
        let bundleDif = bundleQuantity - bundleMax;
        if (trigger.value >= bundleDif) {
            //reduce quantity to stay within bundle max
            trigger.value = (trigger.value - bundleDif);
        } else {
            //something went wrong, reset all values to min
            trigger.closest('.lsg-bundle-product-set-list').querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function (input) {
                input.value = parseInt(input.min);
            });
        }
    }
    updateQuantityDisplay(trigger);
    updateBundlePrice(trigger);
}

function incrementSubProduct(trigger) {
    //validates quantities for the bundle products and updates the input when increment buttons are clicked
    const method = (trigger.classList.contains('lsg-bundle-product-select-quantity-minus') ? 'minus' : (trigger.classList.contains('lsg-bundle-product-select-quantity-plus') ? 'plus' : ''));
    const input = trigger.closest('.lsg-bundle-product-select-quantity-wrap').querySelector('.lsg-bundle-product-select-quantity-input');
    const bundleMax = trigger.closest('.lsg-bundle-product-set-list').dataset.bundleMax;
    const bundleQuantity = getBundleQuantity(trigger);

    switch (method) {
        case 'plus':
            if (input.value >= parseInt(input.max)) {
                //reset to inventory max if over
                input.value = parseInt(input.max);
            } else {
                if ((bundleQuantity < parseInt(bundleMax)) || parseInt(bundleMax) < 1) {
                    input.value++;
                } else {
                    //at max bundle quantity, do not change
                }
            }
            updateBundlePrice(trigger);
            break;
        case 'minus':
            if (input.value <= parseInt(input.min)) {
                input.value = parseInt(input.min);
            } else if (input.value <= 0) {
                input.value = 0;
            } else {
                input.value--;
            }
            updateBundlePrice(trigger);
            break;
    }
    updateQuantityDisplay(input);
    mirrorQuantityDisplay(input);
}

function mirrorQuantityDisplay(input) {
    const bundleBlock = getBundleBlock(input);
    const productID = input.dataset.product;
    const quantity = input.value;
    const productInputs = bundleBlock.querySelectorAll('[data-product="' + productID + '"].lsg-bundle-product-select-quantity-input');
    productInputs.forEach(function (productInput) {
        if (productInput !== input) {
            productInput.value = quantity;
            inputChangeSubProduct(productInput);
        }
    });
}

function updateQuantityDisplay(input) {
    const inputWrap = input.closest('.lsg-bundle-product-select-quantity-wrap');
    if (input.value <= 0) {
        $(inputWrap).addClass('no-quantity');
    } else {
        $(inputWrap).removeClass('no-quantity');
    }
    const inputDisplay = input.parentNode.querySelector('.lsg-bundle-product-select-quantity-input-display');
    if (inputDisplay) {
        inputDisplay.innerHTML = input.value;
    }
}

function updateBundlePrice(trigger) {
    //updates OTP/Sub pricing
    const bundleBlock = getBundleBlock(trigger);
    const otpPriceEls = bundleBlock.querySelectorAll('.lsg-bundle-interval-otp-price');
    const subPriceEls = bundleBlock.querySelectorAll('.lsg-bundle-interval-sub-price');
    const curPriceEls = bundleBlock.querySelectorAll('[data-bundle-total]');
    const frequency = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select:not(.is-duplicate) option:checked');
    const productList = bundleBlock.querySelector('.lsg-bundle-product-set-list');
    const hasIntervalSelect = bundleBlock.classList.contains('lsg-bundle--has-interval-select');
    const productBasePrice = parseInt(bundleBlock.dataset.productBasePrice);
    let interval = ''
    if (bundleBlock.classList.contains('lsg-bundle--only-otp') || bundleBlock.classList.contains('lsg-bundle--otp-selected')) {
        interval = 'otp';
    } else if (bundleBlock.classList.contains('lsg-bundle--only-sub') || bundleBlock.classList.contains('lsg-bundle--sub-selected')) {
        interval = 'sub';
    }
    let otpSubtotal = 0;
    let subSubtotal = 0;

    if (productList && interval == 'otp') {
        productList.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function (otpProductInput) {
            let quantity = parseInt(otpProductInput.value);
            let price = parseInt(otpProductInput.dataset.price);
            otpSubtotal = otpSubtotal + (quantity * price);
            if (productList && frequency && hasIntervalSelect) {
                const discountType = frequency.dataset.discountType;
                const discountValue = frequency.dataset.discountValue;
                let discount = 0;
                switch (discountType) {
                    case 'percentage':
                        discount = (price * parseInt(discountValue)) / 100;
                        break;
                    case 'fixed_amount':
                        discount = parseInt(discountValue);
                        break;
                    case 'price':
                        discount = price - parseInt(discountValue);
                        break;
                }
                subSubtotal = subSubtotal + (quantity * (price - discount));
            }
        });
    }

    if (productList && frequency && interval == 'sub') {
        const discountType = frequency.dataset.discountType;
        const discountValue = frequency.dataset.discountValue;
        productList.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function (subProductInput) {
            let quantity = parseInt(subProductInput.value);
            let price = parseInt(subProductInput.dataset.price);
            let discount = 0;
            switch (discountType) {
                case 'percentage':
                    discount = (price * parseInt(discountValue)) / 100;
                    break;
                case 'fixed_amount':
                    discount = parseInt(discountValue);
                    break;
                case 'price':
                    discount = price - parseInt(discountValue);
                    break;
            }
            subSubtotal = subSubtotal + (quantity * (price - discount));

            if (productList && hasIntervalSelect) {
                otpSubtotal = otpSubtotal + (quantity * price);
            }
        });
    }

    if (otpSubtotal > 0) {
        otpSubtotal = otpSubtotal + productBasePrice;
    }
    if (subSubtotal > 0) {
        const discountType = frequency.dataset.discountType;
        const discountValue = frequency.dataset.discountValue;
        let discount = 0;
        switch (discountType) {
            case 'percentage':
                discount = (productBasePrice * parseInt(discountValue)) / 100;
                break;
            case 'fixed_amount':
                discount = parseInt(discountValue);
                break;
            case 'price':
                discount = productBasePrice - parseInt(discountValue);
                break;
        }
        if (discount < 0) { discount = 0; }
        subSubtotal = subSubtotal + (productBasePrice - discount);
    }

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    otpPriceEls.forEach(function (el) {
        el.innerHTML = currencyFormatter.format(otpSubtotal / 100);
    });
    subPriceEls.forEach(function (el) {
        el.innerHTML = currencyFormatter.format(subSubtotal / 100);
    });
    curPriceEls.forEach(function (el) {
        if (interval == 'otp') {
            el.innerHTML = currencyFormatter.format(otpSubtotal / 100);
        } else {
            el.innerHTML = currencyFormatter.format(subSubtotal / 100);
        }
    });
}

function initializeBundle() {
    //loop through bundle blocks
    document.querySelectorAll('.lsg-bundle-block').forEach(function (bundleBlock) {
        //set bundle block classes and initial selling_plan input
        const intervalSelect = bundleBlock.querySelector('.lsg-bundle-interval-select');
        const onlyOTP = bundleBlock.querySelector('.lsg-bundle-interval-only-otp');
        const onlySub = bundleBlock.querySelector('.lsg-bundle-interval-only-sub');
        const sellingPlanInput = bundleBlock.querySelector('.lsg-bundle-form input[name="selling_plan"]');
        const frequencySelect = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select:not(.is-duplicate)');
        if (intervalSelect) {
            //has otp/sub selector
            bundleBlock.classList.add('lsg-bundle--has-interval-select');
            let selectedInterval = intervalSelect.querySelector('input[name^="bundle_interval_select_"]:checked');
            switch (selectedInterval.value) {
                case 'otp':
                    bundleBlock.classList.add('lsg-bundle--otp-selected');
                    sellingPlanInput.value = '';
                    break;
                case 'sub':
                    bundleBlock.classList.add('lsg-bundle--sub-selected');
                    sellingPlanInput.value = frequencySelect.value;
                    break;
            }
        } else if (onlyOTP) {
            //has only otp options
            bundleBlock.classList.add('lsg-bundle--only-otp');
            sellingPlanInput.value = '';
        } else if (onlySub) {
            //has only sub options
            bundleBlock.classList.add('lsg-bundle--only-sub');
            sellingPlanInput.value = frequencySelect.value;
        }

        //intial enable/disable for quantity increments and submit button
        bundleBlock.querySelectorAll('.lsg-bundle-product-set-list').forEach(function (productSetList) {
            incrementEnableValidation(productSetList.querySelector('.lsg-bundle-product-select-quantity-input'));
        });
        checkoutEnableValidation(sellingPlanInput);
        setTimeout(function () {
            bundleBlock.classList.add('is-initialized');
        }, 500);
    });
    checkParameter();
}

function getBundleQuantity(trigger) {
    //gets the quantity of the current active bundle block product list
    let bundleBlock = getBundleBlock(trigger);
    let quantity = -1;
    let productList = bundleBlock.querySelector('.lsg-bundle-product-set-list');
    if (productList) {
        quantity = 0;
        productList.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function (input) {
            quantity = quantity + parseInt(input.value);
        });
    }
    return quantity;
}

function getBundleQuantityByChild(trigger) {
    const productSetList = trigger.closest('.lsg-bundle-product-set-list');
    let quantity = -1;
    if (productSetList) {
        quantity = 0;
        productSetList.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function (input) {
            quantity = quantity + parseInt(input.value);
        });
    }
    return quantity;
}

function getBundleInterval(trigger) {
    //checks if the bundle is set to display OTP or suscription options
    let bundleBlock = getBundleBlock(trigger);
    if (bundleBlock.classList.contains('lsg-bundle--has-interval-select')) {
        if (bundleBlock.classList.contains('lsg-bundle--otp-selected')) {
            return 'otp';
        }
        if (bundleBlock.classList.contains('lsg-bundle--sub-selected')) {
            return 'sub';
        }
    }
    if (bundleBlock.classList.contains('lsg-bundle--only-otp')) {
        return 'otp';
    }
    if (bundleBlock.classList.contains('lsg-bundle--only-sub')) {
        return 'sub';
    }
    return 'err';
}

function getBundleBlock(trigger) {
    return trigger.closest('.lsg-bundle-block');
}

function getGuid() {
    let d = new Date().getTime();
    let d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
}

//Event Listeners
if (document.addEventListener) {
    window.addEventListener('pageshow', function (event) {
        if (event.persisted || performance.getEntriesByType("navigation")[0].type === 'back_forward') {
            document.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function (input) {
                input.value = 0;
                inputChangeSubProduct(input);
                incrementEnableValidation(input);
                checkoutEnableValidation(input);
            });
        }
    },
        false);
}

document.querySelectorAll('[data-bundle-builder-selected-product-remove-button]').forEach(function (removeButton) {
    removeButton.addEventListener('click', function (e) {
        e.preventDefault();
        const triggeredProductWrapper = e.target.closest('[data-bundle-builder-selected-variant-id]');
        productSelectionButtonClicked = true;
        productSelectionIndex = triggeredProductWrapper.getAttribute('data-index');
        const variantID = triggeredProductWrapper.getAttribute('data-bundle-builder-selected-variant-id');
        const bundleBlock = getBundleBlock(e.currentTarget);
        const bundleProduct = bundleBlock.querySelector(`[data-lsg-bundle-variant-select-id='${variantID}']`);
        const bundleProductDecrement = bundleProduct.querySelector('.lsg-bundle-product-select-quantity-minus');
        bundleProductDecrement.click();
    });
});

document.querySelectorAll('.lsg-bundle-product-select-quantity-increment').forEach(function (incrementButton) {
    incrementButton.addEventListener('click', function (e) {
        e.preventDefault();
        incrementSubProduct(e.currentTarget);
        buildSelectedProductArray(e.currentTarget);
        incrementEnableValidation(e.currentTarget);
        checkoutEnableValidation(e.currentTarget);
        setUrl(e.currentTarget);
    })
});
document.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function (input) {
    input.addEventListener('change', function (e) {
        inputChangeSubProduct(e.currentTarget);
        incrementEnableValidation(e.currentTarget);
        checkoutEnableValidation(e.currentTarget);
    })
});
document.querySelectorAll('.lsg-bundle-interval-select input[name^="bundle_interval_select_"]').forEach(function (intervalSelector) {
    intervalSelector.addEventListener('change', function (e) {
        updateInterval(e.currentTarget);
        checkoutEnableValidation(e.currentTarget);
        setUrl(e.currentTarget);
    });
});
document.querySelectorAll('.lsg-bundle-interval-frequency-select').forEach(function (frequencySelect) {
    frequencySelect.addEventListener('change', function (e) {
        const trigger = e.currentTarget;
        updateFrequency(e.currentTarget);
        setUrl(e.currentTarget);
    })
});
document.querySelectorAll('[data-lsg-bundle-atc]').forEach((bundleATC) => {
    bundleATC.addEventListener('click', function (e) {
        e.preventDefault();
        if (e.currentTarget.classList.contains('disabled')) {
            //scroll to top of the bundle block
            const announcementOffset = parseInt(document.body.style.getPropertyValue('--announcement-offset').replace('px', '')) || 0;
            const headerOffset = parseInt(document.body.style.getPropertyValue('--header-offset').replace('px', '')) || 0;
            const offset = announcementOffset + headerOffset;
            const bundleBlock = getBundleBlock(e.currentTarget);
            window.scrollTo({ top: bundleBlock.offsetTop - offset, behavior: 'smooth' });
        } else {
            addToCart(e.currentTarget);
        }
    })
})
document.querySelectorAll('.lsg-bundle-size-select-el').forEach(function (bundleSelector) {
    bundleSelector.addEventListener('click', function (e) {
        e.preventDefault();
        setActiveBundle(e.currentTarget);
    });
});

//Run initialize
initializeBundle();

const bundleObserver = new IntersectionObserver(([entry]) => {
    const bundleBlock = entry.target.closest('.lsg-bundle-block');
    if (bundleBlock) {
        bundleBlock.classList.remove('summary-is-below');
        bundleBlock.classList.remove('summary-is-above');
        bundleBlock.classList.remove('summary-is-visible');

        if (entry.isIntersecting) {
            // is visible
            bundleBlock.classList.add('summary-is-visible');
            return
        } else if (entry.boundingClientRect.top > 0) {
            // item is below view
            bundleBlock.classList.add('summary-is-below');
        } else {
            // item is above view
            bundleBlock.classList.add('summary-is-above');
        }
    }
});
const buyboxes = document.querySelectorAll('.lsg-bundle-summary-block');
buyboxes.forEach((buybox) => {
    bundleObserver.observe(buybox);
});

const bottomObserver = new IntersectionObserver(([entry]) => {
    const bundleBlocks = document.querySelectorAll('.lsg-bundle-block');
    if (entry.isIntersecting) {
        bundleBlocks.forEach((bundleBlock) => {
            bundleBlock.classList.add('is-scroll-bottom');
        })
    } else {
        bundleBlocks.forEach((bundleBlock) => {
            bundleBlock.classList.remove('is-scroll-bottom');
        })
    }
}, {
    threshold: 1
});
const subFooter = document.querySelector('.io-sub-footer');
if (subFooter) {
    bottomObserver.observe(subFooter);
}
