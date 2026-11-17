(() => {
  const forms = [...document.querySelectorAll("[data-account-form]")];
  const modeButtons = document.querySelectorAll("[data-account-mode]");
  const title = document.querySelector("#account-form-title");
  const description = document.querySelector("#account-form-description");
  const status = document.querySelector("#account-status");

  if (forms.length === 0 || !title || !description || !status) {
    return;
  }

  const modes = {
    "sign-in": {
      title: "Sign in",
      description: "Enter your details to access your account.",
    },
    create: {
      title: "Create an account",
      description: "Join WearCulture to make your next visit easier.",
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

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.accountMode));
  });

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const mode = form.dataset.accountForm;
      status.textContent =
        mode === "reset"
          ? "Password reset is not available until account services are connected."
          : "Account services are not connected yet. Your details have not been submitted.";
    });
  });
})();
