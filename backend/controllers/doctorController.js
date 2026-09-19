const getDoctors = async (req, res) => {
  // TODO: Doctor.find().populate('user', 'name email')
  res.status(501).json({ message: 'Get doctors not implemented yet' });
};

const getDoctorById = async (req, res) => {
  // TODO: Doctor.findById(req.params.id).populate('user')
  res.status(501).json({ message: 'Get doctor by ID not implemented yet', id: req.params.id });
};

module.exports = { getDoctors, getDoctorById };
