/**
 * This code will run in a background/worker thread.
 *
 * This file adds a listener to listen for incoming messages from the main
 * thread. Depending on the message, the worker will start updating the counter.
 */

import { Counter } from "./counter.js";

/**
 * @typedef EventData
 * @type {object}
 * @property {"increment"|"decrement"} operation
 * @property {SharedArrayBuffer} sharedCounterBuffer
 */

/**
 * Handle incoming messages from the main thread and either
 * increment or decrement the count 100,000 times by 1.
 *
 * @param {MessageEvent<EventData>} event
 */
function handleMessageFromMain({ data }) {
  // The `counter` is instantiated here rather than sent as data due to how
  // objects are cloned when passed between threads. Internally, objects are
  // passed to the global `structuredClone()` which does not walk the prototype chain.
  const counter = new Counter(data.sharedCounterBuffer);

  let numUpdates = 100_000;
  switch (data.operation) {
    case "increment":
      console.log("Incrementing..");
      while (numUpdates-- > 0) {
        counter.increment();
      }
      break;
    case "decrement":
      console.log("Decrementing..");
      while (numUpdates-- > 0) {
        counter.decrement();
      }
      break;
    default:
      return;
  }

  console.log(`${self.name} is done counting!`);
  postMessage({ done: true, count: counter.value });
}
onmessage = handleMessageFromMain;
