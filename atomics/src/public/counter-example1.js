/**
 * Counter Example 1:
 *
 * A counter which updates the value in shared memory without atomic
 * operations or synchronization. This will cause unordered and
 * unpredictable results during concurrent writes.
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
   * @returns {number} - The current count.
   */
  get value() {
    return this.#bufferView[Counter.#LOCATION];
  }

  /**
   * Increment the counter.
   *
   * @param {number} value - The value to increment by.
   */
  increment(value = 1) {
    this.#bufferView[Counter.#LOCATION] += value;
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
