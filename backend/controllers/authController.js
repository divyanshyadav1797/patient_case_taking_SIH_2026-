const login = async (req, res) => {
  // TODO: validate credentials, sign JWT, return user + token
  res.status(501).json({
    message: 'Login not implemented yet',
    hint: 'Wire this to User model + JWT once MongoDB is configured',
  });
};

const register = async (req, res) => {
  // TODO: create User + role profile (Patient/Doctor/Hospital)
  res.status(501).json({
    message: 'Register not implemented yet',
    hint: 'Create User document, then the matching role profile',
  });
};

module.exports = { login, register };
