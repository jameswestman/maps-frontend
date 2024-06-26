/*
 * Copyright (C) 2024 James Westman <james@jwestman.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, see <https://www.gnu.org/licenses/>.
 */

import { DEFS } from "./defs";

export const hillshadeLayer = (config) => ({
  id: "hillshade",
  type: "hillshade",
  source: "terrain",
  layout: {},
  paint: {
    "hillshade-shadow-color": config.pick(DEFS.hillshade.shadow),
    "hillshade-accent-color": config.pick(DEFS.hillshade.accent),
    "hillshade-highlight-color": config.pick(DEFS.hillshade.highlight),
    "hillshade-exaggeration": {
      stops: [
        [0, 0.5],
        [10, 0.5],
        [14, 0.1],
      ],
    },
  },
});
