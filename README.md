# 會議室預約系統

這是一個現代化的會議室預約系統，提供直觀的使用者介面和完整的預約管理功能。使用 Next.js 14 和 TypeScript 開發，並整合了現代化的 UI 組件。

## 功能特點

1. 會議室管理

   - 完整的會議室列表展示
   - 詳細的會議室資訊（位置、容納人數、設施配備等）
   - 高質量的會議室圖片展示
   - 即時的預約狀態顯示

2. 預約系統

   - 直觀的日期選擇（支援 30 天內預約）
   - 彈性的時段選擇（全天 24 小時時段）
   - 即時預約狀態查詢
   - 預約確認和取消功能

3. 使用者系統

   - 會員註冊和登入
   - 個人預約管理
   - 預約歷史記錄查看
   - 管理員專用功能

4. 介面設計
   - 響應式設計，支援各種裝置
   - 現代化的 UI/UX 設計
   - 無障礙設計支援
   - 直觀的操作流程

## 技術架構

### 前端技術

- Next.js 15.2.2
- React 19.0.0
- TypeScript
- Tailwind CSS
- Shadcn/ui 組件庫

### 後端技術

- Next.js API Routes
- MongoDB 資料庫
- NextAuth.js 身份驗證

### 開發工具

- ESLint
- TypeScript
- PNPM 套件管理器

## 開始使用

1. 安裝依賴：

```bash
pnpm install
```

2. 設定環境變數：
   建立 `.env.local` 檔案並設定以下變數：

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
MONGODB_URI=your_mongodb_uri
```

3. 啟動開發伺服器：

```bash
pnpm dev
```

4. 開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 部署說明

本專案可以輕鬆部署到 Vercel 平台：

1. Fork 本專案到你的 GitHub
2. 在 Vercel 中導入專案
3. 設定環境變數
4. 部署完成

## 系統需求

- Node.js 18.0 或更高版本
- PNPM 8.0 或更高版本
- MongoDB 4.4 或更高版本

## 專案結構

```
booking-room/
├── src/
│   ├── app/                 # Next.js 13+ App Router
│   ├── components/          # React 組件
│   ├── lib/                 # 工具函數和共用邏輯
│   └── types/              # TypeScript 型別定義
├── public/                  # 靜態資源
└── package.json            # 專案配置
```

## 開發指南

### 程式碼規範

- 使用 ESLint 進行程式碼品質控制
- 遵循 TypeScript 嚴格模式
- 使用 Prettier 進行程式碼格式化

### 提交規範

提交訊息格式：

```
<type>: <description>

[optional body]
```

Type 類型：

- feat: 新功能
- fix: 錯誤修復
- docs: 文件更新
- style: 程式碼格式修改
- refactor: 重構
- test: 測試相關
- chore: 建置過程或輔助工具的變動

## 授權協議

本專案採用 MIT 授權協議。詳見 [LICENSE](LICENSE) 檔案。

## 貢獻指南

1. Fork 本專案
2. 建立特性分支
3. 提交變更
4. 發起 Pull Request

歡迎任何形式的貢獻，包括但不限於：

- 功能改進
- 錯誤修復
- 文件更新
- 使用者介面優化

## 聯絡方式

如有任何問題或建議，歡迎透過以下方式聯繫：

- 提交 Issue
- 發起 Pull Request
- 電子郵件：[your-email@example.com]

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# bookingRoom
