import { Mutex } from "./mutex.js";

/**
 * Counter Example 3:
 *
 * A counter which updates the value in shared memory by using a mutex
 * to lock and unlock the right to access that memory. This makes the
 * operations appear atomic to other agents, even during concurrent writes.
 */
export class Counter {
  /**
   * The location in the `bufferView` at which the value is stored.
   */
  static #LOCATION = 0;
  /**
   * The view into the underlying buffer by which it is accessed.
   */
  #bufferView;
  /**
   * The mutex used for acquiring and releasing the lock.
   */
  #mutex;

  /**
   * Create a counter backed by shared memory.
   *
   * @param {SharedArrayBuffer} sharedCounterBuffer - The shared counter data buffer.
   * @param {SharedArrayBuffer} sharedMutexBuffer - The shared mutex data buffer.
   */
  constructor(sharedCounterBuffer, sharedMutexBuffer) {
    this.#ensureSharedArrayBuffer(sharedCounterBuffer);
    this.#bufferView = new Uint32Array(sharedCounterBuffer);
    this.#mutex = new Mutex(sharedMutexBuffer);
  }

  /**
   * @returns {number} The current count.
   */
  get value() {
    this.#mutex.lock();
    const value = this.#bufferView[Counter.#LOCATION];
    this.#mutex.unlock();

    return value;
  }

  /**
   * Increment the counter.
   *
   * @param {number} value - The value to increment by.
   */
  increment(value = 1) {
    this.#mutex.lock();
    this.#bufferView[Counter.#LOCATION] += value;
    this.#mutex.unlock();
  }

  /**
   * Decrement the counter.
   *
   * @param {number} value - The value to decrement by.
   */
  decrement(value = 1) {
    this.increment(-value);

    // NOTE: This is not accounting for decrementing below
    //       0, which will overflow due to storing Uint32.
  }

  /**
   * @param {unknown} value 
   */
  #ensureSharedArrayBuffer(value) {
    if (!(value instanceof SharedArrayBuffer)) {
      throw new Error("Expected a 'SharedArrayBuffer'.");
    }

    const MIN_BYTES = Uint32Array.BYTES_PER_ELEMENT;
    if (value.byteLength < MIN_BYTES) {
      throw new Error(`Expected at least a ${MIN_BYTES}-byte buffer.`);
    }
  }
}
