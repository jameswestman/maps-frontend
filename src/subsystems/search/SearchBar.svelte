<script lang="ts">
  import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { SearchSubsystem } from "./SearchSubsystem";
  import { Subsystems } from "../Subsystem";
  import { get } from "svelte/store";

  const search = Subsystems.fromContext().get(SearchSubsystem);
  const query = search.query;

  const onFocus = () => search.inputFocused.set(true);
  const onBlur = () => search.inputFocused.set(false);

  const onKeyPress = (e) => {
    if (e.key === "Enter") {
      doSearch();
    }

    onChange();
  };

  const onChange = () => {
    search.results.set(null);
  };

  const doSearch = async () => {
    const nominatim = await import("./NominatimAPI");
    search.results.set(nominatim.doSearch(get(query)));
  };
</script>

<div class="input-group">
  <input
    type="text"
    placeholder="Search"
    class="form-control"
    bind:value={$query}
    on:focus={onFocus}
    on:blur={onBlur}
    on:keypress={onKeyPress}
    on:change={onChange}
  />
  <button class="btn btn-primary" type="button" on:click={doSearch}>
    <FontAwesomeIcon icon={faMagnifyingGlass} />
  </button>
</div>
