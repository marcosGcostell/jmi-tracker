export default (res, { user, token, status }) => {
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    httpOnly: true,
  });

  res.status(status).json({
    status: 'success',
    data: {
      user,
    },
  });
};
