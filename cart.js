(() => {
  const storageKey = "wearculture-cart";
  const cartItemsElement = document.querySelector("#cart-items");
  const emptyState = document.querySelector("#cart-empty");
  const itemCountElement = document.querySelector("#cart-item-count");
  const productMrpElement = document.querySelector("#cart-product-mrp");
  const deliveryChargesElement = document.querySelector("#cart-delivery-charges");
  const couponDiscountElement = document.querySelector("#cart-coupon-discount");
  const totalElement = document.querySelector("#cart-total");
  const deliveryCharge = 100;
  const couponDiscount = 0;
  const currency = (amount) => `₹${amount.toLocaleString("en-IN")}`;
  const defaultColors = [
    { name: "Black", cssColor: "#242321" },
    { name: "White", cssColor: "#f3f0ec" },
  ];
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryDateIso = [
    deliveryDate.getFullYear(),
    String(deliveryDate.getMonth() + 1).padStart(2, "0"),
    String(deliveryDate.getDate()).padStart(2, "0"),
  ].join("-");
  const formattedDeliveryDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(deliveryDate);

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

  const makeProductAction = (label, action, id, iconPath, text) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cart-product-action";
    button.dataset.cartAction = action;
    button.dataset.productId = id;
    button.setAttribute("aria-label", label);

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", iconPath);
    icon.append(path);

    const caption = document.createElement("span");
    caption.textContent = text;
    button.append(icon, caption);
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

      const rating = document.createElement("div");
      rating.className = "cart-item-rating";
      rating.setAttribute("aria-label", `Rated ${item.rating || "4.8"} out of 5 stars`);
      const stars = document.createElement("span");
      stars.setAttribute("aria-hidden", "true");
      stars.textContent = "★★★★★";
      const ratingScore = document.createElement("span");
      ratingScore.setAttribute("aria-hidden", "true");
      ratingScore.textContent = `(${item.rating || "4.8"})`;
      rating.append(stars, ratingScore);

      const price = document.createElement("p");
      price.className = "cart-item-price";
      price.textContent = currency(item.price);

      const options = document.createElement("div");
      options.className = "cart-item-options";

      const sizeSection = document.createElement("div");
      sizeSection.className = "cart-item-option";
      const sizeLabel = document.createElement("span");
      sizeLabel.className = "cart-item-option-label";
      sizeLabel.textContent = "Available size";
      const sizes = document.createElement("ul");
      sizes.className = "cart-size-list";
      (item.sizes || ["S", "M", "L"]).forEach((size) => {
        const entry = document.createElement("li");
        entry.textContent = size;
        sizes.append(entry);
      });
      sizeSection.append(sizeLabel, sizes);

      const colorSection = document.createElement("div");
      colorSection.className = "cart-item-option";
      const colorLabel = document.createElement("span");
      colorLabel.className = "cart-item-option-label";
      colorLabel.textContent = "Available color";
      const colors = document.createElement("div");
      colors.className = "cart-color-list";
      const availableColors =
        Array.isArray(item.colors) &&
        item.colors.every((color) => color.name && color.cssColor)
          ? item.colors
          : defaultColors;
      availableColors.forEach((color) => {
        const swatch = document.createElement("span");
        swatch.className = "cart-color-swatch";
        swatch.style.setProperty("--cart-swatch-color", color.cssColor);
        swatch.setAttribute("role", "img");
        swatch.setAttribute("aria-label", color.name);
        colors.append(swatch);
      });
      colorSection.append(colorLabel, colors);
      options.append(sizeSection, colorSection);

      const serviceInfo = document.createElement("div");
      serviceInfo.className = "cart-item-service-info";
      const delivery = document.createElement("p");
      delivery.textContent = "Delivery by ";
      const deliveryTime = document.createElement("time");
      deliveryTime.dateTime = deliveryDateIso;
      deliveryTime.textContent = formattedDeliveryDate;
      delivery.append(deliveryTime);
      const returns = document.createElement("p");
      returns.textContent = "7-day return window";
      serviceInfo.append(delivery, returns);

      const stockNote = document.createElement("p");
      stockNote.className = "cart-item-stock";
      stockNote.textContent = `${item.quantity} ${item.quantity === 1 ? "item" : "items"} in your cart`;

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

      const actions = document.createElement("div");
      actions.className = "cart-item-actions";
      actions.append(
        controls,
        makeProductAction(
          `Delete ${item.name} from cart`,
          "remove",
          item.id,
          "M3 6h18M8 6V4h8v2m-11 0 1 14h12l1-14M10 11v5m4-5v5",
          "Delete",
        ),
        makeProductAction(
          `Share ${item.name}`,
          "share",
          item.id,
          "M18 8a3 3 0 1 0-2.83-4M6 14a3 3 0 1 0 0-6m12 13a3 3 0 1 0-2.83-4M8.6 9.5l6.8-4m-6.8 9 6.8 4",
          "Share",
        ),
      );

      const shareStatus = document.createElement("p");
      shareStatus.className = "cart-share-status";
      shareStatus.setAttribute("role", "status");
      shareStatus.setAttribute("aria-live", "polite");

      details.append(name, rating, price, options, serviceInfo, stockNote, actions, shareStatus);
      row.append(imageLink, details);
      cartItemsElement.append(row);
    });

    const count = items.reduce((total, item) => total + item.quantity, 0);
    const productMrp = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const appliedDeliveryCharge = count > 0 ? deliveryCharge : 0;
    const total = productMrp + appliedDeliveryCharge - couponDiscount;
    if (itemCountElement) {
      itemCountElement.textContent = `${count} ${count === 1 ? "item" : "items"}`;
    }
    if (productMrpElement) {
      productMrpElement.textContent = currency(productMrp);
    }
    if (deliveryChargesElement) {
      deliveryChargesElement.textContent = currency(appliedDeliveryCharge);
    }
    if (couponDiscountElement) {
      couponDiscountElement.textContent = currency(couponDiscount);
    }
    if (totalElement) {
      totalElement.textContent = currency(total);
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
      const rating = product?.querySelector(".rating-score")?.textContent.trim() || "4.8";
      const sizes = (product?.dataset.sizes || "S,M,L").split(",");
      const colors = [...(product?.querySelectorAll(".product-color-swatch") || [])].map(
        (swatch) => ({
          name: swatch.getAttribute("aria-label") || "Available color",
          cssColor: swatch.style.getPropertyValue("--swatch-color") || "#242321",
        }),
      );

      if (!name || !image || !Number.isFinite(price) || price <= 0) {
        throw new Error("Product details are missing; it cannot be added to the cart.");
      }

      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const existingItem = items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.rating = rating;
        existingItem.sizes = sizes;
        existingItem.colors = colors.length ? colors : defaultColors;
      } else {
        items.push({
          id,
          name,
          image,
          price,
          quantity: 1,
          rating,
          sizes,
          colors: colors.length ? colors : defaultColors,
        });
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
    } else if (button.dataset.cartAction === "share") {
      const shareStatus = button.closest(".cart-item")?.querySelector(".cart-share-status");
      const productUrl = new URL("collection.html", window.location.href).href;
      const shareData = {
        title: item.name,
        text: `Check out ${item.name} at WearCulture.`,
        url: productUrl,
      };

      if (navigator.share) {
        navigator.share(shareData).catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Unable to share this product.", error);
            if (shareStatus) {
              shareStatus.textContent = "Unable to share this product right now.";
            }
          }
        });
      } else if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(productUrl).then(
          () => {
            if (shareStatus) {
              shareStatus.textContent = "Product link copied.";
            }
          },
          (error) => {
            console.error("Unable to copy the product link.", error);
            if (shareStatus) {
              shareStatus.textContent = "Unable to share this product right now.";
            }
          },
        );
      } else if (shareStatus) {
        shareStatus.textContent = "Sharing is not supported in this browser.";
      }
      return;
    }

    saveCart();
    renderItems();
  });

  renderItems();
})();
