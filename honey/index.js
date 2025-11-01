// 获取元素和初始配置
let selectors = {
  id: document.querySelector("#shell"),
  item: document.querySelectorAll("#shell .item"),
  activeClass: "item--active",
  img: ".img",
};

let currentIndex = 0;
let isScrolling = false;
let accumulatedDelta = 10;
const scrollThreshold = 30;
// 项目总数
let timeLength = selectors.item.length;

function setActiveItem(index) {
  if (selectors.item[index].classList.contains(selectors.activeClass)) return;
  selectors.item.forEach((item) =>
    item.classList.remove(selectors.activeClass),
  );
  selectors.item[index].classList.add(selectors.activeClass);

  const targetImage = selectors.item[index]
    .querySelector(selectors.img)
    .getAttribute("src");
  selectors.id.style.backgroundImage = `url(${targetImage})`;
  window.scrollTo({
    top: selectors.item[index].offsetTop,
    behavior: "smooth",
  });
}

setActiveItem(0);

window.addEventListener("wheel", (event) => {
  if (isScrolling) return;
  accumulatedDelta += event.deltaY;
  if (Math.abs(accumulatedDelta) > scrollThreshold) {
    if (accumulatedDelta > 0 && currentIndex < timeLength - 1) {
      currentIndex++;
    } else if (accumulatedDelta < 0 && currentIndex > 0) {
      currentIndex--;
    }

    setActiveItem(currentIndex);

    accumulatedDelta = 0;
    isScrolling = true;

    setTimeout(() => (isScrolling = false), 300);
  }
});
