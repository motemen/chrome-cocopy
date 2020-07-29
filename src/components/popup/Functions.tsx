import {h} from 'preact';
import {useState, useEffect, useCallback} from 'preact/hooks';
import {getCopyFunctions} from '../../lib/config';
import {createPageTargetFromTab} from '../../lib/target';
import {CopyFunction, CopyFunctionWithTheme} from '../../lib/function';
import * as util from '../../lib/util';
import {FunctionItem} from '../Function';
import {useSandbox} from '../Sandbox';
import {EvaluateResult} from '../../lib/eval';

const receiver = (res: EvaluateResult) => {
  if (res.result) {
    navigator.clipboard.writeText(res.result.toString());
  }
  // TODO collect error and copy rule
  if (res.error) {
    console.error(res);
    new Notification('Error', {
      icon: 'img/icon/128.png',
      body: JSON.stringify(res),
    });
  }
};

export const Functions = () => {
  const evaluate = useSandbox(receiver);
  const [rules, setRules] = useState<CopyFunctionWithTheme[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    getCopyFunctions().then(setRules);
  }, []);

  const onClick = useCallback(
    (c: CopyFunction) => {
      // XXX fix canceling animation when other function running.
      setRunning(c.id);
      setTimeout(() => setRunning(null), 300);

      const run = async () => {
        const tab = await util.getActiveTab();
        evaluate({
          code: c.code,
          target: await createPageTargetFromTab(tab),
        });
      };
      run().catch(e => console.error(e));
    },
    [evaluate]
  );

  // Kyeboard Shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // index
      if (/^\d$/.test(e.key)) {
        const index = util.keyToIndex(e.key);
        const rule = rules[index];
        if (rule) onClick(rule);
      }
      if (e.key === 'Esc' || e.key === 'Escape') {
        window.close();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [rules]);

  return (
    <div>
      {rules.map((r, idx) => (
        <FunctionItem
          key={r.id}
          running={r.id === running}
          fn={r}
          index={idx}
          onClick={onClick}
        />
      ))}
    </div>
  );
};
