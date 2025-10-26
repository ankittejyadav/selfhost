<script>
  import Counter from "../lib/Counter.svelte";
  // The default boilerplate might have code you can delete here.

  const albumUrl = "https://photos.app.goo.gl/rcAYZJJ43fanFhtP6";
</script>

<main>
  <h1>My First Svelte App</h1>
  <p>This is my custom counter component:</p>

  <Counter />

  <p>And here is a second, independent counter:</p>
  <Counter />
</main>

<h1>My schedule</h1>
<iframe
  src="https://calendar.google.com/calendar/embed?src=ankittejyadav%40gmail.com&ctz=America%2FNew_York"
  style="border: 0"
  width="100%"
  height="1000"
  frameborder="0"
  scrolling="no"
  title="Schedule"
></iframe>

<h1>My Photo Album</h1>

<iframe
  src={albumUrl}
  width="100%"
  height="800"
  style="border:0;"
  allowfullscreen
  title="Album"
></iframe>

<style>
  /* Keep the existing styles or add your own */
</style>
