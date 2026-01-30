const userService = require('../services/userService');
const asyncHandler = require('../middleware/asyncHandler');

exports.createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser({
    requester: req.user,
    userData: req.body,
  });

  res.status(201).json({
    message: 'Usuario creado correctamente',
    user,
  });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers(req.user);
  res.json(users);
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser({
    requester: req.user,
    userId: req.params.id,
    data: req.body,
  });

  res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUser({
    requester: req.user,
    userId: req.user.id,
    data: req.body,
  });

  res.json(user);
});

exports.changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword({
    requester: req.user,
    userId: req.user.id,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  });

  res.json({ message: 'Contraseña actualizada correctamente' });
});
