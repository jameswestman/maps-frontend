<script>
  import { onMount } from "svelte";
  import { Modal, ModalBody, ModalHeader } from "@sveltestrap/sveltestrap";

  let isOpen = false;
  const toggle = () => {
    isOpen = !isOpen;
  };

  onMount(() => {
    window.showAttributionDialog = () => {
      isOpen = true;
    };
  });

  const attribution = [
    {
      name: "OpenStreetMap",
      description:
        "Worldwide street, place, point-of-interest, and other data from OpenStreetMap.",
      link: "https://www.openstreetmap.org/copyright",
    },
    {
      name: "ArcticDEM",
      description: "Hillshade and terrain data above 60°N latitude",
      link: "https://www.pgc.umn.edu/data/arcticdem/",
    },
    {
      name: "SRTM",
      description: "Hillshade and terrain data below 60°N latitude",
      link: "https://www.earthdata.nasa.gov/sensors/srtm",
    },
    {
      name: "Natural Earth",
      description: "High-level geographic and cultural features",
      link: "https://www.naturalearthdata.com/",
    },
    {
      name: "Wikidata",
      description: "Supplemental data and translations",
      link: "https://www.wikidata.org/",
    },
    {
      name: "OpenMapTiles",
      description: "Map data schema",
      link: "https://openmaptiles.org/",
    },
    {
      name: "OSM Lake Labels",
      description: "Lake line labels processed from OpenStreetMap",
      link: "https://github.com/acalcutt/osm-lakelines",
    },
    {
      name: "OSM Water Polygons",
      description: "Ocean/sea polygons processed from OpenStreetMap",
      link: "https://osmdata.openstreetmap.de/",
    },
    {
      name: "OSM Americana",
      description: "Highway shield icons",
      link: "https://americanamap.org/",
    },
  ];

  attribution.sort((a, b) => a.name.localeCompare(b.name));
</script>

<Modal {isOpen} {toggle} scrollable>
  <ModalHeader {toggle}>Attribution</ModalHeader>
  <ModalBody>
    {#each attribution as { name, description, link }}
      <div class="mb-3">
        <h5><a href={link} target="_blank">{name}</a></h5>
        <p>{description}</p>
      </div>
    {/each}
  </ModalBody>
</Modal>
