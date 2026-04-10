const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    price:       { type: Number, required: true, min: 0 },
    category:    { type: String, required: true, trim: true, lowercase: true },
    stock:       { type: Number, required: true, min: 0, default: 0 },
    images:      { type: [String], default: [] },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
