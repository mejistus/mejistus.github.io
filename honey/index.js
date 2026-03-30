// 获取元素和初始配置
let selectors = {
  id: document.querySelector("#shell"),
  item: document.querySelectorAll("#shell .item"),
  activeClass: "item--active",
  img: ".img",
};

// 激活指定项（不强制滚动）
function setActiveItem(index) {
  selectors.item.forEach((item) =>
    item.classList.remove(selectors.activeClass),
  );
  selectors.item[index].classList.add(selectors.activeClass);
}

// 初始激活第一项
setActiveItem(0);

// 用 IntersectionObserver 监听哪个 item 进入视口中心区域
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Array.from(selectors.item).indexOf(entry.target);
        if (index !== -1) {
          setActiveItem(index);
        }
      }
    });
  },
  {
    // 当 item 进入视口中间 40% 区域时触发
    rootMargin: "-30% 0px -30% 0px",
    threshold: 0.1,
  },
);

selectors.item.forEach((item) => observer.observe(item));
