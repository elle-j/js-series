/**
 * Counter Example 2:
 *
 * A counter which updates the value in shared memory using `Atomics`.
 * This allows for concurrent writes to appear sequentially consistent,
 * producing a predictable counter.
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
   * Create a counter backed by shared memory.
   *
   * @param {SharedArrayBuffer} sharedBuffer - The shared data buffer.
   */
  constructor(sharedBuffer) {
    this.#ensureSharedArrayBuffer(sharedBuffer);
    this.#bufferView = new Uint32Array(sharedBuffer);
  }

  /**
   * @returns {number} The current count.
   */
  get value() {
    return Atomics.load(this.#bufferView, Counter.#LOCATION);
  }

  /**
   * Increment the counter.
   *
   * @param {number} value - The value to increment by.
   */
  increment(value = 1) {
    Atomics.add(this.#bufferView, Counter.#LOCATION, value);
  }

  /**
   * Decrement the counter.
   *
   * @param {number} value - The value to decrement by.
   */
  decrement(value = 1) {
    Atomics.sub(this.#bufferView, Counter.#LOCATION, value);

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
