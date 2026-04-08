let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  const phone = document.querySelector(".phone");
  const space = document.querySelector(".about-us")

  if (currentScroll > lastScroll) {
    // scrolling down → play animation
    phone.classList.add("animate");
  } else {
    phone.classList.add("pause");
    space.classList.add("pause");
    // scrolling up → KEEP final state (do nothing)
  }

  lastScroll = currentScroll;
});