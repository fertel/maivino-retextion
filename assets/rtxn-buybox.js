(() => {
  const IS_ACTIVE_CLASSNAME = 'is-active'
  const PURCHASE_TYPE = {
    ONE_TIME: 'one-time',
    SUBCRIPTION: 'subscription'
  }
  // DOM element selectors
  const SELECTORS = {
    PRODUCT_CONTAINER: '.js-product-container',
    BUYBOX_FORM: '[data-product-form]',
    PURCHASE_TYPE_SELECTOR: '.js-rtx-option-selector',
    PURCHASE_TYPE_INPUT: '.js-select-purchase-type',
    SUBSCRIPTION_PLANS: '.js-rtxn-option-plans',
    MAIN_SUBSCRIPTION_PLANS_SELECT: '.js-rtxn-main-subscription-plans',
    BAG_SIZE_BUTTON: '.js-product-bag-size',
    SUBSCRIPTION_COMPARE_AT_PRICE: '.js-atc-sub-compare-at-price',
    SUBSCRIPTION_PRICE: '.js-atc-sub-price',
    ONE_TIME_PRICE: '.js-atc-onetime-price'
  }
  // Stores DOM node references
  const refs = {
    getListItemByIndex: (index) => document.querySelector(`.bundleitem${index}`),
    getProductContainerById: (productId) => document.querySelector(`${SELECTORS.PRODUCT_CONTAINER}[data-product-id="${productId}"]`),
    getBuyboxFormById: (productId) => document.querySelector(`${SELECTORS.BUYBOX_FORM}[data-productid="${productId}"]`),
    purchaseTypeSelectors: document.querySelectorAll(SELECTORS.PURCHASE_TYPE_SELECTOR),
    purchaseTypeInputs: document.querySelectorAll(SELECTORS.PURCHASE_TYPE_INPUT),
    bagSizeButtons: document.querySelectorAll(SELECTORS.BAG_SIZE_BUTTON),
    mainSubscriptionSelectEls: document.querySelectorAll(SELECTORS.MAIN_SUBSCRIPTION_PLANS_SELECT),
    buyboxFormEls: document.querySelectorAll(SELECTORS.BUYBOX_FORM)
  }
  // State
  const state = {
    productSellingPlans: window.rtxn
  }
  // Helper functions
  const helpers = {
    getSellingPlansByProductId: (productId) => state.productSellingPlans[productId] || null,
    getSelectedSubscriptionPlanData: (containerEl) => {
      const subscriptionPlansSelectEl = containerEl.querySelector(SELECTORS.MAIN_SUBSCRIPTION_PLANS_SELECT)
      const selectedSubscriptionPlansSelectOptionEl = subscriptionPlansSelectEl.options[subscriptionPlansSelectEl.selectedIndex]
      return {
        variantId: selectedSubscriptionPlansSelectOptionEl.dataset.variantId,
        groupId: subscriptionPlansSelectEl.dataset.groupId,
        sellingPlanId: selectedSubscriptionPlansSelectOptionEl.value
      }
    },
    getSelectedSellingPlan: (productId, containerEl) => {
      const sellingPlans = helpers.getSellingPlansByProductId(productId)
      const { variantId, sellingPlanId } = helpers.getSelectedSubscriptionPlanData(containerEl)
      return sellingPlans[variantId] ? sellingPlans[variantId].find((plan) => plan.sellingPlanId == sellingPlanId) : null
    },
    setPriceElementStates: (productId, containerEl) => {
      // Get active purchase type
      const activePlanEl = containerEl.querySelector(`${SELECTORS.PURCHASE_TYPE_SELECTOR}.${IS_ACTIVE_CLASSNAME}`)
      const purchaseType = activePlanEl && activePlanEl.dataset.purchaseType === PURCHASE_TYPE.ONE_TIME
        ? PURCHASE_TYPE.ONE_TIME
        : PURCHASE_TYPE.SUBCRIPTION
      // Get active main subscription plan select option value
      const selectedSellingPlan = helpers.getSelectedSellingPlan(productId, containerEl)
      // Toggle one-time price(s) visibility
      containerEl
        .querySelectorAll(SELECTORS.ONE_TIME_PRICE)
        .forEach((priceEl) => purchaseType === PURCHASE_TYPE.ONE_TIME
          ? priceEl.classList.add(IS_ACTIVE_CLASSNAME)
          : priceEl.classList.remove(IS_ACTIVE_CLASSNAME)
        )
      // Toggle subscription price(s) visibility
      containerEl
        .querySelectorAll(SELECTORS.SUBSCRIPTION_PRICE)
        .forEach((priceEl) => {
          if (purchaseType === PURCHASE_TYPE.SUBCRIPTION) {
            if (selectedSellingPlan) priceEl.innerText = selectedSellingPlan.priceFormatted
            priceEl.classList.add(IS_ACTIVE_CLASSNAME)
          }
          else {
            priceEl.classList.remove(IS_ACTIVE_CLASSNAME)
          }
        })
      // Toggle subscription compare at price(s) visibility
      containerEl
        .querySelectorAll(SELECTORS.SUBSCRIPTION_COMPARE_AT_PRICE)
        .forEach((priceEl) => {
          if (purchaseType === PURCHASE_TYPE.SUBCRIPTION) {
            priceEl.classList.add(IS_ACTIVE_CLASSNAME)
          }
          else {
            priceEl.classList.remove(IS_ACTIVE_CLASSNAME)
          }
        })
    }
  }
  // Handles actions
  const actions = {
    onBagSizeChange: (e) => {
      const el = e.target
      const { productId, listIndex } = el.dataset
      const bagSizeType = el.innerText.trim()
      const listItemEl = refs.getListItemByIndex(listIndex)
      // Toggle active states of bag size buttons
      listItemEl
        .querySelectorAll(SELECTORS.BAG_SIZE_BUTTON)
        .forEach((bagSizeEl) => {
          if (bagSizeEl.innerText.trim() === bagSizeType)
            bagSizeEl.classList.add(IS_ACTIVE_CLASSNAME)
          else
            bagSizeEl.classList.remove(IS_ACTIVE_CLASSNAME)
        })
      // Toggles the visibility of prices and sets active subscription selected plan price
      helpers.setPriceElementStates(productId, listItemEl)
    },

    onPurchaseTypeChange: (e) => {
      e.preventDefault()
      const el = e.target
      const parentEl = el.parentNode
      const { productId, purchaseType } = el.dataset
      const buyboxFormEl = refs.getBuyboxFormById(productId)
      const { listIndex } = buyboxFormEl.dataset
      const listItemEl = refs.getListItemByIndex(listIndex)
      // Clear all active type selectors of product buybox
      listItemEl
        .querySelectorAll(SELECTORS.PURCHASE_TYPE_SELECTOR)
        .forEach((selectorEl) => selectorEl.classList.remove(IS_ACTIVE_CLASSNAME))
      // Set active type selector of product buybox
      parentEl.classList.add(IS_ACTIVE_CLASSNAME)
      // Toggle subscription plans active
      const plansEl = listItemEl.querySelector(SELECTORS.SUBSCRIPTION_PLANS)
      if (plansEl && purchaseType === PURCHASE_TYPE.ONE_TIME) {
        plansEl.classList.remove(IS_ACTIVE_CLASSNAME)
      } else if (plansEl && !(purchaseType === PURCHASE_TYPE.ONE_TIME)) {
        plansEl.classList.add(IS_ACTIVE_CLASSNAME)
      }
      // Toggles the visibility of prices and sets active subscription selected plan price
      helpers.setPriceElementStates(productId, listItemEl)
    },

    onMainSubscriptionSelectChange: (e) => {
      const el = e.target
      const { productId } = el.dataset
      const buyboxFormEl = refs.getBuyboxFormById(productId)
      // Toggles the visibility of prices and sets active subscription selected plan price
      helpers.setPriceElementStates(productId, buyboxFormEl)
    },

    onBuyboxFormSubmit: (e) => {
      e.preventDefault()
      const el = e.target
      const data = new FormData(el)
      const value = Object.fromEntries(data.entries())
      let addToCartData = {
        quantity: value.quantity,
        id: el.dataset.variantId
      }
      const activePurchaseTypeEl = el.querySelector(
        `${SELECTORS.PURCHASE_TYPE_SELECTOR}.${IS_ACTIVE_CLASSNAME}`
      )
      console.log('activePurchaseTypeEl: ', activePurchaseTypeEl)
      if (activePurchaseTypeEl) {
        const isSubscriptionPurchaseType = activePurchaseTypeEl.dataset.purchaseType === PURCHASE_TYPE.SUBCRIPTION
        if (isSubscriptionPurchaseType) {
          const subscriptionPlanData = helpers.getSelectedSubscriptionPlanData(el)
          addToCartData = {
            ...addToCartData,
            id: subscriptionPlanData.variantId,
            selling_plan: subscriptionPlanData.sellingPlanId,
          }
        }
        else {
          const { variantId } = activePurchaseTypeEl.querySelector(SELECTORS.PURCHASE_TYPE_INPUT).dataset
          addToCartData = {
            ...addToCartData,
            id: variantId
          }
        }
      }
      fetch('/cart/add.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addToCartData)
      })
        .then(response => response.json())
        .then(data => {
          console.log('data: ', data)
          window.location.href = '/cart'
        })
    }
  }

  // Add event listeners
  refs.purchaseTypeInputs.forEach((el) => el.addEventListener('click', actions.onPurchaseTypeChange))
  refs.bagSizeButtons.forEach((el) => el.addEventListener('click', actions.onBagSizeChange))
  refs.mainSubscriptionSelectEls.forEach((el) => el.addEventListener('change', actions.onMainSubscriptionSelectChange))
  refs.buyboxFormEls.forEach((el) => el.addEventListener('submit', actions.onBuyboxFormSubmit))
})()