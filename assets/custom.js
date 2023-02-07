(() => {
    const parseCookies = () => {

        return document.cookie.split(";").map((s) => s.split("=")).reduce((acc, v) => {
            const key = decodeURIComponent(v[0]);
            const value = decodeURIComponent(v[1]);
            acc[key.trim()] = value;
            return acc
        }, {})
    }
    const initHideOptions = () => {
        const jsElem = document.querySelector('product-variants [type="application/json"]')
        if (jsElem) {
            const variants = JSON.parse(jsElem.textContent)
            let validOptions = {};
            const variantsObj = document.querySelector('product-variants');
            if (variants[0].option2) {
                variants.forEach(function (variant) {
                    let optArr = validOptions[variant.option1] || [];
                    optArr.push(variant.option2);
                    validOptions[variant.option1] = optArr
                });
                var showHideInvalidOptions = (variant) => {
                    // get selected option 1

                    const selected = document.querySelector(".product-variants--radio .product-variant:first-child :checked").value
                    const typeElems = document.querySelectorAll(".product-variants--radio .product-variant:nth-child(2) .product-variant__item")
                    typeElems.forEach((n) => {
                        const currentType = n.querySelector("[type=radio]").value


                        if (validOptions[selected].indexOf(currentType) > -1) {
                            n.classList.remove("hidden")
                        }
                        else {
                            n.classList.add("hidden")
                        }
                    })
                    if (!variant) {
                        const radio = document.querySelector(".product-variants--radio .product-variant:nth-child(2) .product-variant__item:not(.hidden) [type=radio]")
                        radio.click()
                        //hack will fire event a second time
                        setTimeout(() => variantsObj.onVariantChange(), 1)
                    }
                }
                variantsObj.addEventListener('VARIANT_CHANGE',
                    (e) => showHideInvalidOptions(e.target.currentVariant));
                showHideInvalidOptions()
            }
        }
    }
    const initAgeVerify = () => {
        const AGE_COOKIE = "_MaivinoAgeCheck"
        const hasAgeCookie = () => !!parseCookies()[AGE_COOKIE]

        const setCookie = () => {
            const days = 30;
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "; expires=" + date.toGMTString();
            document.cookie = AGE_COOKIE + '=true;' + expires + "; path=/";

        }
        if (!hasAgeCookie()) {
            const modal = document.querySelector("#age-verify")
            modal.classList.add("active")
            document.querySelector("#age-yes-button").addEventListener("click", (e) => {
                modal.classList.remove("active")
                setCookie();
                e.preventDefault();
            })
        }

    }

    document.addEventListener('DOMContentLoaded', () => {
        // we are loading variant options and images that exist into an array
        // then removing non existent images/options from ui
        // this requires the product to have invalid variants deleted
        // 
        initHideOptions();
        initAgeVerify();
    })
})()