<script lang="ts">
  import { resolvedTheme } from "../../theme";

  export let title: string | null = null;
</script>

<span class="position-relative d-inline-flex">
  {#if title}
    <span
      class="top-0 start-0 end-0 position-absolute text-center text-truncate rounded-1"
      class:bg-dark={$resolvedTheme === "dark"}
      class:bg-light={$resolvedTheme === "light"}
      style="font-size: 0.7em; transform: translate(0, -100%); font-weight: bold;"
    >
      {title}
    </span>
  {/if}
  <div class="btn-group" role="group">
    <slot />
  </div>
</span>
