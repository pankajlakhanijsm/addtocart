
(function () {
    try {
        var cartProduct = [];
        var editCart = {};
        const API_data = fetch('https://stg.app2food.com/menu/');
        API_data.then((res) => {
            if (res.status != 200) {
                throw Error(res.statusText);
            }
            return res.json();
        }).then(
            result => {
                if (result.msg === 'success' && result.data && result.data.categories) {
                    let resultData = result.data.categories;
                    const containerElm = document.getElementById("resultPrint");
                    if (containerElm) {
                        containerElm.insertAdjacentHTML("afterbegin", catagoryDisplay(resultData));
                        containerElm.addEventListener("click", listenerHandler, true);
                    }
                    const sidebarElem = document.getElementById("accordionSideBar");
                    if (sidebarElem) {
                        sidebarElem.insertAdjacentHTML("afterbegin", displaySideBar(resultData));
                    }
                } else {
                    throw Error(result.statusText)
                }
            }).catch((error) => console.log(error));

        function catagoryDisplay(result) {
            let resultHTML = result.map((element, index) => {
                if (index == 0) {
                    return `<div class="CategoryElement accordion-collapse collapse show" id="${element.category_name.replace(/[,,#,&,;,?,<,> ]+/g, "_")}"  data-bs-parent="#resultPrint" >
                    <img src="${element.category_image}" width="100px" />
                    <h1><strong class="cat-heading">${element.category_name}</strong></h1>
                    ${ProductDisplay(element.product)}
                </div>`
                } else {
                    return `<div class="CategoryElement accordion-collapse collapse" id="${element.category_name.replace(/[,,#,&,;,?,<,> ]+/g, "_")}"  data-bs-parent="#resultPrint" >
                    <img src="${element.category_image}" width="100px" />
                    <h1><strong class="cat-heading">${element.category_name}</strong></h1>
                    ${ProductDisplay(element.product)}
                </div>`
                }
            });
            return resultHTML.join('');
        }
        function ProductDisplay(result) {
            let ProductHTML = result.map((product) => {
                return `<div class="product" id="${product.store_product_id}"; data-category="${product.store_category_id}";>
                    <div class="productImage">
                        <img src="${product.product_image}" width="100px" />
                    </div>
                    <div id="productDescription">
                        <h2>${product.store_product_name}</h2>
                        <p>${product.product_desc}</p>
                        <div class="orderDiv">
                            <a class="customize">Customize</a>
                            <div class="priceBox" id=${product.order_number}><a id="buttonline"><strong id="${product.store_product_id}">ADD</strong></a>
                                <a><span class="finalPrice">$${(product.d_price && product.d_price.length > 0) ? "<span class='crossprice' >" + product.product_price + "</span><span class='discountPrice'>$" + product.d_price + "</span>" : product.product_price}</span></a>
                            </div>
                        </div>
                    </div>
                </div>`
            });
            return ProductHTML.join('');
        }
        function displaySideBar(data) {
            const resultData = data.map((row, index) => {
                return `<div class="accordion-item">
                        <h2 class="accordion-header" id="${row.cat_id}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${row.category_name.replace(/[,,#,&,;,?,<,> ]+/g, "_")}" aria-expanded="true" aria-controls="${row.cat_id}">
                            ${row.category_name}
                            </button>
                        </h2>
                        <div id="${row.category_name.replace(/[,,#,&,;,?,<,> ]+/g, "_")}" class="accordion-collapse collapse ${index == 0 ? "show" : ""}" aria-labelledby="${row.cat_id}" data-bs-parent="#accordionSideBar">
                            <div class="accordion-body">
                                <ul class="list-unstyled fw-normal pb-1 small">
                                ${sidebarlistitems(row.product)}
                                </ul>
                            </div>
                        </div>
                    </div>`
            });

            return resultData.join('');
        }
        function sidebarlistitems(List) {
            const listItem = List.map((item) => {
                return `<li><a class="d-inline-flex align-items-center rounded">${item.store_product_name}</a></li>`
            });
            return listItem.join('');
        }
        function getData(element) {
            if (element.srcElement.innerText === "ADD") {
                var dataObject = {};
                var targetElement = element.target.parentElement.parentElement.parentElement.parentElement.parentElement;
                var productNameElem = targetElement.querySelector("h2");
                if (productNameElem && productNameElem.innerText) {
                    dataObject['name'] = productNameElem.innerText;
                }
                var productPriceElem = targetElement.querySelector("span.discountPrice") ? targetElement.querySelector("span.discountPrice") : targetElement.querySelector("span.finalPrice");
                if (productPriceElem && productPriceElem.innerText) {
                    dataObject['price'] = productPriceElem.innerText;
                }
                if (element.target.id) {
                    dataObject['product_id'] = element.target.id;
                }
                if (dataObject && Object.keys(dataObject).length) {
                    var dataFlag = false;
                    cartProduct.map((elemt) => {
                        if (elemt.name === dataObject.name) {
                            elemt['count'] = ++elemt.count;
                            dataFlag = true;
                        }
                        return elemt;
                    });
                    if (!dataFlag) {
                        dataObject['count'] = 1;
                        cartProduct.push(dataObject);
                    }
                }
                return cartProduct;
            }
            return "";
        }
        function listenerHandler(event) {
            var productList = getData(event);
            if (productList && productList.length) {
                const RightSideBar = document.querySelector("div.rightsidebar");
                if (RightSideBar) {
                    RightSideBar.innerHTML = addCartItems(productList);
                    RightSideBar.addEventListener("click", removeHandler, true);
                }
            }
        }
        function addCartItems(data) {
            const dataList = data.map((item) => {
                return `
                <div class="list">
                    <div class="item"><div class="section"><select class="countDropdown" value="${item.count}"><option>${item.count}</option></select></div>
                    <div class="section"><div class="productDetail"><p>${item.name}</p></div><div class="removeItem"><a id="${item.product_id}" data-count="${item.count}" class="remove-btn">REMOVE</a></div></div></div>
                    <div class="section"><div class="productprice"><p>${item.price}</p></div><div class="removeItem"><a id="${item.product_id}" class="edit-btn" data-bs-toggle="modal" data-bs-target="#editCart">EDIT</a></div></div>
                </div>
            `
            });
            return dataList.join('');
        }
        function removeHandler(event) {
            if (event.target.className == "remove-btn") {
                cartProduct = cartProduct.filter((CartItem) => (CartItem.product_id === event.target.id && event.target.dataset.count > 1) ? CartItem['count'] = --CartItem.count : CartItem.product_id != event.target.id);
                if (cartProduct && cartProduct.length) {
                    const RightSideBar = document.querySelector("div.rightsidebar");
                    if (RightSideBar) {
                        RightSideBar.innerHTML = addCartItems(cartProduct);
                        RightSideBar.addEventListener("click", removeHandler, true);
                    }
                }
            }
            if (event.target.className == "edit-btn") {
                const editItem = cartProduct.filter((item) => item.product_id === event.target.id);
                editHandler(editItem);
            }
        }
        function editHandler(data) {
            document.querySelector("#editCart .modal-title").innerHTML = data[0].name;
            var countElement = document.getElementById("totalCount");
            if (countElement) {
                countElement.innerHTML = data[0].count;
                document.getElementById("submitButton").setAttribute("data-productID", data[0].product_id);
            }
        }
        var countElement = document.getElementById("totalCount");
        if (countElement) {
            document.getElementById("submitButton").addEventListener("click", function () {
                if (this.dataset && this.dataset.productid) {
                    editCart['product_id'] = this.dataset.productid;
                }
                if (countElement && countElement.innerText) {
                    editCart['count'] = countElement.innerText;
                }
                if (editCart && Object.keys(editCart).length) {
                    cartProduct = cartProduct.map((ListItem) => {
                        if (ListItem.product_id == editCart.product_id) {
                            ListItem['count'] = editCart.count;
                        }
                        return ListItem;
                    });
                    if (cartProduct && cartProduct.length) {
                        const RightSideBar = document.querySelector("div.rightsidebar");
                        if (RightSideBar) {
                            RightSideBar.innerHTML = addCartItems(cartProduct);
                            RightSideBar.addEventListener("click", removeHandler, true);
                        }
                    }
                }
            });
            document.getElementById("decreament").addEventListener("click", function () {
                countElement.innerHTML = --countElement.innerHTML;
            });
            document.getElementById("increament").addEventListener("click", function () {
                countElement.innerHTML = ++countElement.innerHTML;
            });
        }
    } catch (error) {
        console.log(error);
    }
})();