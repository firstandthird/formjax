import Formjax from '../index';
import Ajax from 'bequest';
import test from 'tape-rollup';
import { fire } from 'domassist';

const request = [];
let reloaded = false;
let defaultPrevented = false;

let url = '';

const event = {
  preventDefault() {
    defaultPrevented = true;
  }
};

const init = () => {
  // Mocking methods
  Formjax.reload = () => {
    reloaded = true;
  };

  Formjax.goTo = goUrl => {
    url = goUrl;
  };

  Ajax.request = (...args) => {
    request.push(args);
  };

  const container = document.createElement('div');
  container.id = 'fixture';
  document.body.appendChild(container);
};

const setup = (method = 'post', extra = '') => {
  const container = document.getElementById('fixture');
  container.innerHTML = `
    <form 
      action="/blah/blah" 
      method="${method}"
      data-module="Formjax"
      ${extra}>
      
      <input type="hidden" name="siteId" value="site1"/>
      <input type="text" name="name" value="formjax" />
      <input type="submit" value="Add Collection"/>
    </form>
  `;

  return Formjax.discover();
};

const teardown = () => {
  reloaded = false;
  url = '';
  request.length = 0;
  defaultPrevented = false;
};

init();

test('Example module registerd', assert => {
  assert.equal(typeof window.domodules, 'object');
  assert.equal(Object.keys(window.domodules).length, 1, 'One module registered');
  assert.end();
});

test('Formjax on form', assert => {
  const container = document.getElementById('fixture');
  container.innerHTML = '<div data-module="Formjax"></div>';
  assert.throws(Formjax.discover, /Formjax need to be attached to a form/, 'Throws if element is not a form');
  assert.end();
});

test('Defaults', assert => {
  const instance = setup()[0];

  assert.equal(instance.options.confirm, false, 'Confirm is false by default');
  assert.equal(instance.options.successReload, false, 'Reload on success is false by default');
  assert.equal(instance.options.confirmText, 'Are you sure you want to submit?', 'Sensible confirm text');
  assert.end();
  teardown();
});

test('Form has bound submit', assert => {
  const instance = setup()[0];

  instance.submit = () => {
    assert.pass('Fires on submit');
    assert.end();
  };

  fire(instance.el, 'submit');

  assert.plan(1);
  teardown();
});

test('Form behaviour', assert => {
  const instance = setup()[0];
  instance.submit(instance.el, event);

  assert.equal(defaultPrevented, true, 'Prevents default');
  assert.equal(request.length, 1, 'A request is submitted');
  assert.ok(instance.el.classList.contains('formjax-progress'), 'Has a progress class');
  assert.end();
  teardown();
});

test('POST Form', assert => {
  const instance = setup()[0];
  instance.submit(instance.el, event);
  const currentRequest = request[0];

  assert.equal(defaultPrevented, true, 'Prevents default');
  assert.equal(currentRequest[0], '/blah/blah', 'Posts to correct URL');
  assert.equal(currentRequest[1], 'POST', 'Method is correct');
  assert.deepLooseEqual(currentRequest[2], { name: 'formjax', siteId: 'site1' }, 'Data is correct');
  assert.equal(typeof currentRequest[3], 'function', 'Provides a callback');
  assert.end();
  teardown();
});

test('GET Form', assert => {
  const instance = setup('get')[0];
  instance.submit(instance.el, event);
  const currentRequest = request[0];

  assert.equal(defaultPrevented, true, 'Prevents default');
  assert.equal(currentRequest[0], '/blah/blah?siteId=site1&name=formjax', 'Posts to correct URL');
  assert.equal(currentRequest[1], 'GET', 'Method is correct');
  assert.equal(typeof currentRequest[2], 'function', 'Provides a callback');
  assert.end();
  teardown();
});

test('Form confirm', assert => {
  const instance = setup('post', 'data-module-confirm="true"')[0];
  instance.confirm = (f) => {
    assert.equal(typeof f, 'function', 'Should pass a function to confirm');
  };
  instance.submit(instance.el, event);
  assert.equal(request.length, 0, 'No request fired on false confirmation');

  instance.confirm = f => {
    f();
  };
  instance.submit(instance.el, event);
  assert.equal(request.length, 1, 'Request fired from confirm');

  assert.end();
  teardown();
});

test('Show error', assert => {
  const instance = setup('post')[0];

  instance.submit(instance.el, event);
  const f = request[0][3];
  const oldAlert = window.alert;
  window.alert = message => {
    assert.equal(message, 'Test', 'Should alert with given message');
  };
  f(false, {
    statusCode: 500,
    data: {
      message: 'Test'
    }
  });
  window.alert = oldAlert;
  assert.end();
  teardown();
});

test('Success event', assert => {
  assert.plan(4);
  const instance = setup('post')[0];

  instance.submit(instance.el, event);
  const f = request[0][3];
  instance.el.addEventListener('formjax:success', e => {
    assert.pass('Success event has been fired');
    assert.equal(e.detail.foo, 'bar', 'Should pass response data back to the event');
  });

  f(false, {
    statusCode: 200,
    data: {
      foo: 'bar'
    }
  });
  assert.notOk(instance.el.classList.contains('formjax-progress'), 'Does not have a progress class');
  assert.ok(instance.el.classList.contains('formjax-success'), 'Does have a success class');

  assert.end();
  teardown();
});

test('Error event', assert => {
  assert.plan(4);
  const instance = setup('post')[0];

  instance.submit(instance.el, event);
  const f = request[0][3];
  instance.el.addEventListener('formjax:error', e => {
    assert.pass('Error event has been fired');
    assert.equal(e.detail.foo, 'bar', 'Should pass response data back to the event');
  });

  f(false, {
    statusCode: 500,
    data: {
      foo: 'bar'
    }
  });
  assert.notOk(instance.el.classList.contains('formjax-progress'), 'Does not have a progress class');
  assert.ok(instance.el.classList.contains('formjax-error'), 'Does have a error class');

  assert.end();
  teardown();
});

test('Page reload', assert => {
  const instance = setup('post', 'data-module-success-reload="true"')[0];
  instance.submit(instance.el, event);
  const f = request[0][3];
  request.length = 0;
  f(true, {});
  assert.equal(reloaded, false, 'Shouldn\'t reload if error');
  f(false, { statusCode: 500 });
  assert.equal(reloaded, false, 'Shouldn\'t reload if status code is not 200');
  f(false, { statusCode: 200 });
  assert.equal(reloaded, true, 'Should reload if all is correct');
  assert.end();
});

test('Page redirect', assert => {
  const instance = setup('post', 'data-module-success="/sites/site1/collections/${id}"')[0];
  instance.submit(instance.el, event);
  const f = request[0][3];
  request.length = 0;
  f(true, {});
  assert.equal(url, '', 'Shouldn\'t redirect if error');
  f(false, { statusCode: 500 });
  assert.equal(url, '', 'Shouldn\'t redirect if status code is not 200');
  f(false, { statusCode: 200, data: { id: '20' } });
  assert.equal(url, '/sites/site1/collections/20', 'Should redirect if all is correct');
  assert.end();
});
