(() => {
  const grid = document.querySelector(".collection-grid");
  const tabs = document.querySelectorAll(".collection-tab");
  const sortSelect = document.querySelector(".collection-sort select");

  if (!grid || tabs.length === 0 || !sortSelect) {
    return;
  }

  const products = [...grid.querySelectorAll(".collection-product")];
  const originalOrder = new Map(products.map((product, index) => [product, index]));
  let activeCategory = "all";

  const updateProducts = () => {
    const sort = sortSelect.value;
    const visibleProducts = products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.dataset.category === activeCategory;

      product.hidden = !matchesCategory;
      return matchesCategory;
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

  sortSelect.addEventListener("change", updateProducts);
})();
