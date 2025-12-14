// Simple in-memory storage as fallback when Firebase is not available
// This stores data in memory (will be lost on server restart, but works for development)

const applications = [];
const complaints = [];

const localStorage = {
  // Applications
  addApplication: (data) => {
    const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const application = {
      _id: id,
      ...data,
      submittedAt: data.submittedAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    applications.push(application);
    return Promise.resolve({ id, ...application });
  },

  getApplications: (userId) => {
    if (userId) {
      return Promise.resolve(applications.filter(app => app.userId === userId));
    }
    return Promise.resolve(applications);
  },

  // Complaints
  addComplaint: (data) => {
    const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const complaint = {
      _id: id,
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    complaints.push(complaint);
    return Promise.resolve({ id, ...complaint });
  },

  getComplaints: (userId) => {
    if (userId) {
      return Promise.resolve(complaints.filter(comp => comp.userId === userId));
    }
    return Promise.resolve(complaints);
  },
};

module.exports = localStorage;

