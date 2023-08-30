<script lang="ts">
  import { Theme, theme, resolvedTheme } from "../theme";
  import { Button, ButtonGroup } from "sveltestrap";
</script>

<ButtonGroup class="w-100">
  <Button
    active={$resolvedTheme === "light"}
    on:click={() => theme.set(Theme.LIGHT)}
  >
    Light
  </Button>
  <Button
    active={$resolvedTheme === "dark"}
    on:click={() => theme.set(Theme.DARK)}
  >
    Dark
  </Button>
</ButtonGroup>
