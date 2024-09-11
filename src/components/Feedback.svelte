<script lang="ts">
  import { Modal, ModalBody, ModalHeader } from "@sveltestrap/sveltestrap";

  let isOpen = false;

  export const toggle = () => {
    isOpen = !isOpen;
  };
</script>

<Modal {isOpen} {toggle} scrollable>
  <ModalHeader {toggle}>Feedback</ModalHeader>

  <ModalBody>
    <p>
      maps.jwestman.net is a hobby project and a work in progress. As much as I
      wish I could, I simply don't have the time and resources to implement
      every feature you'd see in a commercial maps app.
    </p>
    <p>
      That said, if you have any feedback or suggestions, or if you encounter any issues,
      please do let me know! The preferred way is to open an issue on <a
        href="https://github.com/jameswestman/maps-frontend/issues"
        target="_blank">GitHub</a
      >, but you can also email me at
      <a href="mailto:james@jwestman.net">james@jwestman.net</a>.
    </p>
  </ModalBody>
</Modal>
