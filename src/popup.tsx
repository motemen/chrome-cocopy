import {h, render, Fragment} from 'preact';
import {useState, useEffect, useContext, useCallback} from 'preact/hooks';

import * as util from './util';
import {CopyRule, getCopyRules} from './config';
import SandboxProvider, {SandboxContext} from './components/SandboxContext';

const App = () => {
  const receiver = (event: MessageEvent) => {
    if (event.data.result) util.copyToClipboard(event.data.result);
    if (event.data.error) {
      new Notification('Error', {
        icon: 'img/icon/128.png',
        body: JSON.stringify(event.data),
      });
    }
  };

  return (
    <Fragment>
      <h1>COCOPY!</h1>
      <a href="options.html" target="_blank">
        settings
      </a>
      <SandboxProvider receiver={receiver}>
        <CopyRules />
      </SandboxProvider>
    </Fragment>
  );
};

const CopyRules = () => {
  const [rules, setRules] = useState<CopyRule[]>([]);

  const sandbox = useContext(SandboxContext);

  useEffect(() => {
    getCopyRules().then(setRules);
  }, []);

  const onClick = useCallback(
    (c: CopyRule) => {
      util.getActiveTab().then(tab => {
        sandbox &&
          sandbox.sender({
            code: c.code,
            target: {type: 'page', title: tab.title, pageURL: tab.url},
          });
      });
    },
    [sandbox]
  );

  return (
    <ul>
      {rules.map(r => (
        <li key={r.id} onClick={() => onClick(r)}>
          {r.displayName}
        </li>
      ))}
    </ul>
  );
};

render(<App />, document.getElementById('root')!);
