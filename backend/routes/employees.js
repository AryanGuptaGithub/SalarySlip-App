const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const { auth, checkRole } = require('../middleware/auth');

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single employee
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create employee
router.post('/',
  [auth, checkRole('Admin', 'Accountant')],
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('designation').notEmpty().withMessage('Designation is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('joiningDate').notEmpty().withMessage('Joining date is required'),
    body('salary.basic').isNumeric().withMessage('Basic salary is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existingEmployee = await Employee.findOne({ email: req.body.email });
      if (existingEmployee) {
        return res.status(400).json({ error: 'Employee with this email already exists' });
      }

      const employee = new Employee(req.body);
      await employee.save();

      res.status(201).json({
        message: 'Employee created successfully',
        employee
      });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update employee
router.put('/:id',
  [auth, checkRole('Admin', 'Accountant')],
  async (req, res) => {
    try {
      const employee = await Employee.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({
        message: 'Employee updated successfully',
        employee
      });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete employee
router.delete('/:id',
  [auth, checkRole('Admin')],
  async (req, res) => {
    try {
      const employee = await Employee.findByIdAndDelete(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;