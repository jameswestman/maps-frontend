import "./app.css";
import App from "./App.svelte";
import "bootstrap/dist/css/bootstrap.min.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faClock,
  faCoins,
  faFerry,
  faRoad,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

library.add(faUsers, faXmark, faCoins, faClock, faRoad, faFerry);

const app = new App({
  target: document.getElementById("app"),
});

export default app;
