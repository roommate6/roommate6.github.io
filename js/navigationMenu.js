const menuButton = document.getElementById("mainTopBarBurgerButton");
const menu = document.getElementById("navigationMenuContainer");
let isMenuOpen = false;

function setMenuState(open) {
  isMenuOpen = open;
  menu.classList.toggle("is-open", open);
  menu.classList.toggle("is-closed", !open);
}

menuButton.addEventListener("click", () => {
  setMenuState(!isMenuOpen);
});

setMenuState(false);
