import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import * as setupActions from '../actions/setup-actions';
import { clearErrors } from '../actions/error-actions';

const form = reduxForm({
  form: 'preferences',
  validate
});

const renderField = field => (
    <div>
      <label htmlFor="new" className="inline-checkbox"> {renderName(field.input.name)}
        <input {...field.input}/>
        {field.touched && field.error && <div className="error">{field.error}</div>}
      </label>
    </div>
);

function renderName (name) {
  return _.includes(['new', 'used'], name) ?
    `${_.upperFirst(name)}: ` :
    'Max # of Orders/Month: ';
}

function validate(formProps) {
  const errors = {};

  if ((!_.isUndefined(formProps.new) && !formProps.new) && (!formProps.used && !_.isUndefined(formProps.used))) {
    errors.used = 'Please choose at least one preferred condition.';
  }

  if (formProps.maxMonthlyOrderFrequency && formProps.maxMonthlyOrderFrequency < 1) {
    errors.maxMonthlyOrderFrequency = 'Max order frequency must be at least 1';
  }

  return errors;
}

class Preferences extends Component {
  handleFormSubmit(formProps) {
    var prefs = _.assign(this.props.preferences, formProps);
    this.props.updatePreferences(prefs);
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  isDisabled(type) {
    var cool = this.props;
  }

  renderAlert() {
    if(this.props.errorMessage) {
      return (
        <div>
          <span><strong>Error:</strong> {this.props.errorMessage}</span>
        </div>
      );
    }
  }

  render() {
    const { handleSubmit, preferences } = this.props;

    return (
      <div className="col-md-4">
        <h4>Your Preferences</h4>
        <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
        {this.renderAlert()}
        <div className="form-group">
            <p>Preferred Conditions (at least one must be checked):
            <br />
                <Field name="new"
                       defaultValue={preferences.preferredConditions.new}
                       component={renderField}
                       disabled={this.isDisabled('new', this)}
                       type="checkbox"/>
                <Field name="used"
                       defaultValue={preferences.preferredConditions.used}
                       component={renderField}
                       disabled={this.isDisabled('used', this)}
                       type="checkbox"/>
            </p>
        </div>
        <div className="form-group">
          <Field name="maxMonthlyOrderFrequency" defaultValue={preferences.maxMonthlyOrderFrequency} className="form-control" component={renderField} type="number" />
        </div>
        <div className="form-group">
            <button type="submit" className="btn btn-default">Update Preferences</button>
        </div>
      </form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    errorMessage: state.error.message,
    preferences: state.setup.preferences
  };
}

export default connect(mapStateToProps, {setupActions, clearErrors})(form(Preferences));
