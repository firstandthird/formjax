import Domodule from 'domodule';
import Ajax from 'bequest';
import formobj from 'formobj';
import tinytemplate from 'tinytemplate';
import { on } from 'domassist';

class Formjax extends Domodule {
  preInit() {
    if (this.el.tagName !== 'FORM') {
      throw new Error('Formjax need to be attached to a form');
    }

    this.method = this.el.getAttribute('method').toUpperCase();
    this.url = this.el.getAttribute('action');
    this.form = formobj(this.el);
    this.sending = false;

    on(this.form, 'submit', event => {
      this.submit(this.el, event);
    });
  }

  get defaults() {
    return {
      confirm: false,
      successReload: false,
      confirmText: 'Are you sure you want to submit?'
    };
  }

  confirm(sendForm) {
    if (window.confirm(this.options.confirmText)) { // eslint-disable-line no-alert
      sendForm();
    }
  }

  submit(el, event) {
    event.preventDefault();

    if (this.options.confirm) {
      this.confirm(this.sendForm.bind(this));
    } else {
      this.sendForm();
    }
  }

  sendForm() {
    if (this.sending) {
      return;
    }

    this.sending = true;
    const args = [this.url, this.method];

    if (this.method === 'GET') {
      let url = this.url;
      const uri = this.form.getQueryString();

      if (url.indexOf('?') > -1) {
        url = `${url}&${uri}`;
      } else {
        url = `${url}?${uri}`;
      }

      args[0] = url;
    } else {
      args.push(this.form.getJSON());
    }

    Ajax.request(...args, (err, resp) => {
      if (!err && resp.statusCode === 200) {
        if (this.options.successReload) {
          Formjax.reload();
        } else if (this.options.success) {
          Formjax.goTo(tinytemplate(this.options.success, resp.data));
        }
      } else {
        alert(resp.data.message);
        this.sending = false;
      }
    });
  }

  static reload() {
    window.location.reload();
  }

  static goTo(url) {
    window.location.href = url;
  }
}

Domodule.register('Formjax', Formjax);

export default Formjax;
