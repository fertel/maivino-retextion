// ========================================================================================
// ========================================================================================
// Bundle Builder
// ========================================================================================
// ========================================================================================

const bundleBuilderInit = () => {

    if (document.addEventListener) {
      window.addEventListener('pageshow', function (event) {
        if (event.persisted || performance.getEntriesByType("navigation")[0].type === 'back_forward') {
          console.log('restored from cache');
          document.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function(input){
            input.value = 0;
            inputChangeSubProduct(input);
            incrementEnableValidation(input);
            checkoutEnableValidation(input);
            console.log('zero input', input);
          });
          buildStickyUI();
        }
      },
      false);
    }

    const bindStickyUIActions = () => {
      document.querySelectorAll('[data-bundle-builder-selected-product-remove-button-sticky]').forEach(function(removeButton){
          removeButton.addEventListener('click', function(e){
              e.preventDefault();
              const triggeredProduct = e.target.closest('[data-bundle-builder-selected-product-id]');
              const productID = triggeredProduct.getAttribute('data-bundle-builder-selected-product-id');
              const productList = document.querySelector(`[data-lsg-bundle-product-sub-list]`);
              const bundleProduct = productList.querySelector(`[data-lsg-bundle-product-select-id='${productID}']`);
              const productDecrementTarget = bundleProduct.querySelector('.lsg-bundle-product-select-quantity-minus');
              productDecrementTarget.click();
          });
      });

      document.querySelectorAll('[data-lsg-bundle-plan-button-sticky]').forEach(function(planButton){
          planButton.addEventListener('click', function(e){
              e.preventDefault();
              const planID = planButton.getAttribute('data-lsg-bundle-plan-button-sticky');
              const orignalPlanButton = document.querySelector(`[data-lsg-bundle-interval-select] [for='${planID}']`);
              orignalPlanButton.click();
          });
      });

      document.querySelectorAll('[data-lsg-bundle-interval-select-sticky]').forEach(function(intervalSelector){
          intervalSelector.addEventListener('change', function(e){
              e.preventDefault();
              const selectedIndex = (intervalSelector.selectedIndex);
              const orignalIntervalSelect = document.querySelector('[data-lsg-bundle-interval-select] .lsg-bundle-interval-frequency-select');
              orignalIntervalSelect.selectedIndex = selectedIndex;
              orignalIntervalSelect.dispatchEvent(new Event('change'));
          });
      });

      document.querySelectorAll('[data-lsg-bundle-atc-sticky]').forEach(function(atcButton){
          atcButton.addEventListener('click', function(e){
              e.preventDefault();
              const orignalATCButton = document.querySelector('[data-lsg-bundle-wrapper] [data-lsg-bundle-atc]');
              orignalATCButton.click();
          });
      });
    }

    const buildStickyUI = () => {
      // Sticky Elements
      const stickySelectedProducts = document.querySelector('[data-bundle-builder-sticky-selected-products]');
      const stickyIntervalSelect = document.querySelector('[data-bundle-builder-sticky-interval-select]');
      const stickyAtc = document.querySelector('[data-bundle-builder-sticky-atc]');
      const stickyUnderAtcText = document.querySelector('[data-bundle-builder-sticky-under-atc-text]');
      
      // Original Elements
      const originalSelectedProducts = document.querySelector('[data-bundle-builder-selected-products]');
      const originalPlanSelectButtons = document.querySelectorAll('[data-lsg-bundle-interval-select] label');
      const originalIntervalSelect = document.querySelector('[data-lsg-bundle-interval-select] .lsg-bundle-interval-frequency-select');
      const originalAtc = document.querySelector('[data-lsg-bundle-atc]');
      const originalUnderAtcText = document.querySelector('[data-under-atc-text]');
      
      const planTitle = document.querySelector('.pdp__select-plan-title');
      const intervalOptions = originalIntervalSelect.querySelectorAll('option');

      // New Elements
      const clonedSelectedProducts = originalSelectedProducts.cloneNode(true);
      const clonedAtc = originalAtc.cloneNode(true);
      const clonedUnderAtcText = originalUnderAtcText.cloneNode(true);

      const clonedPlanTitle = planTitle.cloneNode(true);
      const newPlanButtonsWrapper = document.createElement('div');
      const newIntervalSelect = document.createElement('select');

      // Alter Product Removal Buttons
      const removalButtons = clonedSelectedProducts.querySelectorAll('[data-bundle-builder-selected-product-remove-button]');
      removalButtons.forEach((button) => {
          button.setAttribute('data-bundle-builder-selected-product-remove-button-sticky', '');
          button.removeAttribute('data-bundle-builder-selected-product-remove-button');
      });

      // Reset sticky UI Elements
      stickySelectedProducts.innerHTML = '';
      stickyIntervalSelect.innerHTML = '';
      stickyAtc.innerHTML = '';
      stickyUnderAtcText.innerHTML = '';

      // Build New Plan Selector
      newIntervalSelect.setAttribute('data-lsg-bundle-interval-select-sticky', '');
      newIntervalSelect.classList.add('bundle-builder-sticky__interval-select');
      newPlanButtonsWrapper.classList.add('bundle-builder-sticky__plan-button-wrapper');

      let subscriptionSelected = false;
      originalPlanSelectButtons.forEach((planButton, i) => {
          const newPlanButton = document.createElement('button');
          const planID = planButton.getAttribute('for');
          const planInput = document.getElementById(planID);
          
          newPlanButton.classList.add('bundle-builder-sticky__plan-button');
          newPlanButton.setAttribute('data-lsg-bundle-plan-button-sticky', `${planID}`);

          if (planInput.checked) {
              newPlanButton.classList.add('selected');
              if (planInput.value === 'sub') subscriptionSelected = true;
          }
          newPlanButton.innerHTML = planButton.innerHTML;
          newPlanButtonsWrapper.append(newPlanButton);
      });

      intervalOptions.forEach((option, i) => {
          const newOption = document.createElement('option');
          newOption.innerHTML = option.innerHTML;
          newIntervalSelect.append(newOption);
          
          if (originalIntervalSelect.selectedIndex !== i) return
          newIntervalSelect.selectedIndex = i;
      });

      // Update cloned ATC
      clonedAtc.setAttribute('data-lsg-bundle-atc-sticky', '');
      clonedAtc.removeAttribute('data-lsg-bundle-atc');

      // Build UI Elements
      stickyAtc.append(clonedAtc);

      if (selectedProducts.length > 0) stickySelectedProducts.append(clonedSelectedProducts);

      if (selectedProducts.length >= 4) {
          stickyIntervalSelect.append(clonedPlanTitle);
          stickyIntervalSelect.append(newPlanButtonsWrapper);
          if (subscriptionSelected) stickyIntervalSelect.append(newIntervalSelect);
          stickyUnderAtcText.append(clonedUnderAtcText);
      }

      bindStickyUIActions();
    }

    let productSelectionButtonClicked = false,
      productSelectionIndex,
      selectedProducts = [],
      freshProductTotal = 0;

    const buildSelectedProductArray = (trigger) => {
      const method = (trigger.classList.contains('lsg-bundle-product-select-quantity-minus') ? 'minus' : (trigger.classList.contains('lsg-bundle-product-select-quantity-plus') ? 'plus' : 'err'));
      const triggeredProductWrapper = trigger.closest('.lsg-bundle-product-select-wrapper');
      const productID = triggeredProductWrapper.getAttribute('data-lsg-bundle-product-select-id');
      const productType = triggeredProductWrapper.getAttribute('data-lsg-bundle-product-type');
      const productTitle = triggeredProductWrapper.querySelector('.lsg-bundle-product-select-title').innerHTML;
      
      switch(method) {
          case 'minus':
              if (productSelectionButtonClicked == true) {
                  selectedProducts.splice(productSelectionIndex, 1);
                  productSelectionButtonClicked = false
              }
              else {
                  productSelectionIndex = selectedProducts.findLastIndex(p => p.selectedProductId == productID);
                  selectedProducts.splice(productSelectionIndex, 1);    
              }

              if (productType === 'fresh') {
                  freshProductTotal--;
              }
              break;
          case 'plus':
              const productImageUrl = triggeredProductWrapper.querySelector('img').src;
              const productImageAlt = triggeredProductWrapper.querySelector('img').alt;
              let selectedProductData = {
                  selectedProductImageUrl: productImageUrl,
                  selectedProductId: productID,
                  selectedProductType: productType,
                  selectedProductTitle: productTitle,
                  selectedProductImageAlt: productImageAlt,
              };
              selectedProducts.push(selectedProductData);

              if (productType === 'fresh') {
                  freshProductTotal++;
              }
              break;
      }
      updateSelectedProductGUI(selectedProducts);
    }

    const updateSelectedProductGUI = (selectedProducts) => {
      const selectedProductWrappers = document.querySelectorAll('[data-bundle-builder-selected-product-id]');

      selectedProductWrappers.forEach((productWrapper, i) => {
          const selectedProductData = selectedProducts[i];

          const productWrapperImage = productWrapper.querySelector('[data-bundle-builder-selected-product-image]');
          const productWrapperType = productWrapper.querySelector('[data-bundle-builder-selected-product-type]');
          const productWrapperTitle = productWrapper.querySelector('[data-bundle-builder-selected-product-title]');

          if (typeof selectedProductData !== 'undefined') {
              
              productWrapper.setAttribute('data-bundle-builder-selected-product-id', selectedProductData.selectedProductId);

              productWrapperImage.src = selectedProductData.selectedProductImageUrl;
              productWrapperImage.alt = selectedProductData.selectedProductImageAlt;

              productWrapperType.innerHTML = selectedProductData.selectedProductType;
              productWrapperTitle.innerHTML = selectedProductData.selectedProductTitle;

              productWrapper.classList.add('active');
          } else {
              
              productWrapper.setAttribute('data-bundle-builder-selected-product-id', '');
              
              productWrapperImage.src = '';
              productWrapperImage.alt = '';

              productWrapperType.innerHTML = '';
              productWrapperTitle.innerHTML = '';

              productWrapper.classList.remove('active');
              
          }
      });
    }

    function setActiveBundle(trigger) {
      //sets different bundle blocks active
      const bundleIndex = trigger.dataset.bundleIndex;
      const bundleWrapper = trigger.closest('.lsg-bundle-wrapper');
      const bundleBlocks = bundleWrapper.querySelectorAll('.lsg-bundle-block');
      const targetBundle = bundleWrapper.querySelector('[data-bundle-index="' + bundleIndex + '"].lsg-bundle-block');
      if(targetBundle) {
          bundleBlocks.forEach(function(bundleBlock){
              if(bundleBlock.dataset.bundleIndex != bundleIndex) {
                  bundleBlock.classList.remove('lsg-bundle-block-active');
              } else {
                  bundleBlock.classList.add('lsg-bundle-block-active');
              }
          });
      }
    }

    function incrementEnableValidation(trigger) {
      //trigger is input or increment buttons
      const productSetList = trigger.closest('.lsg-bundle-product-set-list');
      const quantityIncrementButtons = productSetList.querySelectorAll('.lsg-bundle-product-select-quantity-increment');
      const bundleQuantity = getBundleQuantityByChild(trigger);
      const bundleMax = productSetList.dataset.bundleMax;

      //increment button enable/disable
      quantityIncrementButtons.forEach(function(quantityIncrementButton){
          const inputWrap = quantityIncrementButton.closest('.lsg-bundle-product-select-quantity-wrap');
          const method = (quantityIncrementButton.classList.contains('lsg-bundle-product-select-quantity-minus') ? 'minus' : (quantityIncrementButton.classList.contains('lsg-bundle-product-select-quantity-plus') ? 'plus' : 'err'));
          const input = quantityIncrementButton.closest('.lsg-bundle-product-select-quantity-wrap').querySelector('.lsg-bundle-product-select-quantity-input');
          const quantity = input.value;
          switch(method) {
              case 'minus':
                  quantityIncrementButton.disabled = false;
                  if(quantity <= 0) {
                      quantityIncrementButton.disabled = true;
                  }
                  if(quantity <= parseInt(input.min)) {
                      quantityIncrementButton.disabled = true;
                  }
                  break;
              case 'plus':
                  const productType = quantityIncrementButton.closest('[data-lsg-bundle-product-type]').getAttribute('data-lsg-bundle-product-type');

                  quantityIncrementButton.disabled = false;
                  if(quantity >= parseInt(input.max)) {
                      quantityIncrementButton.disabled = true;
                  }
                  console.log('===============');
                  console.log('quantity increment bundle quantity: ', bundleQuantity);
                  if(parseInt(bundleMax) > 0) {
                      if(bundleQuantity >= parseInt(bundleMax)) {
                        console.log('bundle maxed!!');
                        quantityIncrementButton.disabled = true;
                        inputWrap.classList.add('product-maxed');
                      }
                  }
                  // Custom business logic - Disable dry product plus increment buttons if 2 fresh product minimum is not met
                  if(productType === 'dry' && bundleQuantity === 3 && freshProductTotal === 1) {
                      quantityIncrementButton.disabled = true;
                      inputWrap.classList.add('product-maxed');
                  }
                  if(productType === 'fresh' && bundleQuantity === 3 && freshProductTotal === 0) {
                      quantityIncrementButton.disabled = true;
                      inputWrap.classList.add('product-maxed');
                  }
                  break;
          }
      });
    }

    function checkoutEnableValidation(trigger) {
      const bundleBlock = getBundleBlock(trigger);
      const addToCartButtons = bundleBlock.querySelectorAll('.lsg-bundle-form button[type="submit"]');
      const bundleQuantity = getBundleQuantity(trigger);
      const bundleForm = bundleBlock.querySelector('.lsg-bundle-form');
      const interval = getBundleInterval(trigger);
      const bundleMin = (interval == 'otp' ? bundleBlock.dataset.otpBundleMin : bundleBlock.dataset.subBundleMin);
      const bundleMax = (interval == 'otp' ? bundleBlock.dataset.otpBundleMax : bundleBlock.dataset.subBundleMax);
      const quantityToAdd = bundleMax - bundleQuantity;

      //checkout button enable/disable
      addToCartButtons.forEach(function(addToCartButton){
          const addToCartText = addToCartButton.querySelector('[data-lsg-bundle-submit-button-atc-text]'); 
          const addMoreText = addToCartButton.querySelector('[data-lsg-bundle-submit-button-add-more-text]');
          const addMoreQuantity = addToCartButton.querySelector('[data-lsg-bundle-submit-button-add-more-quantity]');
          const addMoreType = addToCartButton.querySelector('[data-lsg-bundle-submit-button-add-more-type]');
          
          if(bundleQuantity >= bundleMin && (bundleQuantity <= bundleMax || bundleMax < bundleMin)) {
              addToCartButton.disabled = false;
              addToCartText.classList.remove('hidden');
              addMoreText.classList.add('hidden');
          } else {
              addToCartButton.disabled = true;
              // Custom business logic - Show 'Add 1 more fresh' text if 2 fresh product minimum is not met
              if(bundleQuantity === 3 && freshProductTotal === 1) {
                  addToCartText.classList.add('hidden');
                  addMoreText.classList.remove('hidden');
                  addMoreType.classList.remove('hidden');
                  addMoreQuantity.innerHTML = quantityToAdd;
              } else {
                  addToCartText.classList.add('hidden');
                  addMoreText.classList.remove('hidden');
                  addMoreType.classList.add('hidden');
                  addMoreQuantity.innerHTML = quantityToAdd;
              }
          }
      });
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
      {
          let cartItem = {
              id: bundleProductID,
              quantity: 1,
              properties: {
                "bundle_id": bundleID,
                "bundle_parent": true,
              },
          };
          if (interval == 'sub') {
              cartItem["selling_plan"] = bundleSellingPlan;
          }
          bundleCart.items.push(cartItem);
      }
      bundleProductListInputs.forEach(function(bundleProductInput){
          bundleProductQuantity = bundleProductQuantity + parseInt(bundleProductInput.value);
          if(parseInt(bundleProductInput.value) > 0) {
              let cartItem = {
                  id: bundleProductInput.dataset.product,
                  quantity: parseInt(bundleProductInput.value),
                  properties: {
                      "bundle_id": bundleID,
                  },
              };
              if (interval == 'sub') {
                  cartItem["selling_plan"] = bundleSellingPlan;
              }
              bundleCart.items.push(cartItem);
          }
      });
      if(bundleProductQuantity > bundleMax || bundleProductQuantity < bundleMin) {
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
          console.log('add to cart response: ', response);
          if(response.status == 200) {
              // window.location.href = "/cart";
              // setTimeout(() => slideCartOpen(), 1000)
              slideCartOpen();
              // renderCart();
          }
      }).catch((error) => {
          console.error(error);
      });
      //
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
      const frequencySelect = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select');

      switch(trigger.value) {
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
      if(selling_plan) {
          if(bundleBlock.classList.contains('lsg-bundle--sub-selected') || bundleBlock.classList.contains('lsg-bundle--only-sub')) {
              const frequencySelect = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select');
              if(frequencySelect) {
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
      if(isNaN(trigger.value) || trigger.value == ''){
          trigger.value = 0;
      }

      if(trigger.value > parseInt(trigger.max)) {
          trigger.value = parseInt(trigger.max);
      }

      if(trigger.value < 0) {
          trigger.value = 0;
      }

      if(trigger.value < parseInt(trigger.min)) {
          trigger.value = parseInt(trigger.min);
      }

      const bundleMax = trigger.closest('.lsg-bundle-product-set-list').dataset.bundleMax;
      const bundleQuantity = getBundleQuantity(trigger);

      if((bundleQuantity > bundleMax) && bundleMax > 0) {
          let bundleDif = bundleQuantity - bundleMax;
          if(trigger.value >= bundleDif) {
              //reduce quantity to stay within bundle max
              trigger.value = (trigger.value - bundleDif);
          } else {
              //something went wrong, reset all values to min
              trigger.closest('.lsg-bundle-product-set-list').querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function(input){
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

      switch(method) {
          case 'plus':
              if(input.value >= parseInt(input.max)) {
                  //reset to inventory max if over
                  input.value = parseInt(input.max);
              } else {
                  if((bundleQuantity < parseInt(bundleMax)) || parseInt(bundleMax) < 1) {
                      input.value++;
                  } else {
                      //at max bundle quantity, do not change
                  }
              }
              updateBundlePrice(trigger);
              break;
          case 'minus':
              if(input.value <= parseInt(input.min)) {
                  input.value = parseInt(input.min);
              } else if(input.value <= 0) {
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
      productInputs.forEach(function(productInput){
          if(productInput !== input) {
              productInput.value = quantity;
              inputChangeSubProduct(productInput);
          }
      });
    }

    function updateQuantityDisplay(input) {
      const inputWrap = input.closest('.lsg-bundle-product-select-quantity-wrap');
      $(inputWrap).removeClass('no-quantity');
      if (input.value <= 0) {
          $(inputWrap).addClass('no-quantity');
      }
      const inputDisplay = input.parentNode.querySelector('.lsg-bundle-product-select-quantity-input-display');
      if(inputDisplay) {
          inputDisplay.innerHTML = input.value;
      }
    }

    function updateBundlePrice(trigger) {
      //updates OTP/Sub pricing
      const bundleBlock = getBundleBlock(trigger);
      const otpPriceEls = bundleBlock.querySelectorAll('.lsg-bundle-interval-otp-price');
      const subPriceEls = bundleBlock.querySelectorAll('.lsg-bundle-interval-sub-price');
      const frequency = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select option:checked');
      const productList = bundleBlock.querySelector('.lsg-bundle-product-set-list');
      const hasIntervalSelect = bundleBlock.classList.contains('lsg-bundle--has-interval-select');
      let interval = ''
      if(bundleBlock.classList.contains('lsg-bundle--only-otp') || bundleBlock.classList.contains('lsg-bundle--otp-selected')) {
          interval = 'otp';
      } else if (bundleBlock.classList.contains('lsg-bundle--only-sub') || bundleBlock.classList.contains('lsg-bundle--sub-selected')) {
          interval = 'sub';
      }
      let otpSubtotal = 0;
      let subSubtotal = 0;

      if(productList && interval == 'otp') {
          productList.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function(otpProductInput){
              let quantity = parseInt(otpProductInput.value);
              let price = parseInt(otpProductInput.dataset.price);
              otpSubtotal = otpSubtotal + (quantity * price);
              if(productList && frequency && hasIntervalSelect) {
                  const discountType = frequency.dataset.discountType;
                  const discountValue = frequency.dataset.discountValue;
                  let discount = 0;
                  switch(discountType){
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

      if(productList && frequency && interval == 'sub') {
          const discountType = frequency.dataset.discountType;
          const discountValue = frequency.dataset.discountValue;
          productList.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function(subProductInput){
              let quantity = parseInt(subProductInput.value);
              let price = parseInt(subProductInput.dataset.price);
              let discount = 0;
              switch(discountType){
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
              subSubtotal = subSubtotal + (quantity * (Math.floor(price - discount)));

              if(productList && hasIntervalSelect) {
                  otpSubtotal = otpSubtotal + (quantity * price);
              }
          });
      }

      const currencyFormatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
      });
      otpPriceEls.forEach(function(el){
          el.innerHTML = currencyFormatter.format(otpSubtotal / 100);
      });
      subPriceEls.forEach(function(el){
          el.innerHTML = currencyFormatter.format(subSubtotal / 100);
      });
    }

    function initializeBundle() {
      //loop through bundle blocks
      document.querySelectorAll('.lsg-bundle-block').forEach(function(bundleBlock){
          //set bundle block classes and initial selling_plan input
          const intervalSelect = bundleBlock.querySelector('.lsg-bundle-interval-select');
          const onlyOTP = bundleBlock.querySelector('.lsg-bundle-interval-only-otp');
          const onlySub = bundleBlock.querySelector('.lsg-bundle-interval-only-sub');
          const sellingPlanInput = bundleBlock.querySelector('.lsg-bundle-form input[name="selling_plan"]');
          const frequencySelect = bundleBlock.querySelector('.lsg-bundle-interval-frequency-select');
          if(intervalSelect){
              //has otp/sub selector
              bundleBlock.classList.add('lsg-bundle--has-interval-select');
              let selectedInterval = intervalSelect.querySelector('input[name^="bundle_interval_select_"]:checked');
              switch(selectedInterval.value){
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
          bundleBlock.querySelectorAll('.lsg-bundle-product-set-list').forEach(function(productSetList){
              incrementEnableValidation(productSetList.querySelector('.lsg-bundle-product-select-quantity-input'));
          });
          checkoutEnableValidation(sellingPlanInput);
      });
    }

    function getBundleQuantity(trigger) {
      //gets the quantity of the current active bundle block product list
      let bundleBlock = getBundleBlock(trigger);
      let quantity = -1;
      let productList = bundleBlock.querySelector('.lsg-bundle-product-set-list');
      if(productList){
          quantity = 0;
          productList.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function(input){
              quantity = quantity + parseInt(input.value);
          });
      }
      return quantity;
    }

    function getBundleQuantityByChild(trigger){
      const productSetList = trigger.closest('.lsg-bundle-product-set-list');
      let quantity = -1;
      if(productSetList){
          quantity = 0;
          productSetList.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function(input){
              quantity = quantity + parseInt(input.value);
          });
      }
      return quantity;
    }

    function getBundleInterval(trigger) {
      //checks if the bundle is set to display OTP or suscription options
      let bundleBlock = getBundleBlock(trigger);
      if(bundleBlock.classList.contains('lsg-bundle--has-interval-select')) {
          if(bundleBlock.classList.contains('lsg-bundle--otp-selected')) {
              return 'otp';
          }
          if(bundleBlock.classList.contains('lsg-bundle--sub-selected')) {
              return 'sub';
          }
      }
      if(bundleBlock.classList.contains('lsg-bundle--only-otp')) {
          return 'otp';
      }
      if(bundleBlock.classList.contains('lsg-bundle--only-sub')) {
          return 'sub';
      }
      return 'err';
    }

    function getBundleBlock(trigger) {
      return trigger.closest('.lsg-bundle-block');
    }

    function getGuid() {
      let d = new Date().getTime();
      let d2 =  (performance && performance.now && (performance.now() * 1000)) || 0;
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          let r = Math.random() * 16;
          if (d > 0) {
              r = (d + r) % 16 | 0;
              d = Math.floor(d / 16);
          } else {
              r = (d2 + r) % 16 | 0;
              d2 = Math.floor(d2 / 16);
          }
          return (c == 'x' ? r: (r & 0x7 | 0x8)).toString(16);
      });
    }

    //Run initialize
    initializeBundle();

    $('[data-lsg-bundle-wrapper]').appendTo('[data-bundle-selector-wrap-main]');

    buildStickyUI();

    //Event Listeners
    document.querySelectorAll('.lsg-bundle-product-select-quantity-increment').forEach(function(incrementButton){
      incrementButton.addEventListener('click', function(e){
          e.preventDefault();
          incrementSubProduct(e.currentTarget);
          buildSelectedProductArray(e.currentTarget);
          incrementEnableValidation(e.currentTarget);
          checkoutEnableValidation(e.currentTarget);
          buildStickyUI();
      })
    });
    
    document.querySelectorAll('.lsg-bundle-product-select-quantity-input').forEach(function(input){
      input.addEventListener('change', function(e){
          inputChangeSubProduct(e.currentTarget);
          incrementEnableValidation(e.currentTarget);
          checkoutEnableValidation(e.currentTarget);
          buildStickyUI();
      })
    });

    document.querySelectorAll('.lsg-bundle-interval-select input[name^="bundle_interval_select_"]').forEach(function(intervalSelector){
      intervalSelector.addEventListener('change', function(e){
          updateInterval(e.currentTarget);
          checkoutEnableValidation(e.currentTarget);
          buildStickyUI();
      });
    });

    document.querySelectorAll('.lsg-bundle-interval-frequency-select').forEach(function(frequencySelect){
      frequencySelect.addEventListener('change', function(e){
          updateFrequency(e.currentTarget);
          buildStickyUI();
      })
    });

    document.querySelectorAll('.lsg-bundle-form').forEach(function(bundleForm){
      bundleForm.addEventListener('submit', function(e){
          e.preventDefault();
          addToCart(e.currentTarget);
      });
    });

    document.querySelectorAll('.lsg-bundle-size-select-el').forEach(function(bundleSelector){
      bundleSelector.addEventListener('click', function(e){
          e.preventDefault();
          setActiveBundle(e.currentTarget);
      });
    });

    document.querySelectorAll('[data-bundle-builder-selected-product-remove-button]').forEach(function(removeButton){
      removeButton.addEventListener('click', function(e){
          e.preventDefault();
          const triggeredProductWrapper = e.target.closest('[data-bundle-builder-selected-product-id]');
          productSelectionButtonClicked = true;
          productSelectionIndex = triggeredProductWrapper.getAttribute('data-index');
          const productID = triggeredProductWrapper.getAttribute('data-bundle-builder-selected-product-id');
          const bundleProduct = document.querySelector(`[data-lsg-bundle-product-select-id='${productID}']`);
          const bundleProductDecrement = bundleProduct.querySelector('.lsg-bundle-product-select-quantity-minus');
          bundleProductDecrement.click();
      })
    });
};

$(document).ready(function() {
  if ($('[data-lsg-bundle-wrapper]').length) {
    bundleBuilderInit();
  }
});

// ========================================================================================
// ========================================================================================
// Slide Cart
// ========================================================================================
// ========================================================================================

// ======================
// UI Actions
// ======================

// Slide cart open/close
$(document).on('click', '[data-slidecart-trigger]', slideCartOpen);
$(document).on('click', '[data-close-slidecart], [slidecart-overlay]', slideCartClose);

const bindSlideCartUIActions = () => {
  
  // Update item quantity
  $(document).off().on('click', `[data-qty-button]`, (event) => {
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

    const bundleChildKeys = $(event.target).closest('[data-bundle-child-keys]').attr('data-bundle-child-keys');
    const bundleChildQuantities = $(event.target).closest('[data-bundle-child-keys]').attr('data-bundle-child-quantities');

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
        let newChildQty;

        if ($(event.target).hasClass('js-plus-button')) {
          newChildQty = (currentChildQty / currentQty) * newQty;
        } else {
          newChildQty = (currentChildQty / currentQty) * newQty;
          if (newChildQty < 0) newChildQty = 0;
        }

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
    }
    else {
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
  });
  
  // Remove item
  $(`span.removeItem`).click(function () {
    var key = $(this).attr('data-remove-key');
    var data = {
      "id": key,
      "quantity": 0
    };
    $.ajax({
      type: 'POST',
      url: '/cart/change.js',
      data: data,
      dataType: 'json',
      success: function () {
        renderCart();
      }
    });
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

  // Submit discount code
  $(document).on('submit', $('[data-cart-discount-form-input]'), onDiscountFormSubmit);
  
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
};

// ======================
// Dynamic product list height
// ======================

const setProductListHeight = () => {
  const headerFooterHeight =  $('.slidecart-title-wrapper').outerHeight(true) + $('.slidecart-bottom-wrapper').outerHeight();
  $('.slidecart-inner').css('height', `calc(100vh - ${headerFooterHeight}px)`)
}

// ======================
// Discount Code
// ======================

const onDiscountFormSubmit = (e) => {
  e.preventDefault();
  const value = $('[data-cart-discount-form-input]')[0].value;
  if (value.length === 0) return
  // Append discount code to checkout link URL.
  $('[data-cart-checkout-link]')[0].href = `/checkout?discount=${value}`;
  // Surface that discount will be applied at checkout.
  $('[data-cart-discount-info]').addClass('active');
  // Clear input.
  $('[data-cart-discount-form-input]')[0].value = '';
}

// ======================
// Subscribe
// ======================

// IMPORTANT - WIP - This needs to be re-worked, currently has a bug when subsctription is toggled and other items are in the cart

// Update slide cart item subscription
const updateItemSubscription = (event) => {
  console.log('///////////////////////');
  console.log('///////////////////////');

  let key,
      qty,
      plan,
      oldPlan,
      id,
      additionDataArray = {},
      removalData= {
        updates: {}
      };


  if ($(event.target).is('[data-cart-toggle-subscribe]')) {
    console.log('clicked [data-cart-toggle-subscribe]');
    key = $(event.target).attr('key');
    id = parseInt($(event.target).attr('product_id'));  
    qty = parseInt($(event.target).attr('qty'));
    plan = parseInt($(event.target).attr('plan_id'));
  }
  if ($(event.target).is('[data-subscribe-select]')) {
    console.log('clicked [data-subscribe-select]');
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
    console.log('=====BUNDLE=====');
    const childKeysArray = bundleChildKeys.split(',');
    const childQuantitiesArray = bundleChildQuantities.split(',');

    let product_data = childKeysArray.map((childKey, i) => {
      const childIsBundleParent = childKey === bundleParentKey ? true : false;
      const currentChildQty = parseInt(childQuantitiesArray[i]);
      const childID = parseInt(childKey.split(':')[0]);

      removalData['updates'][childKey] = 0;
      
      if (isOTP) {
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxx');
        console.log('is OTP!!');
        return {
          quantity: currentChildQty, 
          id: childID, 
          properties: {
            bundle_id: bundleID,
            bundle_parent: childIsBundleParent
          }
        }
      } else {
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxx');
        console.log('is subscription!!');
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
    console.log('=====SINGLE FLAVOR=====');

    removalData['updates'][key] = 0;

    if (isOTP) {
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxx');
      console.log('is OTP!!');
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
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxx');
      console.log('is subscription!!');
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

  

  const reAddToCart = ()=> {

    fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(additionDataArray)
    }).then((response) => {
      /* products were added */

      console.log('++++++++++++++++++++');
      if (isBundleParent === true) {
        console.log('cart item is a bundle parent');
        renderCart();
      } else {
        console.log('cart item is NOT a bundle parent');
        // Add item if not added - edge case where added product gets deleted
        // ajax get cart
        $.ajax({
          type: 'GET',
          url: '/cart.js',
          dataType: 'json',
          success: (cart) => {
            // check cart for product key,
            let productExists = false;
            console.log('Items in cart::::');
            cart.items.forEach((item) => {
              const itemBundleID = (item.properties !== null) ? ((item.properties.bundle_id !== undefined) ? item.properties.bundle_id : false) : false;
              console.log(item.title + ' - ' + item.id + ' - ' + itemBundleID);
              if (itemBundleID == false && item.id === id) {
                productExists = true;
              }
            })

            console.log('==================');
            console.log('productExists: ' + productExists);
            // if key doesn't exist add product again
            if (productExists === false) { 
              console.log('trying again...');
              reAddToCart();
            } else {
              console.log('item succesfully added!');
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
      //magic number timeout for subscription toggle bug
      setTimeout(function(){
          reAddToCart();
      }, 750);
    }
  });
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++
// CLEAR CART - temporary for dev
const clearCart = () => {
  $.ajax({
    type: "POST",
    url: '/cart/clear.js',
    data: '',
    dataType: 'json',
    success: function() {
      Shopify.clear();
    },
    error: function(XMLHttpRequest, textStatus) {
      /* error code */
    }
  });
}
// clearCart();
// ++++++++++++++++++++++++++++++++++++++++++++++++++

function slideCartOpen() {
  $(`#slidecart-wrapper`).addClass('active');
  $(`[slidecart-overlay]`).addClass('active');
  $('html, body').css('overflow-y', 'hidden');
  renderCart();
}

function slideCartClose() {
  $(`#slidecart-wrapper`).removeClass('active');
  $('html, body').css('overflow-y', 'scroll');
  $(`[slidecart-overlay]`).removeClass('active');
}

function clearCartDrawer() {
  $(`[slidecart-product-wrapper], [slidecart-product-wrapper], [slidecart-upsell-wrapper]`).html('');
}

// Obfuscates cart items - Combine duplicates items & hide child subsciption items
const obscureCartData = (cart) => {

  let obscuredCartData = []

  cart.items.forEach((item) => {
    
    const itemPrice = parseFloat(item.line_price / 100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1").toString();
    // console.log(item.properties);

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

    $.getJSON('/products/' + item.handle + '.js', function(prod) {
      itemTags = prod.tags;
    })
    
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
  
          // console.log('-----------------');
          // console.log(comparedItem.isBundleParent);
          // console.log(comparedItemBundleID);
          // console.log(mainItemBundleID);
           
          if (comparedItem.isBundleParent === false && comparedItemBundleID === mainItemBundleID) {
            // console.log(comparedItem.itemTitle + ': ' + comparedItemPrice);
            // const keyAndQuantity = {
            //   key: comparedItem.itemKey,
            //   quantity: comparedItem.itemQuantity,
            // }
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
        })

        mainItem.bundleChildKeys = bundleChildKeys;
        mainItem.bundleChildQuantities = bundleChildQuantities;
        mainItem.bundleItemList = (bundleItemList != '' ? '<ul class="cart-item-bundle-items">' + bundleItemList + '</ul>' : '');
      }
    }
  });

  obscuredCartData = obscuredCartData.filter((item, index) => {
    return removalIndexes.indexOf(index) == -1;
  })

  return obscuredCartData;
};

const initQuantityElements = ()=> {
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
  })
}

const updateQuantityElements = (data)=> {
  const obscuredCartData = data;
  let cartQty = 0;
  obscuredCartData.forEach((item, index) => {
    if (item.isBundleChild) return;
    cartQty = cartQty + item.itemQuantity;
  });
  $('[data-cart-slider-total-quantity]').html(`(${cartQty})`);
  $('[data-lsg-cart-count]').html(cartQty);
}

function renderCart() {
    console.log('=========================');
    console.log('renderItems');
    $.ajax({
      type: 'GET',
      url: '/cart.js',
      dataType: 'json',
      success: function (cart) {
        console.log('render cart: ', cart);
        clearCartDrawer();

        // // Cart shipping bar - saved in case of future implementation
        // const freeShipping = $(`[slidecart-shipping-bar]`).attr('free-shipping-minimum');
        // var amountToShipping = (parseInt(freeShipping) - parseFloat(cart.items_subtotal_price / 100).toFixed(2)).toFixed(2);

        // if (amountToShipping <= 0) {
        //   $('[slidecart-shipping-bar][amountaway]').show();
        //   $(`[shipping-label]`).html('');
        //   $(`[shipping-label]`).html('You get Free Shipping!');
        //   $(`[shipping-bar-percent]`).css('max-width', '100%');
        // }
        // else if (parseInt(amountToShipping) == parseInt(freeShipping)) {
        //   $('[slidecart-product-wrapper]').html('Your cart is empty');
        //   $('[slidecart-shipping-bar], [amountaway]').hide();
        // }
        // else {
        //   $('[slidecart-shipping-bar], [amountaway]').show();
        //   var spendMore = `Spend <span class="slidecart-shipping-price">$${amountToShipping}</span> more to get free shipping`;
        //   var amountAway = `You are <span class="slidecart-shipping-price">$${amountToShipping}</span> away from free shipping`;
        //   var shippingOver = `Free shipping over <span class="slidecart-shipping-price">$${freeShipping}</span>`;
        //   $(`[shipping-label]`).html('');
        //   $(`[spendMore]`).html(spendMore);
        //   $(`[amountAway]`).html(amountAway);
        //   $(`[shippingOver]`).html(shippingOver);
        //   var maxWidth = (parseFloat(cart.items_subtotal_price / 100).toFixed(1) / parseInt(freeShipping)) * 100;
        //   $(`[shipping-bar-percent]`).css('max-width', maxWidth + '%');
        // }

        // Obscure cart data
        
        const obscuredCartData = obscureCartData(cart);

        // Update quantity elements
        updateQuantityElements(obscuredCartData);
        
        // Update subtotal
        const cartSubtotal = `<p>$${parseFloat(cart.items_subtotal_price / 100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1").toString()}</p>`;
        const cartSubtotalInfo = `<h2>Subtotal</h2> ${cartSubtotal}`;
        $(`[cart-subtotal]`).html(cartSubtotalInfo);

        /////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////
        // Render cart items

        obscuredCartData.forEach((item, index) => {
          const productTitle = `<h2>${item.itemTitle}</h2>`;
          const productHandle = item.itemHandle;
          const productId = item.itemID;
          const productImage = `<img src="${item.itemImage}" >`;
          const productPrice = `<p>${item.itemPrice}</p>`;
          const productQuantity = item.itemQuantity;
          const productGrams = item.itemGrams;
          const productUrl = item.itemUrl;
          const productKey = item.itemKey;
          const productPlanAllocation = item.itemSellingPlanAllocation;
          // const productPlanId = item.itemPlanId;
          // const productPlanType = item.itemPlanType;
          const productBundleID = item.itemBundleID;
          const isBundleChild = item.isBundleChild;
          const isBundleParent = item.isBundleParent;
          const bundleChildKeys = item.bundleChildKeys;
          const bundleChildQuantities = item.bundleChildQuantities;
          const bundleItemList = item.bundleItemList;
          const bundleParentKey = item.bundleParentKey;
          let productTags = item.itemTags;
          
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
          }).success((product) => {
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
                percentOff = sellingPlanGroup.substring( sellingPlanGroup.indexOf('(') + 1, sellingPlanGroup.lastIndexOf(')') );
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

          const factor = 0.00220462;
          let grams = productGrams;
          let packagingType = 'bags';
          let foodType = false;

          if(productTags.includes('type=fresh')) {
            foodType = 'fresh food';
            packagingType = 'bags';
          } else if(productTags.includes('type=dry')) {
            foodType = 'dry food';
            packagingType = 'boxes';
          }
          const productWeight = Math.round(grams * factor);

          console.log('food type: ', foodType);
          console.log('packaging type: ', packagingType);
          console.log('grams: ', grams);
          console.log('product weight: ', productWeight);

          // Pack Size
          if (productHandle.includes('sampler') || productHandle.includes('combo')) productPackSize = 4;
          else productPackSize = 2;
          
          const foodTypeEl = foodType ? `<span class="slidecart-item-food-type">${foodType}</span>` : '';
          const productWeightText = productWeight ? ` (${productWeight}LB each)` : '';
          const packSizeEl = `<span class="slidecart-item-pack-size">${productPackSize} ${packagingType}${productWeightText}</span>`;
          
          function renderItem() {
            if(planIdLoaded === false) window.setTimeout(renderItem, 100);
            else {
              let concatSellingPlanOptions = '';
              if (sellingPlans) {
                sellingPlans.forEach(plan => {
                  let sellingPlanSelectAttr;
                  if (plan.id === sellingPlanId) sellingPlanSelectAttr = 'selected'
                  concatSellingPlanOptions =  `
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
                <select name="selling_plan" class="cart_item_selling_plan  ${subscribeDropdownClass}" data-subscribe-select>
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
              <div  class="slidecart-item-wrapper" 
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
                      ${foodTypeEl}
                      <a class="slidecart-item-title" href="${productUrl}">${productTitle}</a>
                      ${bundleItemList}
                      <span class="slidecart-item-purchase-frequency ${toggleButtonClass}">${planType}</span>
                      ${concatSubscribeDropdown}
                      ${packSizeEl}
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
                    Subscribe to save ${percentOff} now and on future deliveries.
                  </button>
                </div>
              </div>`;

              $(`[slidecart-product-wrapper]`).html($(`[slidecart-product-wrapper]`).html() + concatProductInfo);
            }
          }
          if (isBundleChild) return;
          renderItem();
        });
        bindSlideCartUIActions();
      },
      complete: () => {
        renderUpsells();
      }
    });
}

function renderUpsells() {
  $.ajax({
    type: 'GET',
    url: '/cart/?view=upselljson',
    dataType: 'html',
    success: function (data) {
      $(`[slidecart-upsell-wrapper]`).empty();
      $(`[slidecart-upsell-wrapper]`).html(data);
      setTimeout(renderUpsellSlider(), 50);
    }
  });
}

function renderUpsellSlider() {
  $('[slidecart-upsell-wrapper].slick-initialized').slick('unslick');
  if ($('[slidecart-upsell-wrapper] .slidecart-upsell').length > 1) {
    $('[slidecart-upsell-wrapper]').slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      mobileFirst: true,
      arrows: true,
      adaptiveHeight: true,
      prevArrow:'<button type="button" class="slick-prev slick-arrow"><svg class="icon icon-prev icon--full-color" viewBox="0 0 21 21"><path fill="#fff" d="M15.3,20.7c-0.3,0-0.5-0.1-0.7-0.3l-9.9-9.9l9.9-9.9c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-8.5,8.5L16,19 c0.4,0.4,0.4,1,0,1.4C15.8,20.6,15.6,20.7,15.3,20.7z"></path></svg></button>',
      nextArrow:'<button type="button" class="slick-next slick-arrow"><svg class="icon icon-next icon--full-color" viewBox="0 0 21 21"><path fill="#fff" d="M5.7,0.3c0.3,0,0.5,0.1,0.7,0.3l9.9,9.9l-9.9,9.9c-0.4,0.4-1,0.4-1.4,0s-0.4-1,0-1.4l8.5-8.5L5,2 C4.6,1.6,4.6,1,5,0.6C5.2,0.4,5.4,0.3,5.7,0.3z"></path></svg></button>',
      dots: false
    })
  }
  setProductListHeight();
}

function renderSlider(index) {
  // Flickity.setJQuery($);
  // jQueryBridget('flickity', Flickity, $);
  // destroySlider();
  // var $nav = $(`[buy-box-index=${index}] .bb-testimonials`).flickity({
  //   asNavFor: '.bb-gallery-slider',
  //   draggable: false,
  //   percentPosition: false,
  //   groupCells: "100%",
  //   pageDots: false
  // });
  // var $carousel = $(`[buy-box-index=${index}] .bb-gallery-slider`).flickity({
  //   pageDots: false,
  //   contain: true,
  //   wrapAround: false,
  //   prevNextButtons: false
  // });
  // $(`[testimonial-wrapper]`).on('click', function () {
  //   var index = $(this).attr('data-btn-index');
  //   $carousel.flickity('select', index);
  // });
  // $carousel.flickity('resize');
}

function rebuildCurrentSlider() {
  // var index = $(`[bb-gallery-slider].flickity-enabled`).attr('data-index');
  // destroySlider();
  // setTimeout(renderSlider(index), 50);
}

function destroySlider() {
  // Flickity.setJQuery($);
  // jQueryBridget('flickity', Flickity, $);
  // var navSlider = $(`[bb-testimonials].flickity-enabled`);
  // var currSlider = $(`[bb-gallery-slider].flickity-enabled`);
  // currSlider.flickity('destroy');
  // navSlider.flickity('destroy');
}

$(window).resize(function () {
  rebuildCurrentSlider();
});

// Auto-open if redirected from cart page
if (window.location.href.indexOf('?cart-opened') > -1) {
  slideCartOpen();
}

// ========================================================================================
// ========================================================================================
// Buy Box
// ========================================================================================
// ========================================================================================

function setUrlParameter(productId) {
  window.history.pushState('', '', `?product=${productId}`);
}

function setActiveProduct() {
  if ($(`body`).hasClass('template-index')) {
    var urlParams = new URLSearchParams(window.location.search);
    var urlId = urlParams.get('product');
    if (urlId) {
      var index = $(`[buy-box-wrapper][buy-box-product-id=${urlId}]`).attr('buy-box-index');
      setUrlParameter(urlId);
      $(`[buy-box-wrapper], [flavor-selector-item]`).removeClass('active');
      $(`[buy-box-wrapper][buy-box-product-id=${urlId}], [flavor-selector-item][buy-box-flavor=${urlId}]`).addClass('active');
      setTimeout(renderSlider(index), 100);
    }
    else {
      $(`[buy-box-wrapper]`).removeClass('active');
      $(`[buy-box-index=0]`).addClass('active');
      var prId = $(`[buy-box-index=0]`).attr('buy-box-product-id');
      setUrlParameter(prId);
      setTimeout(renderSlider(0), 50);
    }
  }
}

$(`[flavor-selector-item]`).click(function () {
  $(`[flavor-selector-item].active, [buy-box-wrapper]`).removeClass('active');
  $(this).addClass('active');
  var index = $(this).attr('data-index');
  var productID = $(this).attr('buy-box-flavor');
  $(`[buy-box-wrapper][buy-box-product-id=${productID}]`).addClass('active');
  $(`div[buy-box-flavor=${productID}]`).addClass('active');
  setUrlParameter(productID);
  setTimeout(renderSlider(index), 50);
});

$(`[variant-selector-item]`).click(function () {
  var id = $(this).attr('buy-box-variant');
  var prId = $(this).attr('buy-box-var-product-id');
  $(`div[buy-box-product-id=${prId}] [variant-selector-item].active`).removeClass('active');
  $(`div[buy-box-product-id=${prId}] [variant-selector-price].active`).removeClass('active');
  $(`div[buy-box-product-id=${prId}] [quantity-input-wrapper]`).removeClass('active');
  $(`div[buy-box-product-id=${prId}] [variant-underbutton-text]`).removeClass('active');
  $(`[quantity-input-wrapper][bb-qty-for-variant=${id}]`).addClass('active');
  $(`[variant-selector-price][buy-box-variant=${id}]`).addClass('active');
  $(`[variant-underbutton-text][data-variant-underbutton-id=${id}]`).addClass('active');
  $(this).addClass('active');
});

$(`[product-quantity]`).click(function () {
  var varID = $(this).attr('bb-variant-id');
  var currentValue = parseInt($(`input#bb-qty-${varID}`).attr('value'));
  var newValue;
  var maxValue = parseInt($(`input#bb-qty-${varID}`).attr('max'));
  if ($(this).hasClass('bb-product-quantity-minus')) {
    if (currentValue > 0) {
      newValue = currentValue - 1;
    }
    else {
      newValue = currentValue;
    }
    $(`input#bb-qty-${varID}`).attr('value', newValue);
  }
  else if ($(this).hasClass('bb-product-quantity-plus')) {
    if (currentValue < maxValue) {
      newValue = currentValue + 1;
    }
    else if (currentValue >= maxValue) {
      newValue = currentValue;
    }
    $(`input#bb-qty-${varID}`).attr('value', newValue);
  }
});

$(document).on('click', '[data-add-to-cart]', () => {
  setTimeout(() => slideCartOpen(), 1000)
});

$(`button[add-to-cart-button]`).click(function () {
  var productId = $(this).attr('add-to-cart-id');
  var variantId = $(`[buy-box-product-id=${productId}] [variant-selector-item].active`).attr('buy-box-variant');
  var quantity = $(`[buy-box-product-id=${productId}] [quantity-input-wrapper].active input`).attr('value');
  var data = {
    "id": variantId,
    "quantity": quantity,
  };
  $.ajax({
    type: 'POST',
    url: '/cart/add.js',
    data: data,
    dataType: 'json',
    success: function () {
      slideCartOpen();
    }
  });
});

$(document).ready(() => {
  setActiveProduct();
  initQuantityElements();
});