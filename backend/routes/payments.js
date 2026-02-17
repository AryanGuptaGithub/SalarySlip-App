const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

// Get all payments
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    const query = {};
    
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('employeeId', 'name email designation')
      .populate('salarySlipId')
      .sort({ paymentDate: -1 });
      
    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single payment
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('employeeId')
      .populate('salarySlipId');
      
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payment record
router.post('/', auth, async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    await payment.populate('employeeId');

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;