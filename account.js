(() => {
  const forms = [...document.querySelectorAll("[data-account-form]")];
  const modeButtons = document.querySelectorAll("[data-account-mode]");
  const title = document.querySelector("#account-form-title");
  const description = document.querySelector("#account-form-description");
  const status = document.querySelector("#account-status");
  const accountLayout = document.querySelector(".account-layout");
  const dashboard = document.querySelector(".account-dashboard");
  const dashboardNavigation = document.querySelectorAll("[data-dashboard-section]");
  const dashboardPanels = document.querySelectorAll("[data-account-panel]");

  if (
    forms.length === 0 ||
    !title ||
    !description ||
    !status ||
    !accountLayout ||
    !dashboard
  ) {
    return;
  }

  const modes = {
    "sign-in": {
      title: "Sign in",
      description: "Demo sign-in opens an account preview; credentials are not verified or saved.",
    },
    create: {
      title: "Create an account",
      description: "Preview the account dashboard. Registration is not connected yet.",
    },
    reset: {
      title: "Reset your password",
      description: "Enter your email address to request password reset instructions.",
    },
  };

  const setMode = (mode) => {
    const selectedMode = modes[mode];
    if (!selectedMode) {
      return;
    }

    forms.forEach((form) => {
      form.hidden = form.dataset.accountForm !== mode;
    });
    title.textContent = selectedMode.title;
    description.textContent = selectedMode.description;
    status.textContent = "";
  };

  const showDashboard = (name, email) => {
    document.querySelector("#account-name-display").textContent = name || "Not provided";
    document.querySelector("#account-email-display").textContent = email || "Not provided";
    document.querySelector("#account-contact-email").textContent = email || "Not provided";
    accountLayout.hidden = true;
    dashboard.hidden = false;
    status.textContent = "";
  };

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.accountMode));
  });

  dashboardNavigation.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedSection = button.dataset.dashboardSection;
      dashboardNavigation.forEach((navigationButton) => {
        if (navigationButton === button) {
          navigationButton.setAttribute("aria-current", "page");
        } else {
          navigationButton.removeAttribute("aria-current");
        }
      });
      dashboardPanels.forEach((panel) => {
        panel.hidden = panel.dataset.accountPanel !== selectedSection;
      });
    });
  });

  document.querySelector("[data-account-sign-out]")?.addEventListener("click", () => {
    dashboard.hidden = true;
    accountLayout.hidden = false;
    forms.forEach((form) => form.reset());
    setMode("sign-in");
  });

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const mode = form.dataset.accountForm;
      if (mode === "reset") {
        status.textContent = "Password reset is not available until account services are connected.";
        return;
      }

      const email = form.querySelector('input[name="email"]').value.trim();
      const name = form.querySelector('input[name="name"]')?.value.trim();
      const password = form.querySelector('input[type="password"]');
      if (password) {
        password.value = "";
      }
      showDashboard(name, email);
    });
  });
})();
