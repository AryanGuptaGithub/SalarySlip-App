const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const SalarySlip = require('../models/SalarySlip');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Total employees
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    
    // Total payments this month
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: new Date(currentYear, currentDate.getMonth(), 1),
            $lt: new Date(currentYear, currentDate.getMonth() + 1, 1)
          },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalPaymentsThisMonth = monthlyPayments[0]?.total || 0;

    // Pending salary slips
    const pendingSalarySlips = await SalarySlip.countDocuments({ status: 'Pending' });

    // Recent payments (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPayments = await Payment.find({
      paymentDate: { $gte: sixMonthsAgo }
    })
      .populate('employeeId', 'name')
      .sort({ paymentDate: -1 })
      .limit(10);

    // Payment trends (last 6 months)
    const paymentTrends = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: sixMonthsAgo },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$paymentDate' },
            year: { $year: '$paymentDate' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = paymentTrends.map(item => ({
      month: months[item._id.month - 1],
      amount: item.total,
      count: item.count
    }));

    res.json({
      stats: {
        totalEmployees,
        totalPaymentsThisMonth,
        pendingSalarySlips,
        activeEmployees: totalEmployees
      },
      recentPayments,
      chartData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;