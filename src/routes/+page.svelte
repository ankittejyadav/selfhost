<script>
  import Clock from "../lib/clock.svelte";

  const calendarUrl =
    "https://calendar.google.com/calendar/embed?src=ankittejyadav%40gmail.com&ctz=America%2FNew_York";
</script>

<main>
  <div class="max-w-7xl mx-auto p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My schedule</h1>
      <Clock />
    </div>

    <iframe
      class="w-full aspect-video border-0"
      src={calendarUrl}
      title="Schedule"
    ></iframe>

    <style>
    </style>
  </div>
</main>
