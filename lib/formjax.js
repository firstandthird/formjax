(function($) {
  $.declare('formjax', {

    defaults: {
      submitButton: '[type=submit]',
      progressClass: 'btn-progress',
      successClass: 'btn-success',
      errorClass: 'btn-error',
      progressText: 'Sending...',
      successText: 'Done!',
      errorText: 'Uh oh',
      successRedirect: false,
      successRefresh: false,
      validate: function() {
        //do some validation, if return false, don't submit, if true, submit
        return true;
      },
      success: function(response) {
        //fired when form response comes back
      },
      error: function(response) {
        //fired when form errored out
      }
    },

    events: {
      'submit': 'submit'
    },

    init: function() {
      this.button = this.el.find(this.submitButton);
    },

    submit: function(e) {
      e.preventDefault();
      if(this.validate()) {
        this.button
          .addClass(this.progressClass)
          .val(this.progressText);

        $.post(this.el.attr('action'), this.el.serialize())
          .done(this.proxy(this._success))
          .fail(this.proxy(this._error));
      }
    },

    _success: function(response) {
      this.button
        .removeClass(this.progressClass)
        .addClass(this.successClass);

      if (this.button[0].tagName == 'INPUT') {
        this.button.val(this.successText);
      } else {
        this.button.text(this.successText);
      }

      this.emit('formjax:success', response);
      this.success.call(this.el, response);
      if (this.successRefresh) {
        window.location.reload();
      }
      if (this.successRedirect) {
        window.location = this.successRedirect;
      }
    },

    _error: function(response) {
      this.button
        .removeClass(this.progressClass)
        .addClass(this.errorClass)
        .val(this.errorText);
      $.notice(response.responseJSON.message, { level: 'error' });
      this.emit('formjax:error', response);
      this.error.call(this.el, response);
    }
  });
})(jQuery);
