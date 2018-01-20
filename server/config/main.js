module.exports = {
	port: process.env.PORT || 3000,
	test_port: 3001,
  	test_db: 'bookhound-test',
	test_env: 'test',
	prod_env: 'prod',
	secret: process.env.SECRET,
	database: process.env.DATABASE_URL,
	mailgun_priv_key: process.env.MAILGUN_PRIVATE_KEY,
  	// Configuring Mailgun domain for sending transactional email
  	mailgun_domain: 'mg.booky.com',
  	plaid: {
  		public: process.env.PLAIDPUBLIC,
		client: process.env.PLAIDCLIENT,
		secret: process.env.PLAIDSECRET
	},
	stripe: {
		secret: process.env.STRIPESECRET,
		public: process.env.STRIPEPUBLIC
	},
	gmail: {
		mailUser: process.env.GMAIL_USER,
		mailPass: process.env.GMAIL_PASSWORD,
		clientId: process.env.GMAIL_CLIENT_ID,
		clientSecret: process.env.GMAIL_CLIENT_SECRET,
		refreshToken: process.env.GMAIL_REFRESH_TOKEN,
		accessToken: process.env.GMAIL_ACCESS_TOKEN,
		serviceClientId: process.env.SERVICE_CLIENT_ID,
		servicePrivateKey: process.env.SERVICE_PRIVATE_KEY
	},
	zinc: process.env.ZINC_KEY,
	globalMax: 5,
	globalMin: 1
};

