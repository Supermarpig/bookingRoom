import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, '會議室ID不能為空'],
  },
  roomName: {
    type: String,
    required: [true, '會議室名稱不能為空'],
  },
  userId: {
    type: String,
    required: [true, '用戶ID不能為空'],
  },
  userName: {
    type: String,
    required: [true, '用戶名稱不能為空'],
  },
  userEmail: {
    type: String,
    required: [true, '用戶郵箱不能為空'],
    match: [/^\S+@\S+\.\S+$/, '請輸入有效的郵箱地址'],
  },
  date: {
    type: String,
    required: [true, '日期不能為空'],
    match: [/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD'],
  },
  timeSlot: {
    type: String,
    required: [true, '時段不能為空'],
    match: [/^\d{2}:\d{2}-\d{2}:\d{2}$/, '時段格式必須為 HH:MM-HH:MM'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  note: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

// 創建複合索引來確保同一時段不會被重複預約
bookingSchema.index({ roomId: 1, date: 1, timeSlot: 1 }, { unique: true });

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema); 