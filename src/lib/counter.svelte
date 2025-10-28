<script>
  // 1. Script block for logic and state
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<div class="counter-box">
  <p>The count is: <strong>{count}</strong></p>
  <button on:click={increment}>Click Me!</button>
</div>

<style>
  .counter-box {
    padding: 20px;
    border: 1px solid #ff3e00;
    border-radius: 8px;
    text-align: center;
    background-color: #f8f8f8;
  }
  button {
    background-color: #ff3e00;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
