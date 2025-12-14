const express = require('express');
const router = express.Router();
const { getFirestore, FieldValue } = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Submit Complaint
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { category, description, attachments, userName } = req.body;

    if (!category || !description) {
      return res.status(400).json({ success: false, message: 'Category and description are required' });
    }

    const db = getFirestore();
    const complaintsRef = db.collection('complaints');

    const complaintData = {
      userId: req.userId,
      userName: userName || 'User',
      category,
      description,
      attachments: attachments || [],
      status: 'Pending',
      createdAt: FieldValue ? FieldValue.serverTimestamp() : new Date(),
      updatedAt: FieldValue ? FieldValue.serverTimestamp() : new Date(),
    };

    const docRef = await complaintsRef.add(complaintData);

    res.json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: {
        id: docRef.id,
        category: complaintData.category,
        description: complaintData.description,
        status: complaintData.status,
        createdAt: new Date().toISOString(),
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
    const db = getFirestore();
    const complaintsRef = db.collection('complaints');
    
    const snapshot = await complaintsRef
      .where('userId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .get();

    const complaints = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      complaints.push({
        _id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
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
    const db = getFirestore();
    const complaintsRef = db.collection('complaints');
    
    const snapshot = await complaintsRef
      .orderBy('createdAt', 'desc')
      .get();

    const complaints = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      complaints.push({
        _id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

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

    const db = getFirestore();
    const complaintRef = db.collection('complaints').doc(req.params.id);
    const doc = await complaintRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const updateData = {
      status,
      updatedAt: FieldValue ? FieldValue.serverTimestamp() : new Date(),
    };

    if (remarks) {
      updateData.remarks = remarks;
    }

    await complaintRef.update(updateData);

    const updatedDoc = await complaintRef.get();
    const data = updatedDoc.data();

    res.json({
      success: true,
      message: 'Complaint status updated',
      complaint: {
        _id: updatedDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint' });
  }
});

module.exports = router;
