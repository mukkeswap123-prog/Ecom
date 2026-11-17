(() => {
  const storageKey = "wearculture-cart";
  const cartItemsElement = document.querySelector("#cart-items");
  const emptyState = document.querySelector("#cart-empty");
  const itemCountElement = document.querySelector("#cart-item-count");
  const subtotalElement = document.querySelector("#cart-subtotal");
  const totalElement = document.querySelector("#cart-total");
  const currency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const readCart = () => {
    const savedCart = localStorage.getItem(storageKey);

    if (!savedCart) {
      return [];
    }

    const cart = JSON.parse(savedCart);
    if (
      !Array.isArray(cart) ||
      cart.some(
        (item) =>
          typeof item.id !== "string" ||
          typeof item.name !== "string" ||
          typeof item.image !== "string" ||
          !Number.isFinite(item.price) ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1,
      )
    ) {
      throw new Error("Saved cart data is invalid.");
    }

    return cart;
  };

  let items = readCart();

  const saveCart = () => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const updateCartCount = () => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const cartLink = document.querySelector('.primary-nav a[href="cart.html"]');

    if (!cartLink) {
      return;
    }

    let badge = cartLink.querySelector(".cart-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-count";
      badge.setAttribute("aria-hidden", "true");
      cartLink.append(badge);
    }

    badge.textContent = String(count);
    cartLink.setAttribute("aria-label", `Cart, ${count} ${count === 1 ? "item" : "items"}`);
  };

  const makeQuantityButton = (label, action, id, text) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cart-quantity-button";
    button.dataset.cartAction = action;
    button.dataset.productId = id;
    button.setAttribute("aria-label", label);
    button.textContent = text;
    return button;
  };

  const renderItems = () => {
    updateCartCount();

    if (!cartItemsElement || !emptyState) {
      return;
    }

    cartItemsElement.replaceChildren();
    emptyState.hidden = items.length > 0;
    cartItemsElement.hidden = items.length === 0;

    items.forEach((item) => {
      const row = document.createElement("article");
      row.className = "cart-item";

      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.name;
      image.loading = "lazy";

      const imageLink = document.createElement("a");
      imageLink.className = "cart-item-image";
      imageLink.href = "collection.html";
      imageLink.setAttribute("aria-label", `Continue shopping for ${item.name}`);
      imageLink.append(image);

      const details = document.createElement("div");
      details.className = "cart-item-details";

      const name = document.createElement("h3");
      name.textContent = item.name;

      const unitPrice = document.createElement("p");
      unitPrice.className = "cart-item-unit-price";
      unitPrice.textContent = `${currency(item.price)} each`;

      const controls = document.createElement("div");
      controls.className = "cart-item-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `Quantity for ${item.name}`);
      const decreaseButton = makeQuantityButton(
        `Decrease quantity for ${item.name}`,
        "decrease",
        item.id,
        "−",
      );
      decreaseButton.disabled = item.quantity <= 1;
      controls.append(
        decreaseButton,
        Object.assign(document.createElement("span"), {
          className: "cart-item-quantity",
          textContent: String(item.quantity),
        }),
        makeQuantityButton(`Increase quantity for ${item.name}`, "increase", item.id, "+"),
      );

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "cart-remove";
      removeButton.dataset.cartAction = "remove";
      removeButton.dataset.productId = item.id;
      removeButton.textContent = "Remove";

      const lineTotal = document.createElement("p");
      lineTotal.className = "cart-item-total";
      lineTotal.textContent = currency(item.price * item.quantity);

      details.append(name, unitPrice, controls, removeButton);
      row.append(imageLink, details, lineTotal);
      cartItemsElement.append(row);
    });

    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    if (itemCountElement) {
      itemCountElement.textContent = `${count} ${count === 1 ? "item" : "items"}`;
    }
    if (subtotalElement) {
      subtotalElement.textContent = currency(subtotal);
    }
    if (totalElement) {
      totalElement.textContent = currency(subtotal);
    }
  };

  document.querySelectorAll(".quick-add").forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.closest(".product-card, .seller-card");
      const name = product?.querySelector("h3")?.textContent.trim();
      const image = product?.querySelector("img")?.getAttribute("src");
      const priceText = product?.querySelector(".product-details p")?.textContent || "";
      const prices = priceText.match(/[\d,]+/g);
      const price = Number(product?.dataset.price || prices?.[prices.length - 1]?.replace(/,/g, ""));

      if (!name || !image || !Number.isFinite(price) || price <= 0) {
        throw new Error("Product details are missing; it cannot be added to the cart.");
      }

      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const existingItem = items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        items.push({ id, name, image, price, quantity: 1 });
      }

      saveCart();
      renderItems();
    });
  });

  cartItemsElement?.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest("button[data-cart-action]");
    if (!button) {
      return;
    }

    const item = items.find((cartItem) => cartItem.id === button.dataset.productId);
    if (!item) {
      return;
    }

    if (button.dataset.cartAction === "increase") {
      item.quantity += 1;
    } else if (button.dataset.cartAction === "decrease" && item.quantity > 1) {
      item.quantity -= 1;
    } else if (button.dataset.cartAction === "remove") {
      items = items.filter((cartItem) => cartItem.id !== item.id);
    }

    saveCart();
    renderItems();
  });

  renderItems();
})();
