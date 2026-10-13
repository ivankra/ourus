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
import type { Outline } from './outline.ts';
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
  /** The page the app runs at. */
  readonly url: string;
  /**
   * What the app's documents are: an outline of blocks (`Outline`: the spec's buffers are projected
   * onto blocks, see outline.ts), or Markdown text (`TextDoc`: the buffers as drawn, see text.ts).
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
  /** What a projection adapted (`outline.ts` notes) that the app can't hold: tests needing it are skipped. */
  readonly refuses?: readonly string[];
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
   * Starts the app itself, for one that isn't a web page (a desktop app): its window, driven in place
   * of a tab in the shared browser, and `release` stops it; or, for one that isn't a page at all (a
   * process), a `session` the runner plays it through. `headed` asks for it to be shown.
   */
  launch?(opts: { headed: boolean; say: (line: string) => void }): Promise<AppPage>;
  /**
   * Starts what the app's page needs before it can load, for an app served from this machine (SiYuan's
   * kernel): left running for later runs, as the shared browser is, and stopped by `run.ts --stop`
   * (`recordServer` in browser.ts). The runner calls it before it takes over or loads the app's tab.
   */
  serve?(say: (line: string) => void): Promise<void>;
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
