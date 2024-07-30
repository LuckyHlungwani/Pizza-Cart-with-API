document.addEventListener('alpine:init', () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: 0,
            change: 0,
            message: '',

            login() {
                if (this.username.length > 2) {
                    this.createCart();
                } else {
                    alert("Username too short");
                }
            },
            
            logout() {
                if (confirm("Do you want to logout?")) {
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                }
            },
             

            createCart() {
                if (!this.username) {
                    return;
                }
                
                const cartId = localStorage['cartId'];

                if (cartId) {
                    this.cartId = cartId;
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        });
                }
            },

            getCart() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
                return axios.get(getCartURL);
            },

            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                });
               
            },

            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                });
            },

            pay(amount) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    "cart_code": this.cartId,
                    amount
                });
            },

            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                });
            },

        
          


            init() {
                const storeUsername = localStorage['username'];
                if (storeUsername) {
                    this.username = storeUsername;
                }

                // Fetch all pizzas
                axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas;
                        this.fetchFeaturedPizzas();
                    });
                    
                    
                    // Create or fetch cart data
                    if (this.cartId) {
                        this.showCartData();
                    } else {
                        this.createCart()
                        .then(() => {
                            this.showCartData();
                            
                        });
                        
                }
            },
           
              
              

            addPizzaToCart(pizzaId) {
                this.addPizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    });
            },

            removePizzaFromCart(pizzaId) {
                this.removePizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    });
            },

            payForCart() {
                if (this.cartPizzas.length === 0) {
                    this.message = 'Your cart is empty. Add some pizzas before paying.';
                    setTimeout(() => this.message = '', 7000);
                    return;
                }
                
                this.pay(this.paymentAmount)
                    .then(result => {
                        if (result.data.status === 'failure') {
                            this.message = result.data.message;
                            setTimeout(() => this.message = '', 5000);
                        } else {
                            this.change = (this.paymentAmount - this.cartTotal).toFixed(2);
                            this.message = `Payment received. Change: R${this.change}, Enjoy Your Pizza!`;
                            setTimeout(() => {
                                this.message = '';
                                this.cartPizzas = [];
                                this.cartId = '';
                                this.paymentAmount = 0;
                                localStorage['cartId'] = '';
                                localStorage['username'] = '';
                                this.createCart()
                                    .then(() => {
                                        this.showCartData();
                                    });
                            }, 7000);
                        }
                    });
            }
        }
    });
});
