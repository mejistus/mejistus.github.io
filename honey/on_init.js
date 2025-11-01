function wrapper(data_text, img_src, content_title, content_desc) {
  return `
      <div class="item" data-text="${data_text}">
      <div class="content">
        <img src="${img_src}" alt="" class="img">
        <h2 class="content-title">${content_title}</h2>
        <p class="content-desc">
          ${content_desc}
        </p>
      </div>
      </div>
  `;
}
function createChild() {
  let box = document.querySelector(".timeline");
  const arr = [
    ["ゴメンね素直じゃなくて", "./asserts/cropped512/1.jpg", "1", "抱歉 口是心非的我"],
    ["梦の中なら云える", "./asserts/cropped512/2.jpg", "2", "只敢在梦中向你坦白"],
    ["思考回路はショート寸前", "./asserts/cropped512/3.jpg", "3", "头脑差点就要短路"],
    ["今すぐ会いたいよ", "./asserts/cropped512/4.jpg", "4", "好想马上见到你~"],
    ["泣きたくなるような moonlight", "./asserts/cropped512/5.jpg", "5", "在婉若哭泣的月光之下"],
    ["电话も出来ない midnight", "./asserts/cropped512/6.jpg", "6", "在电话前徘徊到深夜"],
    ["だって纯情 どうしよう", "./asserts/cropped512/7.jpg", "7", "纯情的我该如何是好"],
    ["ハートは万华镜", "./asserts/cropped512/8.jpg", "8", "心儿好似万花筒"],
    ["月の光に导かれ", "./asserts/cropped512/9.jpg", "9", "依循月光的指引"],
    ["何度も 巡り会う", "./asserts/cropped512/10.jpg", "10", "一次次与你相遇"],
    ["星座の瞬き数え", "./asserts/cropped512/11.jpg", "11", "细数闪烁的星辰"],
    ["占う恋の行方", "./asserts/cropped512/12.jpg", "12", "占卜恋爱的结果"],
    ["同じ地球に生まれたの", "./asserts/cropped512/13.jpg", "13", "我们生在同一国度"],
    ["ミラクル ロマンス", "./asserts/cropped512/14.jpg", "14", "多么不可思议的罗曼史!"],
    ["几千万の星から", "./asserts/cropped512/15.jpg", "15", "在满天繁星之中"],
    ["あなたを见つけられる", "./asserts/cropped512/16.jpg", "16", "有幸与你相遇"],
    ["出会ったときの懐かしい", "./asserts/cropped512/17.jpg", "17", "深深怀念初次的相逢"],
    ["まなざし忘れない", "./asserts/cropped512/18.jpg", "18", "难以忘却你的目光"],
    ["も一度 ふたりで weekend", "./asserts/cropped512/19.jpg", "19", "好想再一次与你共度周末"],
    ["神さま かなえて happy-end", "./asserts/cropped512/20.jpg", "20", "神啊 请赐予我完美的结局!"],
    ["现在 过去 未来も", "./asserts/cropped512/21.jpg", "21", "无论过去 现在 或将来"],
    ["あなたに首いったて", "./asserts/cropped512/22.jpg", "22", "我只为你而痴狂"],
    ["文，生日快乐！", "./asserts/cropped512/23.jpg", "23", "永永远远~开开心心~"],
  ];
  for (let i = 0; i < arr.length; i++) {
    box.innerHTML += wrapper(...arr[i]);
  }
  // window.scrollTo(0, 0);
}
createChild();
let box = document.querySelector(".timeline");
box.innerHTML += `
  <div class="item">
    <div class="content" style="display:flex;flex-direction:column;align-items:center;">
      <img src="./asserts/2025.jpg" alt="" class="img" style="max-width:100%;height:auto;">
      <div class="player-card">
        <div class="separator"></div>
        <div class="audio-box">
          <button class="btn-audio prev"  onclick="prevSong()" aria-label="上一首">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 5h2v14H6zM20 12L10 18V6l10 6z"/>
            </svg>
          </button>
          <button class="btn-audio play"  onclick="playSong()" aria-label="播放/暂停">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button class="btn-audio next"  onclick="nextSong()" aria-label="下一首">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 5h2v14h-2zM4 12l10 6V6L4 12z"/>
            </svg>
          </button>
        </div>
        <div id="current-song">Ready</div>
      </div>
    </div>
  </div>
`;
box.lastElementChild.style.alignSelf = "center";
let audioBox = document.querySelector(".audio-box");
audioBox.style.display = "flex";
audioBox.style.justifyContent = "center";
audioBox.style.alignItems = "center";
audioBox.style.gap = "15px";
audioBox.style.marginTop = "20px";
let button = document.querySelectorAll(".audio");
for (let i = 0; i < button.length; i++) {
  button[i].style.alignSelf = "center";
  button[i].style.border = "1px solid #000";
  button[i].style.borderRadius = "5px";
  button[i].style.width = "60px";
  button[i].style.height = "30px";
  button[i].style.opacity = "0.5";
}
document.getElementById("current-song").style.textAlign = "center";
document.getElementById("current-song").style.fontSize = "18px";
document.getElementById("current-song").style.fontStyle = "normal";
document.getElementById("current-song").style.margin = "10px 10px";
