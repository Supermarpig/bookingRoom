import mongoose, { Document, Schema, Model } from 'mongoose';

// 定義 Room 的介面
export interface IRoom extends Document {
  name: string;
  capacity: number;
  imageUrl: string;
  facilities: string[];
  description: string;
  location: string;
  area: string;
  hourlyRate: number;
  availableTimeSlots: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 定義靜態方法的介面
interface IRoomModel extends Model<IRoom> {
  findByIdWithDebug(id: string): Promise<IRoom | null>;
}

const roomSchema = new Schema<IRoom>({
  name: {
    type: String,
    required: [true, '會議室名稱不能為空'],
    trim: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, '容納人數必須為正整數'],
    min: [1, '容納人數必須大於0']
  },
  imageUrl: {
    type: String,
    required: [true, '必須提供圖片URL']
  },
  facilities: [{
    type: String,
    required: [true, '至少需要一項設施']
  }],
  description: {
    type: String,
    required: [true, '描述不能為空']
  },
  location: {
    type: String,
    required: [true, '位置不能為空']
  },
  area: {
    type: String,
    required: [true, '面積不能為空']
  },
  hourlyRate: {
    type: Number,
    required: [true, '每小時收費必須為正數'],
    min: [0, '每小時收費必須為正數']
  },
  availableTimeSlots: {
    type: [{ type: String }],
    required: true,
    validate: {
      validator: function(v: string[]) {
        if (!Array.isArray(v) || v.length === 0) return false;
        return v.every(timeSlot => /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(timeSlot));
      },
      message: '時段格式必須為 HH:MM-HH:MM，且至少需要一個時段'
    }
  }
}, {
  timestamps: true,
  strict: true
});

// 添加 pre-validate 中間件進行驗證
roomSchema.pre('validate', function(next) {
  // 驗證 availableTimeSlots 是否為非空陣列
  if (!this.availableTimeSlots || !Array.isArray(this.availableTimeSlots) || this.availableTimeSlots.length === 0) {
    next(new Error('至少需要一個可用時段'));
    return;
  }
  next();
});

// 添加調試用的中間件
roomSchema.pre('save', function(next) {
  console.log('=== pre-save 中間件 ===');
  console.log('this:', this.toObject());
  console.log('availableTimeSlots:', this.availableTimeSlots);
  next();
});

roomSchema.post('save', function(doc) {
  console.log('=== post-save 中間件 ===');
  console.log('saved document:', doc.toObject());
  console.log('saved availableTimeSlots:', doc.availableTimeSlots);
});

// 確保在轉換為 JSON 時包含所有字段
roomSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// 添加調試用的靜態方法
roomSchema.statics.findByIdWithDebug = async function(id: string) {
  console.log('=== findByIdWithDebug ===');
  const doc = await this.findById(id);
  console.log('found document:', doc ? doc.toObject() : null);
  return doc;
};

const Room = mongoose.models.Room || mongoose.model<IRoom, IRoomModel>('Room', roomSchema);
export default Room; 