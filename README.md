# 會議室預約系統

這是一個現代化的會議室預約系統，提供直觀的使用者介面和完整的預約管理功能。

## 功能特點

1. 會議室列表
   - 顯示所有可用的會議室
   - 每個會議室卡片顯示基本資訊
   - 使用隨機圖片增加視覺吸引力

2. 會議室詳情
   - 完整的會議室資訊展示
   - 設施配備清單
   - 容納人數和收費標準
   - 即時預約狀態查詢

3. 預約功能
   - 選擇預約日期（最多可預約 30 天內的時段）
   - 選擇預約時段（09:00-17:00，每小時一個時段）
   - 顯示已預約時段和預約者資訊
   - 預約成功後顯示確認訊息

4. 我的預約
   - 查看個人所有預約記錄
   - 預約狀態追蹤（即將到來、已完成、已取消）
   - 取消預約功能
   - 預約詳細資訊查看

## 技術架構

- 前端框架：Next.js 14
- UI 框架：Tailwind CSS
- 狀態管理：React Hooks
- API 路由：Next.js API Routes
- 程式碼規範：ESLint + TypeScript

## 操作流程

### 預約會議室
1. 在首頁瀏覽會議室列表
2. 點擊感興趣的會議室進入詳情頁
3. 在詳情頁填寫預約資訊：
   - 輸入預約者姓名
   - 輸入電子郵件
   - 選擇預約日期
   - 選擇預約時段
4. 點擊「立即預約」按鈕
5. 確認預約成功訊息

### 查看和管理預約
1. 點擊導航欄的「我的預約」
2. 查看所有預約記錄，包含：
   - 會議室名稱
   - 預約日期和時段
   - 預約狀態
   - 預約者資訊
3. 對於即將到來的預約：
   - 可以點擊「取消預約」
   - 確認取消操作
   - 查看更新後的預約列表

### 預約狀態說明
- 即將到來（藍色）：尚未進行的預約
- 已完成（綠色）：已使用的預約
- 已取消（紅色）：已取消的預約

## 開發說明

### 安裝依賴
```bash
npm install
```

### 開發環境運行
```bash
npm run dev
```

### 檢查程式碼規範
```bash
# 檢查 ESLint 錯誤
npm run lint

# 自動修復 ESLint 錯誤
npm run lint:fix
```

### 生產環境建置
```bash
npm run build
```

### 生產環境運行
```bash
npm start
```

## ESLint 規範說明

為確保程式碼品質，本專案使用 ESLint 進行程式碼規範檢查。主要規範包括：

1. TypeScript 相關規則
   - 強制使用型別定義
   - 避免使用 `any` 型別
   - 確保正確的型別推導

2. React 相關規則
   - 強制使用 React Hooks 的依賴陣列
   - 確保 key prop 的正確使用
   - 避免不必要的重新渲染

3. 程式碼風格規則
   - 一致的縮排和空格使用
   - 一致的引號使用
   - 一致的分號使用

4. 最佳實踐
   - 避免未使用的變數
   - 避免重複的 import
   - 確保適當的錯誤處理

## 常見 ESLint 錯誤處理

1. 未使用的變數
   ```typescript
   // 錯誤
   const unused = 'value';

   // 正確
   const used = 'value';
   console.log(used);
   ```

2. 缺少依賴陣列
   ```typescript
   // 錯誤
   useEffect(() => {
     fetchData(id);
   }, []); // 缺少 id 依賴

   // 正確
   useEffect(() => {
     fetchData(id);
   }, [id]);
   ```

3. 型別定義
   ```typescript
   // 錯誤
   const data = [];

   // 正確
   const data: string[] = [];
   ```

## 注意事項

1. 預約時段為每小時一個時段，從早上 9 點到下午 5 點
2. 只能預約未來 30 天內的時段
3. 不能預約已被他人預約的時段
4. 可以查看預約時段的預約者資訊
5. 只能取消「即將到來」的預約

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
