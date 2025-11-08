<script>
  import { onMount } from "svelte";
  // import { writable } from "svelte/store";

  let time = "";

  function updateTime() {
    const now = new Date();
    const options = {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    time = new Intl.DateTimeFormat("en-US", options).format(now);
  }

  //when the page loads run this function
  onMount(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval); //clear interval if i navigate to a different page to avoid memory leak
  });
</script>

<div class="p-6 rounded-lg bg-gray-100 shadow-md">
  <p class="text-sm text-gray-600">My Time</p>
  <p class="text-4xl font-mono font-semibold text-gray-900">
    {time}
  </p>
</div>

<style>
</style>
