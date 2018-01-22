import React, { Component } from 'react';
import { connect } from 'react-redux';
import TooltipButton from 'react-bootstrap-tooltip-button';
import { Link } from 'react-router';

const doggy = require('../../public/stylesheets/doggy.png');

class HomePage extends Component {

  renderCTA(msg) {
  	if (!this.props.isLoggedIn) {
	  	return (
	  		// <Link to="register">
				// <button className="btn btn-lg btn-primary">{msg}</button>
			// </Link>
			<TooltipButton
			  title={msg}
			  event="touchstart"
			  eventOff="touchend"
			  className="btn btn-lg btn-primary"
			  disabled={true}
			  tooltipText='Private Beta coming soon!'
			  tooltipId='tt1'/>		
		)
  	} else {
  		return '';
  	}
  }

  render() {
    return (
    	<div>
	  		<section className="hero-unit" id="banner">
	  			<div className="hero-overlay flex-center">
		  			<div className="hero-border flex-center">
						<div className="container">
							<h1>bookhound</h1>
							<p className="lead">Build Your Bookshelf</p>
						</div>
					</div>
				</div>
			</section>
			<div className="container">
				<section className="row push-down pad-bottom">
					<div className="col-md-4 col-md-offset-1">
						<img src={doggy} id="doggy" className="left img-responsive" />
					</div>
					<div className="col-md-6 center-when-small">
						<h3>Welcome to bookhound!</h3>
						<p>bookhound is a simple, straightforward way to build your barkshelf...er, bookshelf! The app works quietly behind the scenes to pick out, order, and deliver all the fresh literature you want, right to your doorstep. Choose from curated wishlists, create your own, or let bookhound simply pick your next favorite book.
						</p>
						{this.renderCTA("Let's Go!")}
					</div>
				</section>
			</div>
			<div className="is-gray-background">
				<div className="container">
					<section className="row">
						<h2 className="text-center header-padded">How It Works</h2>
					</section>
					<section className="row">
				        <div className="col-md-4">
				          <div className="panel">
				            <div className="panel-heading is-white-background"><h3>Connect Your Bank</h3></div>
				            <div className="panel-body">
				            	Connect your bank account and let bookhound go to work analyzing your cash flow.
				            	When we're sure the timing is right, we'll withdraw small amounts of money, putting it aside to fund your next book order.
				            	If you ever need your money, simply withdraw back into your checking account.
				            </div>
				          </div>
				        </div>
				      	<div className="col-md-4">
				        	<div className="panel">
				            <div className="panel-heading is-white-background"><h3>Choose a Style</h3></div>
				            <div className="panel-body">
				            	Want a preset list of books? Create one with your Amazon account and bookhound will pull from that.
				            	Feeling a little more <em>laissez faire</em>? Pick a few genres and let bookhound pick your next favorite book.
				            	Confirm picks before the purchase, or pre-approve choices and enjoy the surprise.
				            </div>
				          </div>
				        </div>
				      	<div className="col-md-4">
				        	<div className="panel">
				            <div className="panel-heading is-white-background"><h3>Read Real Books</h3></div>
				            <div className="panel-body">
				            	bookhound isn't interested in buying you e-books. We want to help you build a collection of real, tangible books that smell like paper and binding glue for you to read, display, share, and pass down over the years. We believe the world needs more bookshelves.
				            </div>
				          </div>
				        </div>
				    </section>
				    <section className="row flex-center pad-bottom">
							{this.renderCTA("I'm Sold!")}
					</section>
			    </div>
		    </div>
		    <div className="container faq">
		    	<section className="row text-center pad-bottom">
					<h2 className="">FAQ</h2>
					<h5>This section is a long one, but let's be honest: you're here because you like to read</h5>
				</section>
				<section className="row pad-bottom">
					<div className="col-md-6 col-md-offset-3">
						<h4 className="text-center">Why does this exist?</h4>
						<p>
							Because humans are creatures of convenience, not of habit. And, while there are plenty of companies out there more than happy to parlay that need into on-demand valet services or laundry pickup, bookhound seeks to be a little more aspirational. If it is constantly, surprisingly, delightfully convenient to have and read new books, I know I will read more. My hope is that you will too.
						</p>
					</div>
				</section>
				<section className="row pad-bottom">
					<div className="col-md-6 col-md-offset-3">
						<h4 className="text-center">How does bookhound know when to withdraw funds?</h4>
						<p>
							Two things make it easy. One is an algorithm that analyzes your cashflow and tells bookhound, "hey, this is a good time to withdraw". I'd give you the details, but you'd have to buy me a beer first. Secondly, the app is buying books, which, despite their unmatched intangible value, are usually less than $20. bookhound doesn't have to withdraw much at a time to get you books with satisfying frequency, which simplifies matters considerably.
						</p>
					</div>
				</section>
				<section className="row pad-bottom">
					<div className="col-md-6 col-md-offset-3">
						<h4 className="text-center">How does bookhound pick the books?</h4>
						<p>
							For now, it's simple. You pick a wishlist of books, and we choose from those. Soon (hopefully *very* soon), bookhound will offer curated lists in various categories, which you'll be able to customize, for example, by excluding books you already own.
						</p>
					</div>
				</section>
				<section className="row pad-bottom">
					<div className="col-md-6 col-md-offset-3">
						<h4 className="text-center">How much does it cost?</h4>
						<p>
							For now and, unless something drastic changes, forevermore, bookhound will be free to join. Each purchase will cost precisely the cost of the book + shipping, along with a buck fifty to defray the costs of bookhound's existence. You'll be able to see shipped orders on your profile page, so you'll always know how much a book cost.
						</p>
					</div>
				</section>
				<section className="row pad-bottom">
					<div className="col-md-6 col-md-offset-3">
						<h4 className="text-center">Why Amazon? Why not support (insert bookseller)?</h4>
						<p>
							Because books are not actually an easy thing to programmatically buy for other people — even from Amazon, it turns out. But for now, it's the best way to get something started and prove the concept. I love my local bookstore too, and don't think bookhound will stop me from stopping by for spontaneous purchases.
						</p>
					</div>
				</section>
				<section className="row pad-bottom">
					<div className="col-md-6 col-md-offset-3">
						<h4 className="text-center">Who are you, anyways?</h4>
						<p>
							I'm Brian! I love reading, building software, and surprises, so bookhound is really just expression of something I wanted for myself. But I sincerely hope you like it too. And if you have ideas, questions, or suggestions, please let me know. You can reach me at <a href="mailto:brian@bookhound.com" target="_blank">brian@bookhound.com.</a>
						</p>
					</div>
				</section>
		    </div>
		    <section className="row push-down">
			    {!this.props.isLoggedIn && false ? <Link to="register">Won't you join today?</Link> : ''}
			</section>
			<section className="row push-down">
			</section>
		</div>
    );
  }
}
function mapStateToProps(state) {
  return { isLoggedIn: state.auth.authenticated };
}

export default connect(mapStateToProps)(HomePage);
