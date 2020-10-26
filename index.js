class Load {
    async getProducts () {
        // Gets products in JSON format 

        try {
            let result = await fetch("products.json")
            let data = await result.json()
            let products = data.products
            return products
        }
        catch (error){
            console.log(error)
        }
    }
}

class Storage {
    static saveProductsToLocalStorage (products) {
        localStorage.setItem("products", JSON.stringify(products))
    }

    static getProductsFromLocalStorage () {
        let products = localStorage.getItem("products")
        if (products === null || products === []) {
            Storage.saveProductsToLocalStorage([])
            return []
        }
        else return JSON.parse(localStorage.getItem("products"))
    }

    static saveCartToLocalStorage (cart) {
        localStorage.setItem("cart", JSON.stringify(cart))
    }

    static getCartFromLocalStorage () {
        let cart = localStorage.getItem("cart")
        if (cart === null || cart === []) {
            Storage.saveCartToLocalStorage([])
            return []
        }
        else return JSON.parse(localStorage.getItem("cart"))
    }

    static saveFilterToLocalStorage (sortByA, sortByB) {
        localStorage.setItem("filter",JSON.stringify([sortByA,sortByB]))
    }

    static getFilterFromLocalStorage () {
        let filter = localStorage.getItem("filter")
        if (filter === null) {
            Storage.saveFilterToLocalStorage([], ["money", 2])
            return [[], ["money", 2]]
        }
        return JSON.parse(filter)
    }
}
class Cart {
    static toggleCart () {
        // Show cart overlay

        $(".cart-overlay").toggleClass("transparentBcg");
        $(".cart").toggleClass("showCart");
    }

    static displayCart (cart) {
        // Put cart items in for display

        $(".cart-item").remove()
        let result = ""
        if (cart.length !== 0) {
            $("button.clear-cart").show()
            $(".cart-footer h3").show()
        }
        else {
            $("button.clear-cart").hide()
            $(".cart-footer h3").hide()
        }

        cart.forEach(item => {
            result = `<div class="cart-item"><img src="${item.image}" alt="cart item" class=""><div><h4>${item.name}</h4><h5>${item.price.amount + " " + item.price.currency}</h5><span class="remove-item" data-id=${(item.id).toString()}>REMOVE</span></div><div><i class="fas fa-chevron-up" data-id=${item.id}></i><p class="item-amount">${item.numOfProducts}</p><i class="fas fa-chevron-down" data-id=${item.id}></i></div></div>`
            $(".cart-content").prepend(result) 
        })
        
        if (cart.length === 0) {
            $(".cart h2").text("Your Cart is Empty")
        }
        else {
            $(".cart h2").text("Your Cart")
        }
        Cart.calculateTotal (cart)
        OtherEL.removeFromCartEL()
        OtherEL.addRemoveItemEL ()
    }

    static clearCart () {
        Storage.saveCartToLocalStorage([])
        $(".cart-item").remove()
        $(".cart h2").text("Your Cart is Empty")
        $("button.clear-cart").hide()
        $(".cart-footer h3").hide()
    }

    static isInCart (cart, id) {
        return cart.find(item => item.id === id)
    }

    static handleRemoveFromCart (id) {
        let cart = Storage.getCartFromLocalStorage()
        let newCart = []
        cart.forEach(product => {
            if ((product.id).toString() !== id) {
                newCart.push(product)
            }
        })
        Storage.saveCartToLocalStorage(newCart)
        Cart.displayCart(newCart)
    }

    static calculateTotal (cart) {
        let total = 0
        let index = 0
        cart.forEach(item => {
            total += item.numOfProducts * item.price.amount
            $($(".cart-item h5")[(cart.length - 1) - index]).text(item.price.amount + " Kn per - " + (item.numOfProducts * item.price.amount) + " Kn")
            index++
        })
        $(".cart-total").text(total.toFixed(2))
    }

    static changeItemAmount (id, operator) {
        // Changes amount of product in cart for selected operator (0 increase 1 decrease)

        let cart = Storage.getCartFromLocalStorage()
        let item
        if (operator === 0) {
            item = cart.find(i => (i.id).toString() === id)
            item.numOfProducts +=1
            Storage.saveCartToLocalStorage(cart)
            Cart.displayCart(cart)
        }
        else {
            item = cart.find(i => (i.id).toString() === id)
            item.numOfProducts -=1
            if (item.numOfProducts === 0) {
                Cart.handleRemoveFromCart((item.id).toString())
            }
            else {
                Storage.saveCartToLocalStorage(cart)
                Cart.displayCart(cart)
            }
        }
    }

}

class OtherEL {
    static toggleCartButtonsEL () {
        // Show/hide cart buttons EL

        let buttons = [".cart-btn",".fa-times-circle"]
        buttons.forEach(button => {
            $(button).click(function() {
                Cart.toggleCart()
            });
        })
    }

    static handleCategorySort (button) {
        let buttonSliced = button.slice(0,button.indexOf("-"))
        if (sortByCategory.includes(buttonSliced)) {
            sortByCategory = sortByCategory.filter(category => category !== buttonSliced)
            button = button.slice(0,button.indexOf(" "))
            $("." + button).toggleClass("selected-category")
        }
        else {
            sortByCategory.push(buttonSliced)
            $("." + button).toggleClass("selected-category")
        }
        Storage.saveFilterToLocalStorage(sortByCategory, sortByFilter)
        Products.displayProducts()
    }

    static sortByCategoryButtonsEL () {
        let sortByButtonsDOM = [".fruit-category-store", ".vegetable-category-store", ".dairy-category-store", ".other-category-store"]
        sortByButtonsDOM.forEach(button => {
            $(button).click((event) => {
                OtherEL.handleCategorySort(event.currentTarget.className)
            })
        })
    }

    static handleFilterSort (button) {
        let buttonSliced = button.slice(0,button.indexOf("-"))
        let arrowIcons = [" fa-arrow-up", " fa-arrow-down", ""]
        let buttonDOM = $("." + buttonSliced + "-sort-category-store")
        $(".sort .fas").remove()
        
        if (sortByFilter.includes(buttonSliced)) {
            sortByFilter[1] = (sortByFilter[1] + 1) % 3
            if (sortByFilter[1] === 2) {
                buttonDOM.removeClass("selected-category")
            }
        }
        else {
            $("." + sortByFilter[0] + "-sort-category-store").removeClass("selected-category")
            sortByFilter[0] = buttonSliced
            sortByFilter[1] = 0
        }
        if (sortByFilter[1] !== 2) {
            buttonDOM.addClass("selected-category")
        }
        let arrowHTML = `<i class="${"fas" + arrowIcons[sortByFilter[1]]}"></i>`
        $("." + sortByFilter[0] + "-sort-category-store").prepend(arrowHTML)
        Products.displayProducts()
        Storage.saveFilterToLocalStorage(sortByCategory, sortByFilter)
    }

    static sortByFilterButtonsEL () {
        let sortByFilterButtonsDOM = [".money-sort-category-store", ".abc-sort-category-store"]
        sortByFilterButtonsDOM.forEach(button => {
            $(button).click((event) => {
                OtherEL.handleFilterSort(event.currentTarget.className)
            })
        })
    }
    
    static clearCartEL () {
        $(".clear-cart").click(() => {
            Cart.clearCart()
        })
    }

    static removeFromCartEL (id) {
        [...$(".remove-item")].forEach(item => {
            $(item).click((event) => {
                Cart.handleRemoveFromCart (event.target.dataset.id)
            })
        })
    }

    static addRemoveItemEL () {
        let increaseButton = [...$(".fa-chevron-up")]
        let decreaseButton = [...$(".fa-chevron-down")]
        increaseButton.forEach(item => {
            $(item).click((event) => {
                Cart.changeItemAmount(event.target.dataset.id,0)
            })
        })
        decreaseButton.forEach(item => {
            $(item).click((event) => {
                Cart.changeItemAmount(event.target.dataset.id,1)
            })
        })
    }

    static addEventListerToCartButton (products) {
        // EL for add to cart buttons

        let buttons = [...$(".bag-btn")]
        buttons.forEach(button => {
            $(button).click((event) => {
                Products.handleCartButtonPress(products, event)
            })
        })
    }

    static navButtonEL () {
        $(".about-btn").click(() => {
            window.location.href = "about.html"
        })
        $(".shop-btn").click(() => {
            Storage.saveFilterToLocalStorage([], ["money",2])
            window.location.href = "store.html"
        })
    }

    static handleCategoryRedirect (category) {
        // Redirects to store.html and shows category for pressed category button

        switch (category) {
            case "fruit-category": {
                Storage.saveFilterToLocalStorage(["fruit"], ["money", 2])
                window.location.href = "store.html"
                break
            }
            case "vegetable-category": {
                Storage.saveFilterToLocalStorage(["vegetable"], ["money", 2])
                window.location.href = "store.html"
                break
            }
            case "dairy-category": {
                Storage.saveFilterToLocalStorage(["dairy"], ["money", 2])
                window.location.href = "store.html"
                break
            }
            case "other-category": {
                Storage.saveFilterToLocalStorage(["other"], ["money", 2])
                window.location.href = "store.html"
                break
            }
            
        }
    }

    static categoryRedirectEL () {
        let categories = [".fruit-category", ".vegetable-category", ".dairy-category", ".other-category"]
        categories.forEach(category => {
            $(category).click((event) => {
                OtherEL.handleCategoryRedirect(event.currentTarget.className)
            })
        })

        $(".navbar-brand").click(() => {
            Storage.saveFilterToLocalStorage([],["money",2])
            window.location.href = "index.html"
        })

        $(".get-started-box .get-started-btn").click(() =>{
            window.location.href = "store.html"
        })
    }
}

class Products {
    static sortProducts (products, key) {
        // Sorts products for selected filters

        let tempProducts = []
        products.forEach(product => {
            if ((sortByCategory.includes(product.category) || sortByCategory.length === 0) && key ===0) {
                tempProducts.push(product)
            }
        })
        if (key ===0) {
            products = tempProducts
        }
        products = products.sort((a, b) => {
            let sortA; let sortB; let a1st; let b1st

            if (key === 1) {
                sortA = a.popularity
                sortB = b.popularity
                a1st = -1
                b1st = 1
            }

            else if (sortByFilter[1] === 2) {
                return 0
            }
            else if (sortByFilter[0] === "money") {
                sortA = a.price.amount
                sortB = b.price.amount
            }

            else {
                sortA = a.name
                sortB = b.name
            }
                
            if (sortByFilter[1] === 0 && key === 0) {
                a1st = 1
                b1st = -1
            }

            else {
                a1st = -1
                b1st = 1
                }

            if (sortA < sortB) {
                return b1st;
            }
            if (sortA > sortB) {
                return a1st;
            }
            return 0;
        })
        return products
    }

    static getTheMostPopularProducts () {
        return Products.sortProducts(Storage.getProductsFromLocalStorage(), 1)
    }

    static displayTheMostPopularProducts () {
        // Display the most popular products into carousel

        let popularProducts = Products.getTheMostPopularProducts().slice(0, 10)
        let carouselItemDOM = [...$(".carousel-item")]
        
        for (var i = 0; i < carouselItemDOM.length; i++) {
            for (var j = 0; j < 3; j++) {
                $(carouselItemDOM[i]).prepend(`<article class="product popular-item"><div class="img-container"><img src="${popularProducts[3 * i + j].image}" alt="product" class="product-img"><button class="bag-btn" data-id=${popularProducts[3 * i + j].id.toString()}><i class="fas fa-shopping-cart" data-id=${popularProducts[3 * i + j].id.toString()}></i> Add to Cart</button><h3>${popularProducts[3 * i + j].name}</h3><h4>${popularProducts[3 * i + j].price.amount + " " + popularProducts[3 * i + j].price.currency + "/" + popularProducts[3 * i + j].price.measureUnit}</h4></div></article>`)
            }
        }    
    }
    static getProductById (products, id) {
        return products.find(product => product.id === id)
    }

    static handleCartButtonPress (products, event) {
        let id = parseInt(event.target.dataset.id, 10)
        let cart = Storage.getCartFromLocalStorage()
        let findInCart = Cart.isInCart(cart, id)
        let triggeredItem
        if (findInCart) {
            cart.forEach(product => {
                if (findInCart === product) {
                    product.numOfProducts += 1
                }
            })
        }
        else {
            triggeredItem = {...Products.getProductById(products, id), "numOfProducts": 1}
            cart = [...cart, triggeredItem ]
    
        }        
        Storage.saveCartToLocalStorage(cart)
        Cart.displayCart(cart)
        Cart.toggleCart()
    }

    static displayProducts() {
        let result = ""
        let products = Storage.getProductsFromLocalStorage()
        products = Products.sortProducts(products, 0)
        products.forEach(product => {
            result += `<article class="product"><div class="img-container"><img src="${product.image}" alt="product" class="product-img"><button class="bag-btn" data-id=${product.id.toString()}><i class="fas fa-shopping-cart" data-id=${product.id.toString()}></i> Add to Cart</button><h3>${product.name}</h3><h4>${product.price.amount + " " + product.price.currency + "/" + product.price.measureUnit}</h4></div></article>`
        })
        $(".products-center").html(result)
        OtherEL.addEventListerToCartButton(products)
    }
    static markSelectedCategories () {
        sortByCategory.forEach(category => {
            $("." + category + "-category-store").toggleClass("selected-category")
        })
        if (sortByFilter[0].length !==0 && sortByFilter[1] !== 2) {
            $("." +sortByFilter[0] + "-sort-category-store").addClass("selected-category")
        }
        let arrowIcons = [" fa-arrow-up", " fa-arrow-down", ""]
        let arrowHTML = `<i class="${"fas" + arrowIcons[sortByFilter[1]]}"></i>`
        $("." + sortByFilter[0] + "-sort-category-store").prepend(arrowHTML)

    }
}

var filter = Storage.getFilterFromLocalStorage()
var sortByCategory = filter[0]
var sortByFilter = filter[1]

$(document).ready(() => {
    const load = new Load()
    load.getProducts().then(products => {
        Storage.saveProductsToLocalStorage(products)
        Products.displayTheMostPopularProducts()
        Products.displayProducts()
        Cart.displayCart(Storage.getCartFromLocalStorage())
        OtherEL.toggleCartButtonsEL()
        OtherEL.sortByCategoryButtonsEL()
        OtherEL.sortByFilterButtonsEL()
        OtherEL.clearCartEL()
        OtherEL.navButtonEL()
        OtherEL.categoryRedirectEL()
        Products.markSelectedCategories()
        if ((window.location.href).includes("index.html")) {
            sortByCategory = []
        }

    })
}) 



