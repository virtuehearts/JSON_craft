const memoryEntries = [];

function saveEntry({ filename, mimetype, size, json, reasoning }) {
  const id = `${Date.now()}-${memoryEntries.length + 1}`;
  const stored = {
    id,
    filename,
    mimetype,
    size,
    json,
    reasoning,
    createdAt: new Date().toISOString()
  };
  memoryEntries.unshift(stored);
  return stored;
}

export const demoGalleryStore = {
  get entries() {
    return memoryEntries;
  },
  saveEntry
};
