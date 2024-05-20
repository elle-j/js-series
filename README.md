# JS Series

This is a collection of demonstrations and deep dives of lesser-known JS/ECMAScript features.

## Projects

| Main Topic                      | Description   | Link |
|---------------------------------|---------------|------
| **Atomics and shared memory**   | Parallelism in JS can be enabled by creating multiple threads via Workers. All threads could potentially access the same memory at the same time, introducing interesting concurrency issues. I will use [Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) to demonstrate how that API can be used to handle concurrent writes by implementing a counter. | [link](./atomics/)
