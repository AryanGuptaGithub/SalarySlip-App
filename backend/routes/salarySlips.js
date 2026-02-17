const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SalarySlip = require('../models/SalarySlip');
const Employee = require('../models/Employee');
const { auth, checkRole } = require('../middleware/auth');
const puppeteer = require('puppeteer');

// Get all salary slips
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    const query = {};
    
    if (employeeId) query.employeeId = employeeId;
    if (month) query.month = month;
    if (year) query.year = parseInt(year);

    const salarySlips = await SalarySlip.find(query)
      .populate('employeeId', 'name email designation department')
      .sort({ createdAt: -1 });
      
    res.json({ salarySlips });
  } catch (error) {
    console.error('Get salary slips error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single salary slip
router.get('/:id', auth, async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id)
      .populate('employeeId');
      
    if (!salarySlip) {
      return res.status(404).json({ error: 'Salary slip not found' });
    }
    
    res.json({ salarySlip });
  } catch (error) {
    console.error('Get salary slip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate salary slip
router.post('/',
  [auth, checkRole('Admin', 'Accountant')],
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('month').notEmpty().withMessage('Month is required'),
    body('year').isNumeric().withMessage('Year is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { employeeId, month, year, earnings, deductions } = req.body;

      // Check if employee exists
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Check if salary slip already exists
      const existing = await SalarySlip.findOne({ employeeId, month, year });
      if (existing) {
        return res.status(400).json({ error: 'Salary slip already exists for this month' });
      }

      // Calculate totals
      const earningsTotal = (earnings?.basic || employee.salary.basic) + 
                           (earnings?.allowances || employee.salary.allowances || 0) + 
                           (earnings?.bonus || 0);
      
      const deductionsTotal = (deductions?.tax || 0) + 
                             (deductions?.providentFund || 0) + 
                             (deductions?.other || employee.salary.deductions || 0);
      
      const netPay = earningsTotal - deductionsTotal;

      const salarySlip = new SalarySlip({
        employeeId,
        month,
        year,
        earnings: {
          basic: earnings?.basic || employee.salary.basic,
          allowances: earnings?.allowances || employee.salary.allowances || 0,
          bonus: earnings?.bonus || 0,
          total: earningsTotal
        },
        deductions: {
          tax: deductions?.tax || 0,
          providentFund: deductions?.providentFund || 0,
          other: deductions?.other || employee.salary.deductions || 0,
          total: deductionsTotal
        },
        netPay,
        generatedBy: req.user._id
      });

      await salarySlip.save();
      await salarySlip.populate('employeeId');

      res.status(201).json({
        message: 'Salary slip generated successfully',
        salarySlip
      });
    } catch (error) {
      console.error('Generate salary slip error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Generate PDF
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id)
      .populate('employeeId');
      
    if (!salarySlip) {
      return res.status(404).json({ error: 'Salary slip not found' });
    }

    const employee = salarySlip.employeeId;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; background: white; }
        .header { text-align: center; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #4F46E5; font-size: 28px; margin-bottom: 5px; }
        .header p { color: #666; font-size: 14px; }
        .info-section { margin-bottom: 30px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { padding: 10px; background: #F8FAFC; border-radius: 6px; }
        .info-label { font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-size: 14px; color: #0F172A; font-weight: 600; margin-top: 4px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th { background: #4F46E5; color: white; padding: 12px; text-align: left; font-size: 13px; }
        .table td { padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
        .table tr:last-child td { border-bottom: none; }
        .amount { font-family: 'Courier New', monospace; font-weight: 600; }
        .total-row { background: #F1F5F9; font-weight: 700; }
        .net-pay { background: #10B981; color: white; font-size: 16px; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; color: #64748B; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FinanceFlow</h1>
        <p>Salary Slip for ${salarySlip.month} ${salarySlip.year}</p>
      </div>
      
      <div class="info-section">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Employee Name</div>
            <div class="info-value">${employee.name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Employee ID</div>
            <div class="info-value">${employee._id.toString().slice(-8).toUpperCase()}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Designation</div>
            <div class="info-value">${employee.designation}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Department</div>
            <div class="info-value">${employee.department}</div>
          </div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>EARNINGS</th>
            <th style="text-align: right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td class="amount" style="text-align: right;">₹${salarySlip.earnings.basic.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Allowances</td>
            <td class="amount" style="text-align: right;">₹${salarySlip.earnings.allowances.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Bonus</td>
            <td class="amount" style="text-align: right;">₹${salarySlip.earnings.bonus.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="total-row">
            <td>Total Earnings</td>
            <td class="amount" style="text-align: right;">₹${salarySlip.earnings.total.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <table class="table" style="margin-top: 30px;">
        <thead>
          <tr>
            <th>DEDUCTIONS</th>
            <th style="text-align: right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tax</td>
            <td class="amount" style="text-align: right;">₹${salarySlip.deductions.tax.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Provident Fund</td>
            <td class="amount" style="text-align: right;">₹${salarySlip.deductions.providentFund.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Other Deductions</td>
            <td class="amount" style="text-align: right;">₹${salarySlip.deductions.other.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="total-row">
            <td>Total Deductions</td>
            <td class="amount" style="text-align: right;">₹${salarySlip.deductions.total.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="net-pay">
            <td>NET PAY</td>
            <td class="amount" style="text-align: right;">₹${salarySlip.netPay.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>This is a computer-generated document and does not require a signature.</p>
        <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdf = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    await browser.close();

    res.contentType('application/pdf');
    res.send(pdf);
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// Update salary slip status
router.patch('/:id/status',
  [auth, checkRole('Admin', 'Accountant')],
  async (req, res) => {
    try {
      const { status } = req.body;
      
      const salarySlip = await SalarySlip.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('employeeId');

      if (!salarySlip) {
        return res.status(404).json({ error: 'Salary slip not found' });
      }

      res.json({
        message: 'Status updated successfully',
        salarySlip
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;