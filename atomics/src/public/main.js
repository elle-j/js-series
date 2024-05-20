/**
 * This code will run on the main thread.
 *
 * This file instantiates the workers, adds listeners to listen for incoming
 * messages from the workers, adds event listeners to DOM elements to listen
 * for button-clicks, and sends messages to the workers to trigger updates.
 */

if (!Worker) {
  console.error("You need to use a browser that supports Web Workers for this example to work.");
}
if (!crossOriginIsolated) {
  console.error("The files served need to be cross-origin isolated for this example to work.");
}

// Create the buffers used as the shared memory. These will later be
// shared via `worker.postMessage()` when communicating with the workers.
const sharedCounterBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
const sharedMutexBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);

const NUM_WORKERS = 4;
const workers = initWorkers(NUM_WORKERS);

/**
 * Create background threads by initializing workers.
 *
 * @param {number} size - The number of workers to create.
 * @returns {Worker[]} The worker instances.
 */
function initWorkers(size) {
  const workers = [];
  for (let i = 0; i < size; i++) {
    const worker = new Worker("counting-worker.js", {
      name: `Worker #${i}`,
      type: "module",
    });
    worker.onmessage = handleMessageFromWorker;
    workers.push(worker);
  }

  return workers;
}

/**
 * Handle incoming messages from workers and show the count
 * if the worker has signaled that it is done counting.
 *
 * @param {MessageEvent<{done: boolean, count: number}>} event
 */
function handleMessageFromWorker({ data }) {
  if (data.done) {
    showCurrentCount(data.count);
  }
}

/**
 * Trigger concurrent increments by sending messages
 * to the workers with an "increment" instruction.
 */
function triggerConcurrentIncrements() {
  for (const worker of workers) {
    worker.postMessage({
      operation: "increment",
      sharedCounterBuffer,
      sharedMutexBuffer,
    });
  }
}
const incrementElement = getElementById("increment");
incrementElement.onclick = triggerConcurrentIncrements;

/**
 * Trigger concurrent decrements by sending messages
 * to the workers with a "decrement" instruction.
 */
function triggerConcurrentDecrements() {
  for (const worker of workers) {
    worker.postMessage({
      operation: "decrement",
      sharedCounterBuffer,
      sharedMutexBuffer,
    });
  }
}
const decrementElement = getElementById("decrement");
decrementElement.onclick = triggerConcurrentDecrements;

const counterElement = getElementById("counter");
/**
 * @param {number} count - The count to display.
 */
function showCurrentCount(count) {
  counterElement.textContent = count.toLocaleString();
}

/**
 * @param {string} id - The element's id.
 * @returns {HTMLElement} The element with the given ID.
 */
function getElementById(id) {
  const element = document.getElementById(id);
  if (element) {
    return element;
  }
  throw new Error(`An element with id ${id} does not exist.`);
}
