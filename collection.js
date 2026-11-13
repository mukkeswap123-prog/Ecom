(() => {
  const grid = document.querySelector(".collection-grid");
  const tabs = document.querySelectorAll(".collection-tab");
  const sortSelect = document.querySelector(".collection-sort select");
  const filters = document.querySelectorAll(".collection-filter input[type='checkbox']");
  const priceRange = document.querySelector("#collection-price");

  if (!grid || tabs.length === 0 || !sortSelect || !priceRange) {
    return;
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const dateIso = [
    deliveryDate.getFullYear(),
    String(deliveryDate.getMonth() + 1).padStart(2, "0"),
    String(deliveryDate.getDate()).padStart(2, "0"),
  ].join("-");
  const formattedDeliveryDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(deliveryDate);

  document.querySelectorAll("[data-delivery-date]").forEach((date) => {
    date.dateTime = dateIso;
    date.textContent = `Delivery by ${formattedDeliveryDate}`;
  });

  const products = [...grid.querySelectorAll(".collection-product")];
  const originalOrder = new Map(products.map((product, index) => [product, index]));
  const priceOutput = document.querySelector(".filter-price output");
  let activeCategory = "all";

  const updateProducts = () => {
    const sort = sortSelect.value;
    const selectedTypes = [...document.querySelectorAll("input[name='product-type']:checked")].map(
      (filter) => filter.value,
    );
    const selectedCollections = [...document.querySelectorAll("input[name='collection']:checked")].map(
      (filter) => filter.value,
    );
    const selectedSizes = [...document.querySelectorAll("input[name='size']:checked")].map(
      (filter) => filter.value,
    );
    const maximumPrice = Number(priceRange.value);

    const visibleProducts = products.filter((product) => {
      const matchesTab =
        activeCategory === "all" || product.dataset.category === activeCategory;
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.dataset.type);
      const matchesCollection =
        selectedCollections.length === 0 ||
        selectedCollections.some(
          (collection) =>
            product.dataset.category === collection ||
            (collection === "new-arrivals" && product.dataset.newArrival === "true"),
        );
      const productSizes = (product.dataset.sizes || "").split(",");
      const matchesSize =
        selectedSizes.length === 0 || selectedSizes.some((size) => productSizes.includes(size));
      const matchesPrice = Number(product.dataset.price) <= maximumPrice;
      const isVisible =
        matchesTab && matchesType && matchesCollection && matchesSize && matchesPrice;

      product.hidden = !isVisible;
      return isVisible;
    });

    visibleProducts.sort((first, second) => {
      const firstPrice = Number(first.dataset.price);
      const secondPrice = Number(second.dataset.price);

      if (sort === "price-low-high") {
        return firstPrice - secondPrice;
      }

      if (sort === "price-high-low") {
        return secondPrice - firstPrice;
      }

      if (sort === "name-a-z") {
        return first.querySelector("h3").textContent.localeCompare(
          second.querySelector("h3").textContent,
        );
      }

      return originalOrder.get(first) - originalOrder.get(second);
    });

    visibleProducts.forEach((product) => grid.append(product));
  };

  const updatePriceOutput = () => {
    if (priceOutput) {
      priceOutput.value = `₹${Number(priceRange.value).toLocaleString("en-IN")}`;
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCategory = tab.dataset.category;

      tabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      updateProducts();
    });
  });

  filters.forEach((filter) => filter.addEventListener("change", updateProducts));
  priceRange.addEventListener("input", () => {
    updatePriceOutput();
    updateProducts();
  });
  sortSelect.addEventListener("change", updateProducts);
})();
