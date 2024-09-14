<script lang="ts">
  import { ThemeVariant, theme, resolvedTheme } from "../theme";
  import { Button, ButtonGroup } from "@sveltestrap/sveltestrap";
</script>

<ButtonGroup class="w-100">
  <Button
    color={$resolvedTheme === "light" ? "light": "secondary"}
    active={$resolvedTheme === "light"}
    on:click={() => theme.set({ ...$theme, variant: ThemeVariant.LIGHT })}
  >
    Light
  </Button>
  <Button
    color={$resolvedTheme === "light" ? "light": "secondary"}
    active={$resolvedTheme === "dark"}
    on:click={() => theme.set({ ...$theme, variant: ThemeVariant.DARK })}
  >
    Dark
  </Button>
</ButtonGroup>
