// React bindings for your app's own React: the themed root, icons, and an island that mounts a shipped component.
import { createElement, useEffect, useRef } from 'react';
import { rootClassName } from './index.js';
import { assetsBase } from './config.js';
import { loadBayrust } from './components.js';

/** The element the shipped styles and tokens apply under, in Bayrust Dark or Light. */
export function ThemeRoot({ theme = 'dark', platform = 'macos', as = 'div', className, style, children, ...rest }) {
  return createElement(
    as,
    {
      ...rest,
      className: className ? `${rootClassName} ${className}` : rootClassName,
      [theme]: '',
      ...(platform === 'macos' ? { macos: '27' } : { windows: '' }),
      style: { '--zoom': 1, ...style },
    },
    children,
  );
}

/** An icon from the shipped sprite, in the current text colour. */
export function Icon({ name, size = 16, ...rest }) {
  return createElement(
    'svg',
    { width: size, height: size, 'aria-hidden': rest['aria-label'] ? undefined : true, ...rest },
    createElement('use', { href: `${assetsBase()}icons/${name}.svg#s` }),
  );
}

/**
 * A shipped component, running with its own React inside yours: `<Bayrust component="Button" props={{ text: 'Run' }} />`.
 * Props are passed as given; functions in them are called by the shipped component as usual.
 */
export function Bayrust({ component, props, base, ...rest }) {
  const host = useRef(null);
  const root = useRef(null);
  useEffect(() => {
    let alive = true;
    loadBayrust({ base }).then(async (ui) => {
      const C = await ui.get(component);
      if (!alive || !host.current) return;
      root.current ??= ui.ReactDOM.createRoot(host.current);
      root.current.render(ui.h(C, props ?? {}));
    });
    return () => {
      alive = false;
    };
  }, [component, props, base]);
  // unmount after React has finished with this tree (unmounting a root during render is not allowed)
  useEffect(
    () => () => {
      const r = root.current;
      root.current = null;
      if (r) setTimeout(() => r.unmount());
    },
    [],
  );
  return createElement('div', { ...rest, ref: host, style: { display: 'contents', ...rest.style } });
}
