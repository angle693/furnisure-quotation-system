// backend/routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Counter = require('../models/Counter');

// Helper: Get next sequence number
const getNextSequence = async (name) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

// POST /api/quotations — Create
router.post('/', async (req, res) => {
  try {
    const { quotationDate, billTo, items, subtotal, cgstAmount, grandTotal } = req.body;
    if (!quotationDate || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const date = new Date(quotationDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    let fyStart, fyEnd;
    if (month >= 3) {
      fyStart = (year % 100).toString().padStart(2, '0');
      fyEnd = ((year + 1) % 100).toString().padStart(2, '0');
    } else {
      fyStart = ((year - 1) % 100).toString().padStart(2, '0');
      fyEnd = (year % 100).toString().padStart(2, '0');
    }
    const fySuffix = `${fyStart}-${fyEnd}`;

    const seq = await getNextSequence('quotation');
    const sequenceStr = seq.toString().padStart(4, '0');
    const quotationNumber = `CE${sequenceStr}-${fySuffix}`;

    const newQuotation = new Quotation({
      quotationNumber,
      quotationDate,
      billTo,
      items,
      subtotal,
      cgstAmount,
      grandTotal
    });

    await newQuotation.save();
    res.status(201).json(newQuotation);
  } catch (error) {
    console.error('Error saving quotation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/quotations — List all
router.get('/', async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/quotations/:id — Update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quotationDate, billTo, items, subtotal, cgstAmount, grandTotal } = req.body;

    const updated = await Quotation.findByIdAndUpdate(id, {
      quotationDate,
      billTo,
      items,
      subtotal,
      cgstAmount,
      grandTotal
    }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/quotations/:id — Delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Quotation.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;