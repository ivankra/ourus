// What an app's driver (`sxs/<app>/driver.ts`, exported as `driver`) tells the runner:
// where the app is, how to put a test's starting state into it and read its state back, and which
// keys play each spec action. Everything else (choosing and adapting tests, settling after keys,
// comparing, reporting) is the runner's.
//
// State goes in and comes out through whatever the app offers (a plugin API, its stores); the
// actions under test are played as a user plays them, with keys. An action with no key in the app is
// either emulated with keys (`act`) or not supported, and the tests using it are skipped.

import type { Page } from 'playwright-core';
import type { Config } from '../../src/config.ts';
import type { AppPage } from './browser.ts';
import type { IdleOptions } from './idle.ts';
import type { Outline } from './block.ts';
import type { TextDoc } from './text.ts';

/** A document as a driver loads and reads it: an outline of blocks, or Markdown text (`Driver.model`). */
export type Doc = Outline | TextDoc;

/**
 * How the runner plays an app that isn't a page (a process: Emacs), in place of a page's keyboard and
 * Clipboard API: a call returns once the app has done what it was asked, so there is no settling to
 * wait for. A driver that gives one (from `launch`) keeps its own handle on the app, and the `page`
 * its methods are passed is none.
 */
export interface Session {
  /** A key as the driver's `keys` name it, in the app's own notation (Emacs's `kbd`), played as its user would. */
  press(key: string): Promise<void>;
  /** Text typed, a character at a time. */
  type(text: string): Promise<void>;
  /** The app's clipboard (its kill ring, say). */
  clipboard: { write(text: string): Promise<void>; read(): Promise<string> };
}

export interface Driver {
  /** The directory name: `logseq`. */
  readonly name: string;
  /** The app's name in reports: `Logseq`. */
  readonly title: string;
  /** Two capitals that stand for the app in `sxs.md`'s tables, where its name is too wide: `LS`. */
  readonly id: string;
  /**
   * The page the app is opened at: the runner loads it, a report names it, and the proxy's greeting has a
   * person open it in a browser through the proxy.
   */
  readonly url: string;
  /**
   * The prefix of every page of the app, when the app moves away from `url` (RemNote's documents are
   * `/w/null/<id>`, its guest mode `/notes`): a run takes over the tab an earlier run left only if the
   * tab is still under it. `url` when not given.
   */
  readonly scope?: string;
  /**
   * For an app behind a login: the environment variable a signed-in session is given in (a cookie
   * header, or a "Copy as cURL"). `open` throws `LoginRequired` (lib/login.ts) when the app isn't signed
   * in and the variable doesn't sign it in; the app's browser profile keeps the session it gives.
   */
  readonly login?: string;
  /**
   * What the app's documents are: an outline of blocks (`Outline`: the spec's buffers are projected
   * onto blocks, see block.ts), or Markdown text (`TextDoc`: the buffers as drawn, see text.ts).
   * `load` is given, and `read` returns, a document of that kind.
   */
  readonly model: 'block' | 'text';
  /**
   * Keys for each action it supports, as Playwright names them (`Alt+Shift+ArrowUp`); a list is
   * pressed in order. Typed text (`"abc"`) and the pastes are the runner's.
   */
  readonly keys: Readonly<Record<string, string | readonly string[]>>;
  /** Actions `act` plays, besides those with keys. */
  readonly emulated?: readonly string[];
  /**
   * What a projection adapted (`block.ts` notes) that the app can't hold, and the spec's `markup-`
   * tags at markup the app holds as text or as an attribute, where it has no boundary to compare:
   * tests needing either are skipped.
   */
  readonly refuses?: readonly string[];
  /**
   * The app has numbered blocks, which the driver loads and reads as such: an ordered item is a block
   * whose canonical text starts with its number (`1. x`), a number that is text keeps its escape
   * (`1\. x`), and an ordered list is no adaptation (`ProjectOptions.ordered` in block.ts).
   */
  readonly ordered?: boolean;
  /**
   * The app tells a block outside every list (a paragraph, a heading) from an item, which the driver
   * loads and reads as such (`Block.free`): a block app with a form for free-form Markdown, which runs
   * the spec's `free-form` cases (RemNote's documents without bullets: `ProjectOptions.freeForm`).
   */
  readonly freeForm?: boolean;
  /**
   * How the app behaves where ourus has an option, out of the box. A test that sets an option to
   * another value than ourus's default is run only when the app behaves that way, or can be set to.
   */
  readonly behaves?: Partial<Config>;
  /**
   * ourus's options the app has a setting for, and the values it can be set to (`configure`). Each
   * test runs with them set to its own options, or to ourus's defaults.
   */
  readonly settings?: { readonly [K in keyof Config]?: readonly Config[K][] };
  /**
   * Why the app can't start from `doc`, if it can't (it trims a block's whitespace, say): the test is
   * skipped. Only starting states need holding; what a key makes is whatever the app makes.
   */
  holds?(doc: Doc): string | undefined;
  /** Overrides for settling after each key. */
  readonly idle?: Partial<IdleOptions>;
  /**
   * At most this many workers of a run at once (`run.ts --workers`), each in a browser of the pool of its
   * own, the app's storage its browser's profile's. 1 by default for an app that isn't a page of the
   * pool (`launch`); any number for the rest, so a driver whose app keeps state outside the browser
   * keeps it apart for each worker and says how many (SiYuan: a kernel each). A driver keeps what it
   * knows of a test per page (`perPage`).
   */
  readonly parallel?: number;
  /**
   * The name its page holds a browser's window by (the pool's locks, `appPage`), where it isn't the
   * driver's: setups of one app that mustn't share a browser and may take over each other's window
   * (RemNote's, two of whose tabs break each other).
   */
  readonly pool?: string;
  /**
   * The pool's browsers its workers take, where not any: the even-numbered or the odd ones (RemNote's
   * two setups, one each, so that neither's knowledge base, in a profile's storage, meets the other's).
   */
  readonly browsers?: 'even' | 'odd';

  /**
   * Starts the app itself, for one that isn't a web page (a desktop app): its window, driven in place
   * of a tab in the shared browser, and `release` ends the worker's use of it; or, for one that isn't a
   * page at all (a process), a `session` the runner plays it through. `headed` asks for it to be shown.
   * Where it waits for room (a pool of the driver's, full), null once `gone` says the worker is no
   * longer wanted.
   */
  launch?(opts: { headed: boolean; say: (line: string) => void; gone?: () => boolean }): Promise<AppPage | null>;
  /**
   * Loads the app in `page` (already pointed at nothing, or a window `launch` started, to be reloaded
   * so that the runner's init script runs) and makes it ready; returns its version, if known.
   */
  open(page: Page): Promise<string | undefined>;
  /** Starts a test: a fresh document holding `doc`, its caret or selection placed and focused. */
  load(page: Page, doc: Doc): Promise<void>;
  /** The document and the caret or selection now. */
  read(page: Page): Promise<Doc>;
  /** Sets the app's settings (the keys of `settings`) before a test that needs others than the last one. */
  configure?(page: Page, settings: Partial<Config>): Promise<void>;
  /** Plays an action in `emulated`. */
  act?(page: Page, action: string, settle: () => Promise<void>): Promise<void>;
  /** Ends a test. */
  unload?(page: Page): Promise<void>;
}

/**
 * What a driver keeps of the test a page is on (the page it made for it, to remove when the next test
 * starts): each of a run's workers has a page of its own, so the state is the page's. `of(page)` is the
 * page's, made by `init` the first time. A counter that only makes names unique can be the module's.
 */
export function perPage<T>(init: () => T): (page: Page) => T {
  const states = new WeakMap<Page, T>();
  return (page) => {
    let s = states.get(page);
    if (s === undefined) states.set(page, (s = init()));
    return s;
  };
}
