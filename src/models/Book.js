const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure availableQuantity defaults to quantity if not set
bookSchema.pre('validate', function (next) {
  if (this.isNew && (this.availableQuantity === undefined || this.availableQuantity === null)) {
    this.availableQuantity = this.quantity;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
