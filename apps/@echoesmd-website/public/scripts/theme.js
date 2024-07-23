const changeTheme = () => {
  const element = document.documentElement;
  const theme = element.classList.contains("dark") ? "light" : "dark";

  if (theme === "dark") {
    element.classList.add("dark");
    element.classList.remove("light");
  } else {
    element.classList.add("light");
    element.classList.remove("dark");
  }
  localStorage.theme = theme;
}

const preloadTheme = () => {
  const theme = (() => {
    const userTheme = localStorage.theme;
    if (userTheme === "light" || userTheme === "dark") {
      return userTheme;
    } else {
      return "light";
    }
  })()

  const element = document.documentElement;
  if (theme === "dark") {
    element.classList.add("dark");
    element.classList.remove("light");
  } else {
    element.classList.add("light");
    element.classList.remove("dark");
  }
  localStorage.theme = theme;
}

const initializeThemeButtons = () => {
  const themeButtons = document.querySelectorAll(".theme-button");
  themeButtons.forEach((button) => {
    button.addEventListener("click", changeTheme);
  });
}

window.onload = async () => {
  document.addEventListener("astro:after-swap", initializeThemeButtons);
  initializeThemeButtons();
}
document.addEventListener("astro:after-swap", preloadTheme);
preloadTheme();
