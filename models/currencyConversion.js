import mongoose from 'mongoose';

const currencyConversionSchema = new mongoose.Schema({
  baseCurrency: {
    type: String,
    required: true
  },
  targetCurrency: {
    type: String,
    required: true
  },
  conversionRate: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const CurrencyConversion = mongoose.model('CurrencyConversion', currencyConversionSchema);

export default CurrencyConversion;
