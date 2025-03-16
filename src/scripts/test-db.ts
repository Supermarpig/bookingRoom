import { config } from 'dotenv';
import path from 'path';
import connectDB from '../lib/mongodb';
import Room from '../models/Room';
import mongoose from 'mongoose';

// 載入 .env.local 文件
config({ path: path.resolve(process.cwd(), '.env.local') });

const initialRooms = [
  {
    name: "大型會議室 A",
    capacity: 20,
    imageUrl: "https://picsum.photos/1200/800?random=1",
    facilities: ["投影機", "WiFi", "白板"],
    description: "寬敞明亮的大型會議室，配備高清投影設備和完整的會議系統，適合舉辦大型會議、培訓或演講。",
    location: "3樓 301室",
    area: "50平方米",
    hourlyRate: 1000,
  },
  {
    name: "中型會議室 B",
    capacity: 12,
    imageUrl: "https://picsum.photos/1200/800?random=2",
    facilities: ["電視螢幕", "WiFi", "白板"],
    description: "舒適實用的中型會議室，配備大型顯示器，適合小組會議和討論。",
    location: "2樓 201室",
    area: "30平方米",
    hourlyRate: 800,
  },
  {
    name: "小型會議室 C",
    capacity: 6,
    imageUrl: "https://picsum.photos/1200/800?random=3",
    facilities: ["WiFi", "白板"],
    description: "溫馨簡約的小型會議室，適合小組討論和面試使用。",
    location: "2樓 202室",
    area: "15平方米",
    hourlyRate: 500,
  },
];

async function initDatabase() {
  try {
    console.log('正在連接到 MongoDB...');
    await connectDB();
    console.log('成功連接到 MongoDB！');

    // 清空現有的會議室數據
    console.log('\n清空現有的會議室數據...');
    await Room.deleteMany({});
    console.log('成功清空會議室數據');

    // 插入初始會議室數據
    console.log('\n插入初始會議室數據...');
    const rooms = await Room.insertMany(initialRooms);
    console.log('成功插入初始會議室數據：', rooms);

    console.log('\n資料庫初始化完成！');
  } catch (error) {
    console.error('初始化資料庫時發生錯誤：', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n已關閉資料庫連接');
    process.exit();
  }
}

initDatabase(); 