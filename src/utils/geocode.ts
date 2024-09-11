import type { Location } from "src/Place";
import protobuf from "protobufjs";
import vectorTile from "./vector_tile.proto?raw";

let tileCache = new Map<string, CachedTile>();

interface CachedTile {
  features: CachedFeature[];
  extent: number;
}

interface CachedFeature {
  fields: Record<string, any>;
  geometry: number[];
}

const zigzag = (n: number) => (n >> 1) ^ -(n & 1);

function* geometryIter(geometry: number[]) {
  let x = 0;
  let y = 0;
  let startX = 0,
    startY = 0;

  for (let i = 0; i < geometry.length; i++) {
    const command = geometry[i] & 0x7;
    const count = geometry[i] >> 3;

    for (let j = 0; j < count; j++) {
      switch (command) {
        case 1:
          /* Move to */
          x += zigzag(geometry[i + 1]);
          y += zigzag(geometry[i + 2]);
          startX = x;
          startY = y;
          yield { op: "move", x, y };
          i += 2;
          break;

        case 2:
          /* Line to */
          x += zigzag(geometry[i + 1]);
          y += zigzag(geometry[i + 2]);
          yield { op: "line", x, y };
          i += 2;
          break;

        case 7:
          /* Close path */
          yield { op: "close", x: startX, y: startY };
          break;
      }
    }
  }
}

const decodeValue = (value: any) =>
  value.stringValue ??
  value.floatValue ??
  value.doubleValue ??
  value.intValue ??
  value.uintValue ??
  value.sintValue ??
  value.boolValue;

export const reverseGeocode = async (location: Location) => {
  /* get the tile coordinates at z=10 */
  const x = ((location.lon + 180) / 360) * Math.pow(2, 10);
  const y =
    ((1 -
      Math.log(
        Math.tan((location.lat * Math.PI) / 180) +
          1 / Math.cos((location.lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    Math.pow(2, 10);
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);

  /* check the cache */
  const cacheKey = `${tileX}/${tileY}`;
  let tile = tileCache.get(cacheKey);

  if (!tile) {
    const tileResponse = await fetch(
      `https://tiles.maps.jwestman.net/data/geocode/10/${tileX}/${tileY}.pbf`
    );

    if (!tileResponse.ok) {
      throw new Error("Failed to fetch tile for reverse geocoding");
    }

    const messageType = protobuf
      .parse(vectorTile)
      .root.lookupType("vector_tile.Tile");
    const message: any = messageType.decode(
      new Uint8Array(await tileResponse.arrayBuffer())
    );

    tile = {
      features: [],
      extent: 0,
    };

    for (const layer of message.layers) {
      if (layer.name === "geocode") {
        tile.extent = layer.extent;

        for (const feature of layer.features) {
          /* only polygon features */
          if (feature.type !== 3) {
            continue;
          }

          const fields = {};
          for (let i = 0; i < feature.tags.length; i += 2) {
            const key = layer.keys[feature.tags[i]];
            const value = decodeValue(layer.values[feature.tags[i + 1]]);
            fields[key] = value;
          }

          tile.features.push({
            fields,
            geometry: feature.geometry,
          });
        }
      }
    }

    tileCache.set(cacheKey, tile);
  }

  const result = [];
  const pointX = (x - tileX) * tile.extent;
  const pointY = (y - tileY) * tile.extent;
  for (const feature of tile.features) {
    let prevX = 0,
      prevY = 0;
    let windingNumber = 0;

    for (const { op, x, y } of geometryIter(feature.geometry)) {
      if (op !== "move") {
        if (prevY <= pointY && y > pointY) {
          if ((x - prevX) * (pointY - prevY) > (y - prevY) * (pointX - prevX)) {
            windingNumber++;
          }
        } else if (prevY > pointY && y <= pointY) {
          if ((x - prevX) * (pointY - prevY) < (y - prevY) * (pointX - prevX)) {
            windingNumber--;
          }
        }
      }

      prevX = x;
      prevY = y;
    }

    if (windingNumber !== 0) {
      result.push(feature.fields);
    }
  }

  return result;
};
