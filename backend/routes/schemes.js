const express = require('express');
const router = express.Router();

// Get all schemes
router.get('/', (req, res) => {
  const schemes = [
    { id: 1, name: 'Pradhan Mantri Awas Yojana (PMAY)', category: 'Housing' },
    { id: 2, name: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)', category: 'Business' },
    { id: 3, name: 'Ayushman Bharat', category: 'Health' },
    { id: 4, name: 'Pradhan Mantri Kisan Samman Nidhi', category: 'Agriculture' },
    { id: 5, name: 'Beti Bachao Beti Padhao', category: 'Women' },
    { id: 6, name: 'Scholarship for Higher Education', category: 'Education' },
  ];

  res.json({ success: true, schemes });
});

module.exports = router;



