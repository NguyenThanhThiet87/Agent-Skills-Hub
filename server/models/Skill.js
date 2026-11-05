import mongoose from 'mongoose';

const ParameterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'string' },
  defaultValue: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General',
    index: true
  },
  trigger: {
    type: String,
    enum: ['on_demand', 'always_on'],
    default: 'on_demand'
  },
  description: {
    type: String,
    default: ''
  },
  parameters: [ParameterSchema],
  content: {
    type: String,
    required: true
  },
  rawMarkdown: {
    type: String,
    required: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  stats: {
    invocations: { type: Number, default: 0 },
    lastInvokedAt: { type: Date }
  }
}, {
  timestamps: true
});

export const SkillModel = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
