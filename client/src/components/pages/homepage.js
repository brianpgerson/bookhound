import React, { Component } from 'react';
const doggy = require('../../public/img/doggy.png');

class HomePage extends Component {
  render() {
    return (
  		<section class="hero-unit" id="banner">
		  <div class="container">
		    <h1>bookhound</h1>
		    <p class="lead">Build Your Bookshelf</p>
		    <img src={doggy} alt="I'm BookHound" class="hero-image" />
		  </div>
		</section>
    );
  }
}

export default HomePage;
