import { Component, createSignal } from 'solid-js';

export const App: Component = () => {
  const [count, setCount] = createSignal(0);
  const increment = (by = 1) => setCount(count() + by);
  const decrement = (by = 1) => setCount(count() - by);

  return (
    <>
      <button
        type="button"
        onClick={[decrement, 2]}
        class="bg-gray-900 text-gray-100 p-4 text-3xl"
      >
        -
      </button>
      <span class="p-4 text-3xl">{count()}</span>
      <button
        type="button"
        onClick={[increment, 1]}
        class="bg-gray-900 text-gray-100 p-4 text-3xl"
      >
        +
      </button>
    </>
  );
};