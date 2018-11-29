import Domodule from 'domodule';
import Ajax from 'bequest';
import formobj from 'formobj';
import tinytemplate from 'tinytemplate';
import { on, fire, addClass, removeClass } from 'domassist';

const Events = {
  Error: 'formjax:error',
  Success: 'formjax:success'
};

const Css = {
  Progress: 'formjax-progress',
  Error: 'formjax-error',
  Success: 'formjax-success'
};

class Formjax extends Domodule {
  preInit() {
    if (this.el.tagName !== 'FORM') {
      throw new Error('Formjax need to be attached to a form');
    }

    this.method = this.el.getAttribute('method').toUpperCase();
    this.url = this.el.getAttribute('action');
    this.form = formobj(this.el);
    this.sending = false;

    on(this.el, 'submit', event => {
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

    removeClass(this.el, [Css.Error, Css.Success]);
    addClass(this.el, Css.Progress);

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

    this.request(args);
  }

  request(args) {
    Ajax.request(...args, (err, resp) => {
      let eventName = '';
      let className = '';
      this.sending = false;

      if (!err && resp.statusCode < 400) {
        eventName = Events.Success;
        className = Css.Success;

        if (this.options.successReload) {
          Formjax.reload();
        } else if (this.options.success) {
          try {
            const url = tinytemplate(this.options.success, resp.data);
            Formjax.goTo(url);
          } catch (e) {
            alert(e.message); // eslint-disable-line no-alert
          }
        }
      } else {
        eventName = Events.Error;
        className = Css.Error;

        if (resp.data && resp.data.message) {
          alert(resp.data.message); // eslint-disable-line no-alert
        }
      }

      removeClass(this.el, Css.Progress);
      addClass(this.el, className);

      fire(this.el, eventName, {
        bubbles: true,
        detail: resp.data
      });
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
