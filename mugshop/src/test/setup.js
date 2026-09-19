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
