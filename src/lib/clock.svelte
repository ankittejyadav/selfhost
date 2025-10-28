<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  const time = writable("");

  function updateTime() {
    const now = new Date();
    const options = {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    time.set(new Intl.DateTimeFormat("en-US", options).format(now));
  }

  onMount(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="clock">
  <p>
    ET Time: {$time}
  </p>
</div>

<style>
  .clock {
    font-family: monospace;
    display: inline-block;
  }
</style>
