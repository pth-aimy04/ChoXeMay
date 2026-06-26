export const applyTheme = (theme) => {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    localStorage.setItem("theme", theme);
};