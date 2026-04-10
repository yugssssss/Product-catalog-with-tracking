const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:       { type: [itemSchema], validate: [(a) => a.length > 0, 'At least one item required'] },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'shipped', 'delivered'],
      default: 'pending',
    },
    statusHistory: [
      {
        status:    String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
