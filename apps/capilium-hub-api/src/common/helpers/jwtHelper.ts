import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
	const payload = {
		id: user._id,
		email: user.email,
	};

	const secret = process.env.SECRET as string;

	const expiresIn: jwt.SignOptions = {
		expiresIn: '8h',
	};

	const token = jwt.sign(payload, secret, expiresIn);

	return token;
};

export const refreshAccessToken = (refreshToken: string, user) => {
	const secret = process.env.SECRET as string;

	const verifyRefreshToken = jwt.verify(refreshToken, secret || '');

	if (!verifyRefreshToken) return;

	const token: string = generateAccessToken(user);

	return token;
};
