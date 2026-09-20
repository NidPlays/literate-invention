import '@testing-library/jest-dom/vitest';

// jsdom has no IntersectionObserver. This stub records every observer so a test
// can drive the grid's auto-load by hand.
class TestIntersectionObserver {
  static instances = [];
  constructor(callback) {
    this.callback = callback;
    this.elements = [];
    TestIntersectionObserver.instances.push(this);
  }
  observe(element) {
    this.elements.push(element);
  }
  disconnect() {
    TestIntersectionObserver.instances = TestIntersectionObserver.instances.filter((o) => o !== this);
  }
  unobserve() {}
  /** Pretend the observed element just scrolled into view. */
  static scrollIntoView() {
    for (const observer of [...TestIntersectionObserver.instances]) {
      observer.callback([{ isIntersecting: true, target: observer.elements[0] }], observer);
    }
  }
}

globalThis.IntersectionObserver = TestIntersectionObserver;
globalThis.TestIntersectionObserver = TestIntersectionObserver;

// jsdom's matchMedia answers false to everything. Make `(max-width: N)` follow
// window.innerWidth so the phone-only sheet gestures can be tested.
const listeners = new Set();
globalThis.matchMedia = (query) => {
  const max = Number(/max-width:\s*(\d+)px/.exec(query)?.[1] ?? NaN);
  const mql = {
    media: query,
    get matches() {
      return Number.isNaN(max) ? false : window.innerWidth <= max;
    },
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
    addListener: (fn) => listeners.add(fn),
    removeListener: (fn) => listeners.delete(fn),
    dispatchEvent: () => true,
  };
  return mql;
};

/** Pretend the viewport changed size, phone <-> desktop. */
globalThis.setViewportWidth = (width) => {
  window.innerWidth = width;
  for (const fn of [...listeners]) fn({ matches: true });
};
