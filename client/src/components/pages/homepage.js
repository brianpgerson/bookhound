import React, { Component } from 'react';
import { Link } from 'react-router';
const doggy = require('../../public/stylesheets/doggy.png');

class HomePage extends Component {
  render() {
    return (
    	<div>
	  		<section className="hero-unit" id="banner">
	  			<div className="hero-overlay vertical-center">
		  			<div className="hero-border vertical-center">
						<div className="container">
							<h1>bookhound</h1>
							<p className="lead">Build Your Bookshelf</p>
						</div>
					</div>
				</div>
			</section>
			<div className="container">
				<section className="row push-down">
					<div className="col-md-4 col-md-offset-1">
						<img src={doggy} className="left img-responsive" />
					</div>
					<div className="col-md-6">
						<h3>Welcome to bookhound!</h3>
						<p>bookhound is a simple, straightforward way to build your barkshelf...er, bookshelf! The app works quietly behind the scenes to pick out, order, and deliver all the fresh literature you want, right to your doorstep. Choose from curated wishlists, create your own, or let bookhound simply pick your next favorite book.
						</p>
						<Link to="register">
							<button className="btn btn-primary">Let's Go!</button>
						</Link>
					</div>
				</section>
				<section className="row push-down">
					<h2 className="text-center white thick-border black-border header-padded">How It Works</h2>
				</section>
				<section className="row">
			        <div className="col-md-4">
			          <div className="panel thick-border black-border">
			            <div className="panel-heading white"><h3>Connect Your Bank</h3></div>
			            <div className="panel-body">
			            	Connect your bank account and let bookhound go to work analyzing your cash flow.
			            	When we're sure the timing is right, we'll withdraw one to ten dollars out at a time, putting it aside to fund your next book order.
			            	If you ever need your money, simply withdraw back into your checking account.
			            </div>
			          </div>
			        </div>
			      	<div className="col-md-4">
			        	<div className="panel thick-border black-border">
			            <div className="panel-heading white"><h3>Choose a Style</h3></div>
			            <div className="panel-body">
			            	Want a preset list of books? Create one with your Amazon account and bookhound will pull from that.
			            	Feeling a little more <em>laissez faire</em>? Pick a few genres and let bookhound pick your next favorite book.
			            	Confirm picks before the purchase, or pre-approve choices and enjoy the surprise.
			            </div>
			          </div>
			        </div>
			      	<div className="col-md-4">
			        	<div className="panel thick-border black-border">
			            <div className="panel-heading white"><h3>Simple Setup</h3></div>
			            <div className="panel-body">
			            	When you sign up for free, you can set a max frequency for both withdrawels and purchases.
			            	You can also exclude books you already own (or enjoy having a "loaner" copy for your friends).
			            	Once you've setup your account, the rest is up to us. Check in when you want to make changes, or just sit back and let the books come to you.
			            </div>
			          </div>
			        </div>
			    </section>
			    <section className="row push-down">
				</section>
			</div>
		</div>
    );
  }
}

export default HomePage;
