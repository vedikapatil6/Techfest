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

// Submit Application
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { schemeId, schemeName, formData, documents } = req.body;

    const db = getFirestore();
    const applicationsRef = db.collection('schemes');

    const applicationData = {
      userId: req.userId,
      schemeId: schemeId || null,
      schemeName: schemeName || 'Unknown Scheme',
      formData: formData || {},
      documents: documents || [],
      status: 'pending',
      submittedAt: FieldValue ? FieldValue.serverTimestamp() : new Date(),
      updatedAt: FieldValue ? FieldValue.serverTimestamp() : new Date(),
    };

    const docRef = await applicationsRef.add(applicationData);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: docRef.id,
        schemeName: applicationData.schemeName,
        status: applicationData.status,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
});

// Get User Applications (Check Status)
router.get('/my-applications', verifyToken, async (req, res) => {
  try {
    const db = getFirestore();
    const applicationsRef = db.collection('schemes');
    
    const snapshot = await applicationsRef
      .where('userId', '==', req.userId)
      .orderBy('submittedAt', 'desc')
      .get();

    const applications = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      applications.push({
        _id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// Get Application Details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const db = getFirestore();
    const applicationRef = db.collection('schemes').doc(req.params.id);
    const doc = await applicationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const data = doc.data();
    if (data.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      application: {
        _id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application' });
  }
});

module.exports = router;
