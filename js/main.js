//Khởi tạo trang web
getCategoryList();
const productList = document.querySelector(".product-list");
const categoriesList = document.querySelector("#catergories-list");
const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get("category");
const productId = urlParams.get("id");
if (category) {
  getProductByCategory();
} else if (productId) {
  getProductById();
}
let productArray = [];

//Lấy tất cả sản phẩm
function getAllProducts() {
  axios
    .get("https://dummyjson.com/products")
    .then((response) => {
      productArray = response.data.products;
      displayProducts(productArray);
    })
    .catch((error) => {
      console.log(error);
    });
}
//Lấy sản phẩm theo danh mục
function getProductByCategory() {
  axios
    .get(`https://dummyjson.com/products/category/${category}`)
    .then((response) => {
      productArray = response.data.products;
      displayProducts(productArray);
    })
    .catch((error) => {
      console.error(error);
    });
}
//Hiển thị sản phẩm
function displayProducts(products) {
  let html = "";
  products.map((item) => {
    html += `<div class="col-12 col-md-4 col-lg-3 mb-5 product-container">
  <a class="product-item" href="#" data-id="${item.id}">
    <img
      src="${item.thumbnail}"
      class="img-fluid product-thumbnail"
    />
    <h3 class="product-title">${item.title}</h3>
    <p>${item.description}</p>
    <strong class="product-price">$${item.price}</strong>
    </a>
    <a class="add-cart href="#" data-id="${item.id}">
    <span class="icon-cross" id="add-cart">
      <img src="images/cross.svg" class="img-fluid" />
    </span>
  </a>
</div>`;
  });
  productList.innerHTML = html;
  addEventToProductItems();
}

//Thêm sự kiện click vào từng sản phẩm
function addEventToProductItems() {
  const productItems = document.querySelectorAll(".product-item");
  productItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = item.getAttribute("data-id");
      window.location.href = `product.html?id=${productId}`;
    });
  });
}
//Thêm sự kiện cho danh mục sản phẩm
categoriesList.addEventListener("change", navigateToCategory);
function navigateToCategory() {
  const selectedCategory = this.value;
  window.location.href = `category.html?category=${selectedCategory}`;
}

//Lấy danh mục sản phẩm
function getCategoryList() {
  axios
    .get("https://dummyjson.com/products/categories")
    .then((response) => {
      let html = "";
      response.data.map((item) => {
        html += `<option value="${item.slug}">${item.name}</option>`;
      });
      categoriesList.innerHTML += html;
      categoriesList.value = category;
      document.querySelector(".intro-excerpt").innerHTML = `<h1>${categoriesList.options[categoriesList.selectedIndex].text}</h1>`;
    })
    .catch((error) => {
      console.log(error);
    });
}

//Chi tiết sản phẩm
function getProductById() {
  axios
    .get(`https://dummyjson.com/products/${productId}`)
    .then((response) => {
      const product = response.data;
      const productDetail = document.querySelector(".product-detail");
      let imageGallery = "";
      product.images.map((image, index) => {
        imageGallery += `
        <div class="product-image" data-index="${index}" style="display: ${index === 0 ? "block" : "none"};">
          <img src="${image}" alt="${product.title}-${index + 1}">
        </div>
      `;
      });

      productDetail.innerHTML = `
      <div class="product-images">
        ${imageGallery}
        <button class="gallery-arrow left-arrow" onclick="prevImage()">&#10094;</button>
        <button class="gallery-arrow right-arrow" onclick="nextImage()">&#10095;</button>
      </div>
      <div class="product-info">
        <h1>${product.title}</h1>
        <div class="product-price">
          $${product.price}
          <button class="btn btn-primary" id="add-cart">Add to cart</button>
        </div>
        <p>${product.description}</p>
        <p>Hãng sản xuất: ${product.brand}</p>
        <p>Tags: ${product.tags}</p>
        <p>Tình trạng: ${product.availabilityStatus}</p>
        <p>Chính sách đổi trả: ${product.returnPolicy}</p>
      </div>
    `;

      //chức năng chuyển ảnh
      let currentImageIndex = 0;
      const images = document.querySelectorAll(".product-image");

      window.nextImage = function () {
        images[currentImageIndex].style.display = "none";
        currentImageIndex = (currentImageIndex + 1) % images.length;
        images[currentImageIndex].style.display = "block";
      };

      window.prevImage = function () {
        images[currentImageIndex].style.display = "none";
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        images[currentImageIndex].style.display = "block";
      };
      //Thêm sự kiện nút thêm vào giỏ hàng
      document.querySelector("#add-cart").addEventListener("click", () => {
        addToCart(product);
      });
    })
    .catch((error) => {
      console.error("Error fetching product details:", error);
    });
}
//----------------------------------------------
//Giở hàng
//----------------------------------------------
//Thêm sản phẩm vào session storage
function addToCart(product) {
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const existingProductIndex = cart.findIndex((item) => item.id === product.id);
  //= index nếu tìm thấy id, =-1 nếu không tìm thấy
  if (existingProductIndex !== -1) {
    cart[existingProductIndex].quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  sessionStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert("Product added to cart!");
}
//Hiện giỏ hàng trên trang web
function getCart() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const cartList = document.querySelector("#cart-list");
  let html = "";
  let subtotal = 0;
  cart.map((item) => {
    const total = item.price * item.quantity;
    subtotal += total;
    html += `
      <tr>
        <td class="product-thumbnail">
          <img src="${item.thumbnail}" alt="Image" class="img-fluid" />
        </td>
        <td class="product-name">
          <h2 class="h5 text-black">${item.title}</h2>
        </td>
        <td id="price">${item.price}</td>
        <td>
          <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px">
            <div class="input-group-prepend">
              <button class="btn btn-outline-black decrease" type="button" data-id="${item.id}">&minus;</button>
            </div>
            <input type="text" class="form-control text-center quantity-amount" value="${item.quantity}" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1" />
            <div class="input-group-append">
              <button class="btn btn-outline-black increase" type="button" data-id="${item.id}">&plus;</button>
            </div>
          </div>
        </td>
        <td><div>$</div><div id="total">${total.toFixed(2)}</div></td>
        <td><a href="#" class="btn btn-black btn-sm remove" data-id="${item.id}">X</a></td>
      </tr>
    `;
  });
  cartList.innerHTML = html;
  addQuantityEvent();
  document.querySelector("#subtotal").innerHTML = subtotal.toFixed(2);
  document.querySelector("#total-price").innerHTML = subtotal.toFixed(2);
}

// Thêm sự kiện số lượng sản phẩm
function addQuantityEvent() {
  document.querySelectorAll(".increase").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      updateQuantity(productId, 1);
      console.log(btn);
    });
  });
  document.querySelectorAll(".decrease").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      updateQuantity(productId, -1);
    });
  });
  document.querySelectorAll(".remove").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      removeFromCart(productId);
    });
  });
}

// Số lượng sản phẩm giỏ hàng
function updateQuantity(productId, change) {
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const productIndex = cart.findIndex((item) => item.id == productId);
  if (productIndex !== -1) {
    cart[productIndex].quantity += change;
    if (cart[productIndex].quantity <= 0) {
      cart[productIndex].quantity = 1;
    }
    sessionStorage.setItem("cart", JSON.stringify(cart));
    getCart();
    updateCartCount();
  }
}

// Xóa item khỏi giỏ
function removeFromCart(productId) {
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id != productId);
  sessionStorage.setItem("cart", JSON.stringify(cart));
  getCart();
  updateCartCount();
}
//----------------------------------------------
//Login va sign up form
//----------------------------------------------
const loginModal = document.querySelector("#loginModal");
const userInfoModal = document.querySelector("#userInfoModal");
const closeLogin = document.querySelector("#close-login");
const closeInfo = document.querySelector("#close-info");
const openPopUpForm = document.querySelector("#open-login-form");
openPopUpForm.addEventListener("click", openLogin);

//Mở các form (đăng nhập và thông tin người dùng)
function openLogin() {
  loginModal.style.display = "block";
}
function openUserInfo() {
  userInfoModal.style.display = "block";
}

//Đóng các form
closeLogin.addEventListener("click", function () {
  loginModal.style.display = "none";
});
closeInfo.addEventListener("click", function () {
  userInfoModal.style.display = "none";
});
window.onclick = function (event) {
  if (event.target == loginModal || event.target == userInfoModal) {
    loginModal.style.display = "none";
    userInfoModal.style.display = "none";
  }
};

//Gán thông tin người dùng đã đăng nhập
function setLoginInfo() {
  const loggedInUser = JSON.parse(localStorage.getItem("userInfoLogged"));
  const userImage = document.querySelector("#user-image");
  const username = document.querySelector("#user-info-username");
  const fullname = document.querySelector("#user-info-fullname");
  const email = document.querySelector("#user-info-email");
  openPopUpForm.removeEventListener("click", openLogin);
  openPopUpForm.addEventListener("click", openUserInfo);
  loginModal.style.display = "none";
  username.innerHTML = loggedInUser.username;
  userImage.src = loggedInUser.image;
  fullname.innerHTML = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
  email.innerHTML = loggedInUser.email;
}

//Kiểm tra trạng thái đăng nhập
window.onload = function () {
  const loggedInUser = localStorage.getItem("userInfoLogged");
  if (loggedInUser) {
    setLoginInfo();
  }
  updateCartCount(); // Update cart count on page load
};

//Xử lý đăng nhập
document.querySelector('form[action="/login"]').addEventListener("submit", function (event) {
  event.preventDefault();
  const username = document.querySelector("#login-username").value;
  const password = document.querySelector("#login-password").value;
  //localuser
  const localUsers = JSON.parse(localStorage.getItem("localUsers")) || [];
  const user = localUsers.find((user) => user.username === username && user.password === password);

  if (username == "" || password == "") {
    alert("Username và mật khẩu không được để trống!");
  } else {
    if (user) {
      alert("Đăng nhập thành công (Local Storage)!");
      localStorage.setItem("userInfoLogged", JSON.stringify(user));
      loginModal.style.display = "none";
      setLoginInfo();
    } else {
      //api
      axios
        .post("https://dummyjson.com/user/login", {
          username: username,
          password: password,
        })
        .then((response) => {
          alert("Đăng nhập thành công (API)!");
          localStorage.setItem("userInfoLogged", JSON.stringify(response.data));
          console.log(response.data);
          setLoginInfo();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Đăng nhập thất bại!");
        });
    }
  }
});

//Xử lý đăng ký
document.querySelector('form[action="/signup"]').addEventListener("submit", function (event) {
  event.preventDefault();
  const username = document.querySelector("#signup-username").value;
  const password = document.querySelector("#signup-password").value;
  if (username == "" || password == "") {
    alert("Username và mật khẩu không được để trống!");
  } else {
    const users = JSON.parse(localStorage.getItem("localUsers")) || [];
    users.push({ username: username, password: password });
    localStorage.setItem("localUsers", JSON.stringify(users));
    alert("Đăng ký thành công! Xin mời đăng nhập.");
  }
});

//Đăng xuất
function logout() {
  localStorage.removeItem("userInfoLogged");
  window.location.reload();
}

document.querySelector("#search-form").addEventListener("submit", function (event) {
  event.preventDefault();
  search();
});
document.querySelector("#search-input").addEventListener("input", function (event) {
  search();
});
//Tìm kiếm sản phẩm
document.querySelector("#search-form").addEventListener("submit", function (event) {
  event.preventDefault();
  search();
});
document.querySelector("#search-input").addEventListener("input", function (event) {
  search();
});
function search() {
  const query = document.querySelector("#search-input").value.toLowerCase();
  const filteredProducts = productArray.filter((item) => item.title.toLowerCase().includes(query));
  displayProducts(filteredProducts);
}
//sort sản phẩm
document.querySelector("#sort-select").addEventListener("change", function (event) {
  const sortValue = event.target.value;
  let sortedProducts = [...productArray];

  if (sortValue === "price-tang") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-giam") {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === "title-tang") {
    sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "title-giam") {
    sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
  }

  displayProducts(sortedProducts);
});

function updateCartCount() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  let count = 0;
  cart.map((item) => (count += item.quantity));
  const cartCountElement = document.querySelector("#cart-count");
  cartCountElement.innerHTML = count;
  cartCountElement.style.display = count > 0 ? "flex" : "none";
}
