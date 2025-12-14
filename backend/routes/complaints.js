const express = require('express');
const router = express.Router();
const localStorage = require('../storage/localStorage');
const jwt = require('jsonwebtoken');

// Middleware to verify token (optional - allow unauthenticated)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    // Allow unauthenticated requests
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Allow requests even with invalid token
    req.userId = null;
    next();
  }
};

// Submit Complaint
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { category, description, attachments, userName, deviceId } = req.body;

    console.log('📥 Received complaint submission:', { category, deviceId, hasToken: !!req.userId });

    if (!category || !description) {
      return res.status(400).json({ success: false, message: 'Category and description are required' });
    }

    // Generate a temporary userId if not authenticated
    // Use deviceId from client if provided, otherwise generate one
    const userId = req.userId || deviceId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('👤 Using userId:', userId);
    
    const timestamp = new Date().toISOString();
    
    const complaintData = {
      userId: userId,
      userName: userName || 'User',
      category,
      description,
      attachments: attachments || [],
      status: 'Pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save to local storage
    const result = await localStorage.addComplaint(complaintData);
    const docId = result._id;
    console.log('✅ Complaint saved to local storage, userId:', userId, 'docId:', docId);

    res.json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: {
        id: docId,
        userId: userId, // Return userId so client can store it
        category: complaintData.category,
        description: complaintData.description,
        status: complaintData.status,
        createdAt: timestamp,
      },
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit complaint' });
  }
});

// Get User Complaints
router.get('/my-complaints', verifyToken, async (req, res) => {
  try {
    // Get userId from token or query parameter (for unauthenticated users)
    const userId = req.userId || req.query.deviceId;
    
    if (!userId) {
      return res.json({
        success: true,
        complaints: [],
      });
    }

    // Get from local storage
    const complaints = await localStorage.getComplaints(userId);
    console.log(`✅ Fetched ${complaints.length} complaints for userId: ${userId}`);

    // Sort by createdAt descending
    complaints.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
});

// Get All Complaints (Admin)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const complaints = await localStorage.getComplaints(null); // Get all complaints

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
});

// Update Complaint Status (Admin)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const userId = req.userId || req.query.deviceId;
    
    const complaints = await localStorage.getComplaints(userId);
    const complaint = complaints.find(comp => comp._id === req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    complaint.updatedAt = new Date().toISOString();
    if (remarks) {
      complaint.remarks = remarks;
    }

    res.json({
      success: true,
      message: 'Complaint status updated',
      complaint,
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint' });
  }
});

module.exports = router;
