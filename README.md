# 小二數學大冒險 🚀 翰林二上期中概念複習

[![Deploy to GitHub Pages](https://github.com/lucifer0427/grade2-math-midterm/actions/workflows/deploy.yml/badge.svg)](https://github.com/lucifer0427/grade2-math-midterm/actions/workflows/deploy.yml)

一套專為**臺灣 108 課綱國小二年級上學期（翰林版單元 1～5）**學童設計的純前端教學遊戲，部署於 **GitHub Pages**。

🔗 **線上遊玩網址**：[https://lucifer0427.github.io/grade2-math-midterm/](https://lucifer0427.github.io/grade2-math-midterm/)

---

## 🌟 核心特色（以教育心理學為本）

1. **落實 Bruner CPA 表徵架構（動詞即運算子）**：
   * **C (具象)**：實體硬幣拖曳化聚、十位「破十槌」敲碎硬幣、L 型直角卡規吸附、斷尺跳格筆。
   * **P (圖像)**：三色位值定位板、條形圖（Bar Model）、跳格弧線、直式黑板。
   * **A (抽象)**：差量公式、直式借位劃記、等式與大小比較符號。
2. **蘇格拉底三階引導式教學（拒絕刺耳報錯與直接給答案）**：
   * **Level 1（知覺澄清）**：提問觀察矛盾（「緞帶最左邊有乖乖對齊 0 嗎？」）。
   * **Level 2（操作鷹架）**：啟動互動輔助工具（解鎖跳格筆或破十槌）。
   * **Level 3（算則收斂）**：推導本質差量公式。
3. **通關後設認知反思（Metacognition Checkpoint）**：
   * 每題完成後進行 5 秒概念反思（「為什麼不能選 13 公分？」），答對解鎖「思維勳章」。
4. **低年級無障礙與平板友善體驗**：
   * **語音朗讀 (TTS)**：原生 `Web Speech API` 中文女聲朗讀題幹與引導，消弭識字不足障礙。
   * **自體合成音效 (SFX)**：原生 `Web Audio API` 即時振盪器生成點擊音、金幣聲與通關號角，零外部音檔依賴。
   * **觸控防呆**：大按鈕尺寸（$\ge 56\text{px}$），鎖定單指與禁止多餘縮放。

---

## 🗺️ 五大關卡與課綱指標對照

| 關卡 ID | 單元名稱 | 課綱指標 | 核心題型與機制 |
| :--- | :--- | :--- | :--- |
| **G1** | 200 以內的數 | **N-2-1** | **阿翰的零錢罐**：14個1元化聚為1個十與4個一；18個10元化聚為180；定位板動態聯動與大小比較天平。 |
| **G2** | 二位數加減法 | **N-2-2** | **算式破譯官**：墨水污漬算式（`甲3 - 2乙 = 38`）；強制破十拆碎與抓蟲特工。 |
| **G3** | 公分（長度測量）| **N-2-11** | **小齊的斷尺大冒險**：刻度 4～15 殘尺；端點非零實測；逆向端點推算（起點 7 畫 6 公分線段）。 |
| **G4** | 兩步驟加減混合 | **N-2-3** | **跳蚤市場採購員**：故事書/彩色筆採購；計算中間消費量 $\to$ 計算找零；妹妹預算評估天平。 |
| **G5** | 平面圖形與直線 | **S-2-1** | **幾何巡邏隊**：具備端點的直線繪製；L 型直角量規檢驗；四邊等長測量；破除正方形旋轉 45° 視為菱形之偏誤。 |

---

## 🛠️ 技術棧

* **核心框架**：React 18 + TypeScript + Vite
* **樣式排版**：Tailwind CSS + Lucide React
* **動畫與拖曳**：Framer Motion + Canvas Confetti
* **部署標的**：GitHub Pages（GitHub Actions CI/CD 自動構建）

---

## 🚀 本地開發指引

```bash
# 1. 複製專案
git clone https://github.com/lucifer0427/grade2-math-midterm.git
cd grade2-math-midterm

# 2. 安裝依賴
pnpm install
# 或 npm install

# 3. 啟動本機開發伺服器
pnpm dev
# 或 npm run dev

# 4. 編譯檢查
pnpm build
# 或 npm run build
```
