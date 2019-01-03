import aws from 'aws-sdk';

export default async function sendEmail(options) {

	aws.config.update({
		region: process.env.Amazon_region,
		accessKeyId: process.env.Amazon_accessKeyId,
		secretAccessKey: process.env.Amazon_secretAccessKey,
	});

	const ses = new aws.SES({apiVersion: 'latest'});

	let aws_args = {
		Source: options.from,
		Destination: {
			CcAddresses: options.cc,
			ToAddresses: options.to,
		},
		Message: {
			Subject: {
				Data: options.subject,
			},
			Body: {
				Html: {
					Data: options.body,
				},
			},
		},
		ReplyToAddresses: options.replyTo,
	}

	try {
		let res = await ses.sendEmail(aws_args)
		console.log('email sent', res)
	} catch (err) {
		throw new Error(err)
	}
}