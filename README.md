# 🎓 教育平台 H5 專案

一個基於 Vue 3 + TypeScript 的響應式教育平台，支援手機和桌面設備。

## 🚀 快速開始

### 系統需求
- Node.js 16+ 
- npm 8+
- Supabase 帳號（免費版即可）

### 📋 步驟一：獲取 Supabase 連接資訊

1. **註冊 Supabase 帳號**
   - 前往 [Supabase 官網](https://supabase.com)
   - 點擊 "Start your project"
   - 選擇 "Organization" 或 "Personal"
   - 填寫項目名稱（例如：education-platform）
   - 設定資料庫密碼（務必記住）
   - 選擇區域（建議選擇亞洲地區）
   - 點擊 "Create new project"

2. **獲取連接資訊**
   - 進入你的項目後，點擊左上角選單
   - 選擇 "Settings" → "API"
   - 複製 **Project URL**（這是你的 `SUPABASE_URL`）
   - 向下找到 "Project API keys" 部分
   - 複製 **anon public key**（這是你的 `SUPABASE_ANON_KEY`）

### 📋 步驟二：設定環境變數

1. **複製環境變數範本**
   ```bash
   cp .env.example .env
   ```

2. **編輯 .env 檔案**
   打開 `.env` 檔案，填入你的 Supabase 資訊：
   ```env
   # Supabase 配置
   VITE_SUPABASE_URL=https://你的項目ID.supabase.co
   VITE_SUPABASE_ANON_KEY=你的-anon-key-在這裡

   # 開發環境配置
   VITE_APP_TITLE=教育平台
   VITE_APP_ENV=development
   ```

   **注意：**
   - `VITE_SUPABASE_URL`：從 Supabase Settings → API 複製的 Project URL
   - `VITE_SUPABASE_ANON_KEY`：從 Supabase Settings → API 複製的 anon public key

### 📋 步驟三：安裝依賴

```bash
# 進入專案目錄
cd education-h5

# 安裝所有依賴套件
npm install
```

### 📋 步驟四：啟動開發伺服器

```bash
# 啟動開發伺服器
npm run dev
```

啟動後會顯示一個本地 URL（通常是 `http://localhost:5173`），在瀏覽器中開啟即可看到專案。

## 📁 專案結構

```
education-h5/
├── public/                 # 靜態資源
├── src/
│   ├── components/         # 公共組件
│   ├── lib/               # 工具函數和 API 封裝
│   │   └── supabase.ts    # Supabase 客戶端
│   ├── pages/             # 頁面組件
│   │   ├── Home.vue       # 首頁（課程列表）
│   │   └── Course.vue     # 課程詳情頁
│   ├── router/            # 路由配置
│   ├── store/             # Pinia 狀態管理
│   │   ├── index.ts       # Pinia 配置
│   │   └── learning.ts    # 學習進度管理
│   ├── App.vue            # 根組件
│   └── main.ts            # 入口檔案
├── postcss.config.js      # PostCSS 配置
├── .env.example           # 環境變數範本
└── README.md             # 說明文件
```

## 🎨 技術棧

- **前端框架**：Vue 3 + TypeScript
- **構建工具**：Vite
- **UI 組件庫**：Vant（移動端優先）
- **狀態管理**：Pinia
- **路由**：Vue Router
- **資料庫**：Supabase（PostgreSQL）
- **CSS 預處理**：PostCSS + px-to-viewport

## 📱 功能特色

### 🎯 核心功能
- **響應式設計**：完美支援手機和桌面設備
- **學習進度追踪**：自動保存學習進度到 Supabase
- **多媒體支持**：文字、影片、測驗多種學習形式
- **防作弊機制**：影片必須觀看指定比例才能繼續

### 📚 學習模式
1. **封面模式**：課程介紹和開始學習
2. **文字模式**：圖文內容展示（支援簡單 Markdown）
3. **影片模式**：影片播放器，防止快進
4. **測驗模式**：單選題測驗，答對才能繼續

## 🚀 部署指南

### 📋 步驟一：推送到 GitHub

1. **建立 GitHub 倉庫**
   - 登入 [GitHub](https://github.com)
   - 點擊 "New repository"
   - 填寫倉庫名稱（例如：education-h5）
   - 設定為 Public（免費版）
   - 點擊 "Create repository"

2. **初始化 Git 倉庫**
   ```bash
   # 在專案目錄中執行
   git init
   git add .
   git commit -m "feat: 初始化教育平台專案"
   ```

3. **關聯 GitHub 倉庫**
   ```bash
   # 將你的 GitHub 倉庫 URL 替換成實際的 URL
   git remote add origin https://github.com/你的用戶名/education-h5.git
   
   # 推送到 GitHub
   git push -u origin main
   ```

### 📋 步驟二：部署到 Vercel

1. **註冊 Vercel 帳號**
   - 前往 [Vercel 官網](https://vercel.com)
   - 使用 GitHub 帳號登入
   - 點擊 "New Project"

2. **匯入 GitHub 專案**
   - 選擇 "Import Git Repository"
   - 選擇你的 `education-h5` 倉庫
   - 點擊 "Import"

3. **設定環境變數**
   - 在 "Environment Variables" 區塊，添加以下變數：
     ```
     VITE_SUPABASE_URL=https://你的項目ID.supabase.co
     VITE_SUPABASE_ANON_KEY=你的-anon-key-在這裡
     ```
   - 點擊 "Deploy"

4. **部署完成**
   - Vercel 會自動構建並部署你的專案
   - 部署完成後會給你一個 URL（例如：`https://education-h5.vercel.app`）

### 📋 步驟三：上傳影片到 Supabase Storage

1. **進入 Supabase Dashboard**
   - 登入 [Supabase 官網](https://supabase.com)
   - 點擊你的項目

2. **開啟 Storage**
   - 在左側選單中點擊 "Storage"
   - 點擊 "New bucket"

3. **建立儲存桶**
   - Bucket name：`videos`（或你喜歡的名稱）
   - Public：勾選 "Make public"（這樣影片才能被訪問）
   - 點擊 "Save"

4. **上傳影片**
   - 點擊剛剛建立的 bucket
   - 點擊 "Upload" 按鈕
   - 選擇要上傳的影片檔案
   - 上傳後複製檔案的 URL

5. **更新課程內容**
   - 在 Supabase SQL Editor 中執行 UPDATE 語句，將影片 URL 更新到 lessons 表
   ```sql
   UPDATE lessons 
   SET content = '{"title": "影片標題", "video_url": "https://你的項目ID.supabase.co/storage/v1/object/public/videos/影片檔名.mp4"}' 
   WHERE id = '你的章節ID';
   ```

## 🔧 常見問題

### Q: 如何修改課程內容？
A: 直接在 Supabase 的 SQL Editor 中執行 UPDATE 語句來修改 courses 和 lessons 表的內容。

### Q: 影片無法播放？
A: 確保：
1. Storage bucket 設定為 Public
2. 影片 URL 格式正確
3. 影片檔案已成功上傳

### Q: 進度沒有保存？
A: 檢查：
1. .env 檔案中的 Supabase URL 和 Key 是否正確
2. 用戶郵箱格式是否正確
3. Supabase 中的 learning_progress 表是否有數據

### Q: 如何自訂樣式？
A: 修改各組件中的 `<style>` 樣式，專案使用 PostCSS + px-to-viewport，會自動將 px 轉換為 vw 單位。

## 📞 技術支持

如果遇到問題，請檢查：
1. [Supabase 官方文件](https://supabase.com/docs)
2. [Vue 3 官方文件](https://vuejs.org/)
3. [Vant UI 文件](https://vant-contrib.gitee.io/vant/#/home)
4. [Vercel 部署文件](https://vercel.com/docs)

## 📄 授權

MIT License

---

🎉 **恭喜！你的教育平台已經成功部署！** 🎉