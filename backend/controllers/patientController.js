const getPatients = async (req, res) => {
  // TODO: Patient.find().populate('user', 'name email phone')
  res.status(501).json({ message: 'Get patients not implemented yet' });
};

const getPatientById = async (req, res) => {
  // TODO: Patient.findById(req.params.id).populate('user')
  res.status(501).json({ message: 'Get patient by ID not implemented yet', id: req.params.id });
};

module.exports = { getPatients, getPatientById };
