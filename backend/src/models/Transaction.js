const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['unlock', 'wallet_topup', 'refund', 'subscription'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'manual'],
    default: 'manual'
  },
  paymentId: String,
  paymentMethod: String, // 'card', 'wallet', 'netbanking', etc.
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  metadata: {
    description: String,
    receipt: String,
    notes: String
  },
  processedAt: Date,
  refundedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, type: 1 });
transactionSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
