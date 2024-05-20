/**
 * A mutually exclusive lock using `Atomics` for coordinating the
 * right to access shared memory among multiple agents.
 */
export class Mutex {
  /**
   * The lock state when access to shared memory is prohibited.
   */
  static #LOCKED = 1;
  /**
   * The lock state when access to shared memory is permitted.
   */
  static #UNLOCKED = 0;
  /**
   * The location in the `bufferView` at which the state is stored.
   */
  static #LOCATION = 0;
  /**
   * The view into the underlying buffer by which it is accessed.
   */
  #bufferView;

  /**
   * Create a mutex backed by shared memory.
   *
   * @param {SharedArrayBuffer} sharedBuffer - The shared data buffer.
   */
  constructor(sharedBuffer) {
    this.#ensureSharedArrayBuffer(sharedBuffer);
    this.#bufferView = new Int32Array(sharedBuffer);
  }

  /**
   * Try to acquire the lock, or wait until it is released to try again.
   */
  lock() {
    while (true) {
      if (this.#tryGetLock()) {
        return;
      }
      this.#waitIfLocked();
    }
  }

  /**
   * Try to acquire the lock by changing the state to `Mutex.#LOCKED`
   * if it previously was `Mutex.#UNLOCKED`.
   *
   * @returns {boolean} Whether the lock was acquired.
   */
  #tryGetLock() {
    const previousState = Atomics.compareExchange(
      this.#bufferView,
      Mutex.#LOCATION,
      Mutex.#UNLOCKED,
      Mutex.#LOCKED,
    );

    return previousState === Mutex.#UNLOCKED;
  }

  /**
   * If the specified location contains `Mutex.#LOCKED`, put the
   * thread to sleep and wait on that location until it is notified.
   *
   * @note
   * This is only supported for an `Int32Array` or `BigInt64Array`
   * that views a `SharedArrayBuffer`.
   */
  #waitIfLocked() {
    Atomics.wait(this.#bufferView, Mutex.#LOCATION, Mutex.#LOCKED);
  }

  /**
   * Release the lock and notify waiting agents.
   */
  unlock() {
    if (!this.#tryUnlock()) {
      throw new Error("You can only unlock while holding the lock.");
    }
    this.#notifyAgents();
  }

  /**
   * Try to release the lock by changing the state to `Mutex.#UNLOCKED`
   * if it previously was `Mutex.#LOCKED` (which should never be the case).
   *
   * @returns {boolean} Whether the lock was released.
   */
  #tryUnlock() {
    const previousState = Atomics.compareExchange(
      this.#bufferView,
      Mutex.#LOCATION,
      Mutex.#LOCKED,
      Mutex.#UNLOCKED,
    );

    return previousState === Mutex.#LOCKED;
  }

  /**
   * Notify agents waiting on the specified location, which will wake
   * them up and allow their execution to continue.
   *
   * @note
   * This is only supported for an `Int32Array` or `BigInt64Array`
   * that views a `SharedArrayBuffer`.
   */
  #notifyAgents() {
    const NUM_AGENTS_TO_NOTIFY = 1;
    Atomics.notify(this.#bufferView, Mutex.#LOCATION, NUM_AGENTS_TO_NOTIFY);
  }

  /**
   * @param {unknown} value 
   */
  #ensureSharedArrayBuffer(value) {
    if (!(value instanceof SharedArrayBuffer)) {
      throw new Error("Expected a 'SharedArrayBuffer'.");
    }

    const MIN_BYTES = Int32Array.BYTES_PER_ELEMENT;
    if (value.byteLength < MIN_BYTES) {
      throw new Error(`Expected at least a ${MIN_BYTES}-byte buffer.`);
    }
  }
}
