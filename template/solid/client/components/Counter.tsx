import { Component, createSignal } from 'solid-js';

export const Counter: Component = () => {
  const [count, setCount] = createSignal(1);
  const increment = (by = 1) => setCount(count() + by);
  const decrement = (by = 1) => setCount(count() - by);

  return (
    <div>
      <h3 class="title">{count()}</h3>
      <p>
        <a class="button" href="#" onClick={() => decrement()}><b>Dec</b></a>
        <a class="button" href="#" onClick={() => increment()}><b>Inc</b></a>
      </p>
      <small>(play with the counter)</small>
    </div>
  );
};
