export default function getTrackerId(id) {
  if (!id) {
    return null;
  }
  if (id.startsWith("-x-id-")) {
    return id.substr(6/*"-x-id-".length*/);
  } else {
    return null;
  }
}