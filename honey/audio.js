let currentSongIndex = 0;
let textScore = "";
const songList = [
    { name: "Happy Birthday To You", file: "happybirthday.txt" },
    { name: "Poem of Bird", file: "poemOfBird.txt" },
    { name: "Stage of World", file: "worldStage.txt" },
];
const songData = {
    "happybirthday.txt": `
0[[55]65]['17--]*|
[[55]65]['2'1--]*|
[[55]'5'3]['1{7]6}|
[['4'4]'3'1]['2{'1]'1}|

[[55]65]['17--]*|
[[55]65]['2'1--]*|
[[55]'5'3*]['1{7]6}|
[['4'4]'3'1*]'2{'1}|
  `,
    "poemOfBird.txt": `
0[0].6.7[15]|
3[3[2{3]]3}-|
0[23][51][.71]|
.7[.7[.6{.3]].3}-|
0[0].6.7[15]|
3[3[2{3]]3}-|

0[23][53][5'1]|
[7*[{6][6}{3]3}[02]|
3567|
3[3[2{3]]3}-|
0[23][51][.71]|
.7[.7[.6{.3]].3}-|

0[0].6[.7][15]|
3[3[2{3]]3}-|
0[23][53][5'1]|
{7-[7}6]|
6---|
  `,
    "worldStage.txt": `
[3-3*{[4]][4}6][3*{[2]][2}123732*1---*]|
[02][12][3.7][57][76][6[5]]6*|
[6]'3{['36]}'17|
'2['25][7*[6]]6-
['3['1'1]{{'1--]['1*]}
'3-}'3-'1----
  `,
};
class MusicBox {
    constructor() {
        this.audioCtx = new (window.AudioContext ||
            window.webkitAudioContext)();
        this.opts = {
            type: "sine", // 波形类型
            volume: 0.4, // 音量
            duration: 5.21, // 默认音符持续时间
            mixing: true, // 是否混合三和弦
        };

        this.arrFrequency = [
            { id: 0, note: "C2", value: 65.405 },
            { id: 1, note: "C#2", value: 69.3 },
            { id: 2, note: "D2", value: 73.415 },
            { id: 3, note: "D#2", value: 77.78 },
            { id: 4, note: "E2", value: 82.405 },
            { id: 5, note: "F2", value: 87.305 },
            { id: 6, note: "F#2", value: 92.5 },
            { id: 7, note: "G2", value: 98.0 },
            { id: 8, note: "G#2", value: 103.83 },
            { id: 9, note: "A2", value: 110.0 },
            { id: 10, note: "A#2", value: 116.54 },
            { id: 11, note: "B2", value: 123.47 },
            { id: 12, note: "C3", value: 130.81 },
            { id: 13, note: "C#3", value: 138.59 },
            { id: 14, note: "D3", value: 146.83 },
            { id: 15, note: "D#3", value: 155.56 },
            { id: 16, note: "E3", value: 164.81 },
            { id: 17, note: "F3", value: 174.61 },
            { id: 18, note: "F#3", value: 185.0 },
            { id: 19, note: "G3", value: 196.0 },
            { id: 20, note: "G#3", value: 207.65 },
            { id: 21, note: "A3", value: 220.0 },
            { id: 22, note: "A#3", value: 233.08 },
            { id: 23, note: "B3", value: 246.94 },
            { id: 24, note: "C4", value: 261.63 },
            { id: 25, note: "C#4", value: 277.18 },
            { id: 26, note: "D4", value: 293.66 },
            { id: 27, note: "D#4", value: 311.13 },
            { id: 28, note: "E4", value: 329.63 },
            { id: 29, note: "F4", value: 349.23 },
            { id: 30, note: "F#4", value: 369.99 },
            { id: 31, note: "G4", value: 392.0 },
            { id: 32, note: "G#4", value: 415.3 },
            { id: 33, note: "A4", value: 440.0 },
            { id: 34, note: "A#4", value: 466.16 },
            { id: 35, note: "B4", value: 493.88 },
            { id: 36, note: "C5", value: 523.25 },
            { id: 37, note: "C#5", value: 554.37 },
            { id: 38, note: "D5", value: 587.33 },
            { id: 39, note: "D#5", value: 622.25 },
            { id: 40, note: "E5", value: 659.25 },
            { id: 41, note: "F5", value: 698.46 },
            { id: 42, note: "F#5", value: 739.99 },
            { id: 43, note: "G5", value: 783.99 },
            { id: 44, note: "G#5", value: 830.61 },
            { id: 45, note: "A5", value: 880.0 },
            { id: 46, note: "A#5", value: 932.33 },
            { id: 47, note: "B5", value: 987.77 },
            { id: 48, note: "C6", value: 1046.5 },
            { id: 49, note: "C#6", value: 1108.73 },
            { id: 50, note: "D6", value: 1174.66 },
            { id: 51, note: "D#6", value: 1244.51 },
            { id: 52, note: "E6", value: 1318.5 },
            { id: 53, note: "F6", value: 1396.92 },
            { id: 54, note: "F#6", value: 1479.98 },
            { id: 55, note: "G6", value: 1567.98 },
            { id: 56, note: "G#6", value: 1661.22 },
            { id: 57, note: "A6", value: 1760.0 },
            { id: 58, note: "A#6", value: 1864.66 },
            { id: 59, note: "B6", value: 1975.54 },
        ];
        // 生成音符列表
        this.arrNotes = this.arrFrequency.map((freq) => freq.note);
        this.activeOscillators = []; // 添加数组来跟踪所有活跃的振荡器
        this.activeGainNodes = []; // 添加
        this.activeTimeouts = []; // 添加数组来跟踪所有计时器
    }
    // 停止所有声音的方法
    stopAll() {
        // 清除所有计时器
        this.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
        this.activeTimeouts = [];

        // 清除进度显示
        // document.getElementById("progress").textContent = "当前播放：";

        const currentTime = this.audioCtx.currentTime;
        this.activeOscillators.forEach((osc) => {
            try {
                osc.stop(currentTime);
            } catch (e) {
                // 忽略已经停止的振荡器
            }
        });
        this.activeGainNodes.forEach((gain) => {
            gain.gain.cancelScheduledValues(currentTime);
            gain.gain.setValueAtTime(gain.gain.value, currentTime);
            gain.gain.linearRampToValueAtTime(0, currentTime + 0.1);
        });
        this.activeOscillators = [];
        this.activeGainNodes = [];
    }
    // 创建声音
    createSound(freq, duration = this.opts.duration) {
        let oscillator = this.audioCtx.createOscillator();
        let gainNode = this.audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.type = this.opts.type;
        oscillator.frequency.value = freq;
        gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(
            this.opts.volume,
            this.audioCtx.currentTime + 0.005,
        );
        oscillator.start(this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.005,
            this.audioCtx.currentTime + duration,
        );
        oscillator.stop(this.audioCtx.currentTime + duration);
    }


    playMultipleNotes(notes, duration) {
        notes.split(",").forEach((note) => {
            const freqObj = this.arrFrequency.find(
                (item) => item.note === note.trim(),
            );
            if (freqObj) {
                this.createSound(freqObj.value, duration);
            }
        });
    }


    playScore(score) {
        // 播放前先停止所有声音
        this.stopAll();
        let startTime = this.audioCtx.currentTime;
        // const progressElement = document.getElementById("progress");
        score.forEach(({ note, duration }, index) => {
            // 使用 setTimeout 来更新进度显示
            const timeoutId = setTimeout(() => {
                // progressElement.textContent = `当前播放：第 ${index + 1}/${score.length} 个音符 (${note})`;
            }, startTime * 1000);
            this.activeTimeouts.push(timeoutId);

            const notes = note.split(",");
            notes.forEach((n) => {
                // ... 现有的播放代码 ...
                const notes = note.split(",");
                notes.forEach((n) => {
                    const freqObj = this.arrFrequency.find(
                        (item) => item.note === n.trim(),
                    );
                    if (freqObj) {
                        const oscillator = this.audioCtx.createOscillator();
                        const gainNode = this.audioCtx.createGain();
                        // 将新创建的节点添加到跟踪数组中
                        this.activeOscillators.push(oscillator);
                        this.activeGainNodes.push(gainNode);
                        oscillator.connect(gainNode);
                        gainNode.connect(this.audioCtx.destination);

                        oscillator.type = this.opts.type;
                        oscillator.frequency.value = freqObj.value;
                        gainNode.gain.setValueAtTime(0, startTime);
                        gainNode.gain.linearRampToValueAtTime(
                            this.opts.volume,
                            startTime + 0.01,
                        );
                        gainNode.gain.exponentialRampToValueAtTime(
                            0.01,
                            startTime + duration,
                        );
                        oscillator.start(startTime);
                        oscillator.stop(startTime + duration);
                    }
                });
            });

            startTime += duration;
        });
        const endTimeoutId = setTimeout(() => {
            // progressElement.textContent = "播放结束";
        }, startTime * 1000);
        this.activeTimeouts.push(endTimeoutId);
    }
}

// 创建音乐盒
const musicBox = new MusicBox();

//musicBox.arrFrequency.forEach((freq) => {
//    const button = document.createElement("button");
//    button.textContent = freq.note;
//    button.onclick = () => musicBox.playMultipleNotes(freq.note, 0.5);
//    notesContainer.appendChild(button);
//});
// 包含多个音符的同时播放
// 5 6 6 8 7 8 7 8,  8 8 9 8 8

function parseScoreToSmoothScore(text, bias = "C4", t = 1.0) {
    const noteMap = {
        1: "C",
        2: "D",
        3: "E",
        4: "F",
        5: "G",
        6: "A",
        7: "B",
        0: "rest", // 新增休止符
    };

    const baseOctave = parseInt(bias.slice(-1), 10);
    const durationMap = {
        0: t, // 四分音符
        1: t / 2, // 八分音符
        2: t / 4, // 十六分音符
    };

    const lines = text.trim().split("\n");
    const body = lines;

    const smoothScore = [];
    let currentNote = null;
    let currentDuration = 0;
    let firstInSmooth = true;
    let isSmoothLine = false; // 是否在圆滑线内
    console.log(text);

    body.forEach((line) => {
        let bracketLevel = 0;

        for (let i = 0; i < line.length; i++) {
            let char = line[i];
            console.log(
                char,
                i,
                isSmoothLine,
                bracketLevel,
                currentNote,
                currentDuration,
            );

            if (char === "[") {
                bracketLevel += 1;
                continue;
            }
            if (char === "]") {
                bracketLevel -= 1;
                continue;
            }
            if (char === "*") {
                currentDuration *= 1.5;
                continue;
            }

            if (char === "{") {
                isSmoothLine = true;
                firstInSmooth = false;
                continue;
            }
            if (char === "}") {
                isSmoothLine = false;
                if (currentNote) {
                    smoothScore.push({
                        duration: currentDuration,
                        note: currentNote,
                    });
                    currentNote = null;
                    currentDuration = 0;
                }
                continue;
            }
            if (noteMap[char]) {
                let noteName = noteMap[char];
                let octaveAdjust = 0;

                // 检查是否为低音或高音区域
                if (line[i - 1] === ".") octaveAdjust = -1;
                if (line[i - 1] === "'") octaveAdjust = 1;

                // 最终音符
                let finalOctave =
                    noteName === "rest" ? "" : baseOctave + octaveAdjust;
                let note =
                    noteName === "rest"
                        ? noteName
                        : `${noteName}${finalOctave}`;

                // 基于括号层级设置时值
                let duration =
                    durationMap[bracketLevel] || t / Math.pow(2, bracketLevel);

                if (isSmoothLine) {
                    // 如果在圆滑线内，检查是否可以合并延音
                    if (currentNote === note && firstInSmooth) {
                        currentDuration += duration; // 相同音符延长时值
                    } else {
                        firstInSmooth = true;
                        if (currentNote) {
                            smoothScore.push({
                                duration: currentDuration,
                                note: currentNote,
                            });
                        }
                        currentNote = note;
                        currentDuration = duration;
                    }
                } else {
                    // 不在圆滑线内，直接加入音符
                    if (currentNote) {
                        smoothScore.push({
                            duration: currentDuration,
                            note: currentNote,
                        });
                    }
                    currentNote = note;
                    currentDuration = duration;
                }
            }

            if (char === "|") {
                // 小节线处理，清空当前音符
                if (currentNote) {
                    smoothScore.push({
                        duration: currentDuration,
                        note: currentNote,
                    });
                    currentNote = null;
                    currentDuration = 0;
                }
            }
        }
        // 处理每行结束时的剩余音符
        if (currentNote) {
            smoothScore.push({ duration: currentDuration, note: currentNote });
            currentNote = null;
            currentDuration = 0;
        }
    });
    return smoothScore;
}

// 加载歌曲
async function loadSong(index) {
    try {
        textScore = songData[songList[index].file];
        document.getElementById("current-song").textContent =
            `Current: ${songList[index].name}`;
        song = parseScoreToSmoothScore(textScore, "C4", 1);
    } catch (error) {
        console.error("加载:", error);
    }
}

// 切换到下一首歌
async function nextSong() {
    musicBox.stopAll(); // 切换前停止当前播放
    currentSongIndex = (currentSongIndex + 1) % songList.length;
    await loadSong(currentSongIndex);
    playSong();
}

// 切换到上一首歌
async function prevSong() {
    musicBox.stopAll(); // 切换前停止当前播放
    currentSongIndex =
        (currentSongIndex - 1 + songList.length) % songList.length;
    await loadSong(currentSongIndex);
    playSong();
}

// 页面加载时初始化第一首歌
window.addEventListener("DOMContentLoaded", () => {
    loadSong(currentSongIndex);
});

let song = parseScoreToSmoothScore(textScore, "C4", 1);
console.log("parseScoreToSmoothScore", song);

function playSong() {
    console.log(song);
    if (song) {
        musicBox.playScore(song);
    }
}

// 添加一些样式
const style = document.createElement("style");
style.textContent = `
  .controls {
    margin: 20px 0;
    display: flex;
    gap: 10px;
  }
  #current-song {
    margin: 10px 0;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

