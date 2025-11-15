<script>
  import Clock from "../lib/clock.svelte";

  const calendarUrl =
    "https://calendar.google.com/calendar/embed?src=ankittejyadav%40gmail.com&ctz=America%2FNew_York";

  // button
  let color = "blue";
  const toggle = () => {
    color = color === "blue" ? "red" : "blue";
  };

  /** @type {import('./$types').PageData} */
  export let data;
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

    <section class="mt-12">
      <h2 class="text-2xl font-bold mb-4">Recently Watched Videos</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.watchedVideos as video}
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            class="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            {#if video.thumbnail}
              <img
                src={video.thumbnail}
                alt={video.title}
                class="w-full h-48 object-cover"
              />
            {/if}

            <div class="p-4">
              <p class="font-semibold text-lg truncate" title={video.title}>
                {video.title}
              </p>
              <p class="text-sm text-gray-600 mt-2">
                Watched: {new Date(video.watchedAt).toLocaleString()}
              </p>
            </div>
          </a>
        {/each}

        {#if data.watchedVideos.length === 0}
          <p class="text-gray-500">
            No videos logged yet. Go watch some YouTube!
          </p>
        {/if}
      </div>
    </section>

    <div class="max-w-7xl mx-auto p-8">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <a
            href="/api/auth/login"
            class="text-sm font-medium text-blue-600 hover:underline"
          >
            Login to Spotify
          </a>
        </div>
      </div>
    </div>

    <section class="mt-12">
      <h2 class="text-2xl font-bold mb-4">Recently Played Podcasts</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.podcasts as podcast}
          <a
            href={podcast.url}
            target="_blank"
            rel="noopener noreferrer"
            class="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            {#if podcast.thumbnail}
              <img
                src={podcast.thumbnail}
                alt={podcast.title}
                class="w-full h-48 object-cover"
              />
            {/if}

            <div class="p-4">
              <p class="font-semibold text-lg truncate" title={podcast.title}>
                {podcast.title}
              </p>
              <!-- FIXED: Changed 'classs' to 'class' -->
              <p class="text-sm text-gray-700 mt-1">{podcast.artist}</p>

              <p class="text-sm text-gray-500 mt-2">
                Listened: {new Date(podcast.listenedAt).toLocaleString()}
              </p>
            </div>
          </a>
        {/each}

        {#if data.podcasts.length === 0}
          <p class="text-gray-500">
            No podcasts logged yet. Listen to a podcast on Spotify!
          </p>
        {/if}
      </div>
    </section>

    <section class="mt-12">
      <h2 class="text-2xl font-bold mb-4">Recently Played Music</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.music as track}
          <a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            class="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            {#if track.thumbnail}
              <img
                src={track.thumbnail}
                alt={track.title}
                class="w-full h-48 object-cover"
              />
            {/if}

            <div class="p-4">
              <p class="font-semibold text-lg truncate" title={track.title}>
                {track.title}
              </p>
              <p class="text-sm text-gray-700 mt-1">{track.artist}</p>

              <p class="text-sm text-gray-500 mt-2">
                Listened: {new Date(track.listenedAt).toLocaleString()}
              </p>
            </div>
          </a>
        {/each}

        {#if data.music.length === 0}
          <p class="text-gray-500">
            No music logged yet. Listen to some music on Spotify!
          </p>
        {/if}
      </div>
    </section>
  </div>
</main>

<style>
  button {
    transition: background-color 0.3s ease;
  }
</style>