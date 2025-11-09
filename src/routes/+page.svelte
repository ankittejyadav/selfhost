<script>
  import Clock from "../lib/clock.svelte";

  const calendarUrl =
    "https://calendar.google.com/calendar/embed?src=ankittejyadav%40gmail.com&ctz=America%2FNew_York";

  // button
  let color = "blue";
  const toggle = () => {
    color = color === "blue" ? "red" : "blue";
  };
</script>

<main>
  <div class="max-w-7xl mx-auto p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My schedule</h1>
      <button
        class="px-4 py-2 rounded-md text-white"
        style="background-color: {color}"
        on:click={toggle}>Click</button
      >
      <Clock />
    </div>

    <iframe
      class="w-full aspect-video border-0"
      src={calendarUrl}
      title="Schedule"
    ></iframe>
  </div>
</main>

<style>
  button {
    transition: background-color 0.3s ease;
  }
</style>
