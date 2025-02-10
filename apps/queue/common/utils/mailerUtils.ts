import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	},
} as unknown as SMTPTransport.Options);

export const send = (to: string, subject: string, body: string) => {
	try {
		transporter.sendMail({
			from: process.env.MAIL_FROM,
			to,
			subject,
			text: body,
		});
	} catch (error) {
		throw new Error('Unable to send email');
	}
};

export const validateMailbox = async (email: string): Promise<boolean> => {
	const domain = email.split('@')[1];

	const transporter = nodemailer.createTransport({
		host: `smtp.${domain}`,
		port: process.env.MAIL_PORT,
		sucure: false,
		tls: {
			rejectUnauthorized: false,
		},
	} as unknown as SMTPTransport.Options);

	try {
		await transporter.verify();
		return true;
	} catch (error) {
		return false;
	}
};
