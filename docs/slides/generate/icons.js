const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa6 = require("react-icons/fa6");

const cache = new Map();

async function iconPngBase64(iconName, colorHex, px = 256) {
  const key = iconName + ":" + colorHex + ":" + px;
  if (cache.has(key)) return cache.get(key);
  const Comp = fa6[iconName];
  if (!Comp) throw new Error("Unknown icon: " + iconName);
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color: "#" + colorHex, size: px })
  );
  const svgFull = svg.includes("<svg")
    ? svg
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}">${svg}</svg>`;
  const buf = await sharp(Buffer.from(svgFull)).png().toBuffer();
  const b64 = "image/png;base64," + buf.toString("base64");
  cache.set(key, b64);
  return b64;
}

module.exports = { iconPngBase64 };
