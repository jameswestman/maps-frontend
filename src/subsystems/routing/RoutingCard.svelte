<script lang="ts">
  import {
    Alert,
    ButtonGroup,
    Card,
    CardBody,
    ListGroup,
    ListGroupItem,
    Spinner,
  } from "@sveltestrap/sveltestrap";
  import { Subsystems } from "../Subsystem";
  import { RoutingSubsystem } from "./RoutingSubsystem";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { unitAbbrev } from "./api-types";
  import { getInstructionIcon } from "./icons";
  import {
    faArrowLeft,
    faGripVertical,
  } from "@fortawesome/free-solid-svg-icons";
  import ModeButton from "./ModeButton.svelte";
  import { AppState } from "../../AppState";

  const appState = AppState.fromContext();
  const routing = Subsystems.fromContext().get(RoutingSubsystem);
  const stops = routing.stops;
  const routeResultState = routing.route;
  const loading = routing.loading;

  let dragOffsetY = 0;
  let dragStartY = 0;
  let clientY = 0;
  let dragHeight = 0;
  let dragFrom: number | null = null;
  let dragTo: number | null = null;

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)} s`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} m`;
    } else {
      return `${Math.round(seconds / 3600)} h ${Math.round((seconds % 3600) / 60)} m`;
    }
  };

  const dragstart = (e: DragEvent, idx: number) => {
    dragFrom = idx;
    dragTo = idx;
    dragStartY = e.clientY;
    const listGroupItem = (e.target as HTMLElement).closest(".list-group-item");
    dragHeight = listGroupItem.clientHeight;

    dragOffsetY = e.clientY - listGroupItem.getBoundingClientRect().top;

    e.dataTransfer.effectAllowed = "move";
    const img = document.createElement("img");
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const dragover = (e: DragEvent, idx: number, offset: number) => {
    const listGroupItem = (e.target as HTMLElement).closest(".list-group-item");

    const topEdge = e.clientY - dragOffsetY;
    const midpoint = topEdge + dragHeight / 2;
    const ourTopEdge = listGroupItem.getBoundingClientRect().top - offset;
    const ourMidpoint = ourTopEdge + listGroupItem.clientHeight / 2;

    if (idx <= dragTo && midpoint < ourMidpoint) {
      if (idx > dragFrom) {
        dragTo = idx - 1;
      } else {
        dragTo = idx;
      }
    } else if (idx >= dragTo && midpoint > ourMidpoint) {
      if (idx < dragFrom) {
        dragTo = idx + 1;
      } else {
        dragTo = idx;
      }
    }
  };

  const mousemove = (e: MouseEvent) => {
    clientY = e.clientY;
  };

  const dragend = (e: DragEvent) => {
    routing.reorderStop(dragFrom, dragTo);
    dragFrom = null;
    dragTo = null;
  };

  const setCosting = (
    e: CustomEvent<{ mode: "auto" | "bicycle" | "pedestrian" }>
  ) => {
    routing.costing = e.detail.mode;
  };

  const closeSidebar = () => {
    appState.activeSidebarTab.set(null);
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:dragover={mousemove} class="stops-card-wrapper">
  <Card class="scroll overflow-hidden">
    <div class="py-1 d-flex align-items-center justify-content-between">
      <span class="d-flex align-items-center">
        <button class="btn" type="button" on:click={closeSidebar}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h5 class="m-0">Directions</h5>
      </span>

      {#if $loading}
        <span class="pe-3">
          <Spinner size="sm" />
        </span>
      {/if}
    </div>

    <ButtonGroup class="mx-2 mb-2">
      <ModeButton
        activeMode={routing.costing}
        mode="auto"
        on:click={setCosting}
      />
      <ModeButton
        activeMode={routing.costing}
        mode="bicycle"
        on:click={setCosting}
      />
      <ModeButton
        activeMode={routing.costing}
        mode="pedestrian"
        on:click={setCosting}
      />
    </ButtonGroup>

    <ListGroup flush>
      {#each $stops as stop, idx}
        {@const offset =
          idx === dragFrom
            ? clientY - dragStartY
            : idx > dragFrom && idx <= dragTo
              ? -dragHeight
              : idx < dragFrom && idx >= dragTo
                ? dragHeight
                : 0}
        <li
          class="list-group-item stop-item"
          class:dragging={dragFrom === idx}
          style:--offset-y={offset + "px"}
          on:dragstart={(e) => dragstart(e, idx)}
          on:dragover={(e) => dragover(e, idx, offset)}
          on:dragend={dragend}
          role="listitem"
          draggable="true"
        >
          <div class="d-flex justify-content-between">
            <span class="d-flex flex-row align-items-center">
              <span class="drag-handle me-2 opacity-50">
                <FontAwesomeIcon icon={faGripVertical} />
              </span>
              <span>
                {stop.name}
              </span>
            </span>
            <button
              class="btn btn-link"
              style="padding: 0; color: var(--bs-body-color);"
              title="Remove stop"
              on:click={() => {
                routing.removeStop(idx);
              }}
            >
              <FontAwesomeIcon icon={"xmark"} />
            </button>
          </div>
        </li>
      {/each}
    </ListGroup>
  </Card>
</div>

{#if $routeResultState.status === "error"}
  <Alert color="danger" class="mt-3">Failed to get directions</Alert>
{/if}

{#if $stops.length === 1}
  <Alert color="info" class="mt-3">Add another stop to get directions</Alert>
{:else if $stops.length === 0 && !$loading}
  <Alert color="info" class="mt-3">Add stops to get directions</Alert>
{/if}

{#if $routeResultState.status === "loading"}
  <Card class="mt-3">
    <CardBody>
      <Spinner />
    </CardBody>
  </Card>
{:else if $routeResultState.status === "success" && $routeResultState.value}
  <Card class="overflow-auto mt-3">
    <CardBody>
      <div class="d-flex justify-content-between">
        <span class="fs-4">
          <FontAwesomeIcon icon="clock" />
          {formatTime($routeResultState.value.trip.summary.time)}
        </span>
        <span class="fs-4">
          <FontAwesomeIcon icon="road" />
          {$routeResultState.value.trip.summary.length.toFixed(2)}
          {unitAbbrev($routeResultState.value.trip.units)}
        </span>
      </div>

      {#if $routeResultState.value.trip.summary.has_toll}
        <div class="mt-2 text-warning">
          <FontAwesomeIcon icon="coins" />
          Toll road
        </div>
      {/if}

      {#if $routeResultState.value.trip.summary.has_ferry}
        <div class="mt-2 text-warning">
          <FontAwesomeIcon icon="ferry" />
          Toll road
        </div>
      {/if}
    </CardBody>
    <ListGroup flush>
      {#each $routeResultState.value.trip.legs as leg}
        {#each leg.maneuvers as maneuver}
          <ListGroupItem>
            <FontAwesomeIcon
              icon={getInstructionIcon(maneuver.type, routing.costing)}
            />
            {maneuver.instruction}
          </ListGroupItem>
        {/each}
      {/each}
    </ListGroup>
  </Card>
{/if}

<style>
  .stop-item {
    transform: translate(0px, var(--offset-y, 0px));
  }

  .stop-item.dragging {
    pointer-events: none;
    z-index: 1000;
    border-top-width: var(--bs-list-group-border-width);
    border-bottom-width: var(--bs-list-group-border-width);
  }
</style>
