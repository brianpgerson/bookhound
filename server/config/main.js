'use strict'

module.exports = {
	port: process.env.PORT || 3000,
	host: process.env.HOST,
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
		secret: process.env.STRIPE_SECRET_TEST,
		public: process.env.STRIPE_PUBLIC_TEST
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
	defray: process.env.DEFRAY,
	globalMax: 15,
	globalMin: 1,
	billing: {
		address: {
		    first_name: process.env.BILLING_FIRST_NAME,
		    last_name: process.env.BILLING_LAST_NAME,
		    address_line1: process.env.BILLING_ADDRESS_LINE_1,
		    address_line2: process.env.BILLING_ADDRESS_LINE_2,
		    zip_code: process.env.BILLING_ZIP,
		    city: process.env.BILLING_CITY,
		    state: process.env.BILLING_STATE,
		    country: process.env.BILLING_COUNTRY,
		    phone_number: process.env.DEFAULT_PHONE_NUMBER
		},
		retailer_credentials: {
			email: process.env.RETAILER_EMAIL,
			password: process.env.RETAILER_PASSWORD
			// ,
			// verification_code: process.env.RETAILER_VERIFICATION
		},
		payment_method: {
		    name_on_card: `${process.env.BILLING_FIRST_NAME} ${process.env.BILLING_LAST_NAME}`,
		    number: process.env.BILLING_NUMBER,
		    security_code: process.env.BILLING_SECURITY_CODE,
		    expiration_month: process.env.BILLING_EXP_MONTH,
		    expiration_year: process.env.BILLING_EXP_YEAR,
		    use_gift: false
		}
	}
};

