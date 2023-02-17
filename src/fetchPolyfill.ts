export const fetchPolyfill = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!globalThis.fetch) {
    await import("node-fetch").then(
      ({ default: fetch, Headers, Request, Response }) => {
        Object.assign(globalThis, { fetch, Headers, Request, Response });
      }
    );
  }
};
