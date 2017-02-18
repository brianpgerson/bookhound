module.exports = {
	port: process.env.PORT || 3000,
	test_port: 3001,
  	test_db: 'bookhound-test',
	test_env: 'test',
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
	zinc: process.env.ZINCCLIENT,
	globalMax: 5
};

