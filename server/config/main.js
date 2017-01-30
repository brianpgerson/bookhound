module.exports = {
	port: process.env.PORT || 3000,
	test_port: 3001,
	test_env: 'test',
	secret: process.env.SECRET,
	database: process.env.DATABASE_URL || 'mongodb://localhost/db_name',
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
	globalMax: 5
};
