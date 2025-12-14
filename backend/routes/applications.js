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

// Submit Application
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { schemeId, schemeName, formData, documents, deviceId } = req.body;

    console.log('📥 Received application submission:', { schemeId, schemeName, deviceId, hasToken: !!req.userId });

    // Generate a temporary userId if not authenticated
    // Use deviceId from client if provided, otherwise generate one
    const userId = req.userId || deviceId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('👤 Using userId:', userId);
    
    const timestamp = new Date().toISOString();
    
    const applicationData = {
      userId: userId,
      schemeId: schemeId || null,
      schemeName: schemeName || 'Unknown Scheme',
      formData: formData || {},
      documents: documents || [],
      status: 'pending',
      submittedAt: timestamp,
      updatedAt: timestamp,
    };

    // Save to local storage
    const result = await localStorage.addApplication(applicationData);
    const docId = result._id;
    console.log('✅ Application saved to local storage, userId:', userId, 'docId:', docId);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: docId,
        userId: userId, // Return userId so client can store it
        schemeName: applicationData.schemeName,
        status: applicationData.status,
        submittedAt: timestamp,
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
    // Get userId from token or query parameter (for unauthenticated users)
    const userId = req.userId || req.query.deviceId;
    
    if (!userId) {
      return res.json({
        success: true,
        applications: [],
      });
    }

    // Get from local storage
    const applications = await localStorage.getApplications(userId);
    console.log(`✅ Fetched ${applications.length} applications for userId: ${userId}`);

    // Sort by submittedAt descending
    applications.sort((a, b) => {
      const dateA = new Date(a.submittedAt || 0);
      const dateB = new Date(b.submittedAt || 0);
      return dateB - dateA;
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
    const userId = req.userId || req.query.deviceId;
    const applications = await localStorage.getApplications(userId);
    const application = applications.find(app => app._id === req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application' });
  }
});

module.exports = router;
