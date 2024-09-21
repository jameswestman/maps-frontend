<script lang="ts">
  import ToolbarGroup from "../../components/toolbar/ToolbarGroup.svelte";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import {
    faMousePointer,
    faMapMarker,
    faArrowTrendUp,
    faDrawPolygon,
  } from "@fortawesome/free-solid-svg-icons";
  import ToolbarButton from "../../components/toolbar/ToolbarButton.svelte";
  import { Subsystems } from "../Subsystem";
  import { CustomMapsSubsystem } from "./CustomMapsSubsystem";

  const customMaps = Subsystems.fromContext().get(CustomMapsSubsystem);
  const fileLoader = customMaps.$fileLoader;
  $: editSession = $fileLoader?.$editSession;
  $: mode = $editSession?.mode;

  const modeHandler = (mode: string) => () => {
    $editSession?.setMode(mode);
  };
</script>

{#if $editSession}
  <ToolbarGroup title="Select">
    <ToolbarButton
      tooltip="Select"
      active={$mode === "select"}
      on:click={modeHandler("select")}
    >
      <FontAwesomeIcon icon={faMousePointer} />
    </ToolbarButton>
  </ToolbarGroup>

  <ToolbarGroup title="Add Features">
    <ToolbarButton
      tooltip="Add Marker"
      active={$mode === "point"}
      on:click={modeHandler("point")}
    >
      <FontAwesomeIcon icon={faMapMarker} />
    </ToolbarButton>
    <ToolbarButton
      tooltip="Add Path"
      active={$mode === "linestring"}
      on:click={modeHandler("linestring")}
    >
      <FontAwesomeIcon icon={faArrowTrendUp} />
    </ToolbarButton>
    <ToolbarButton
      tooltip="Add Area"
      active={$mode === "polygon"}
      on:click={modeHandler("polygon")}
    >
      <FontAwesomeIcon icon={faDrawPolygon} />
    </ToolbarButton>
  </ToolbarGroup>
{/if}
