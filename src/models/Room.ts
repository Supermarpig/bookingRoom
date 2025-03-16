import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '會議室名稱不能為空'],
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, '容納人數必須為正整數'],
    min: [1, '容納人數必須大於0'],
  },
  imageUrl: {
    type: String,
    required: [true, '必須提供圖片URL'],
  },
  facilities: {
    type: [String],
    required: [true, '至少需要一項設施'],
    validate: {
      validator: function(v: string[]) {
        return v.length > 0;
      },
      message: '至少需要一項設施'
    }
  },
  description: {
    type: String,
    required: [true, '描述不能為空'],
  },
  location: {
    type: String,
    required: [true, '位置不能為空'],
  },
  area: {
    type: String,
    required: [true, '面積不能為空'],
  },
  hourlyRate: {
    type: Number,
    required: [true, '每小時收費必須為正數'],
    min: [0, '每小時收費必須為正數'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Room || mongoose.model('Room', roomSchema); 