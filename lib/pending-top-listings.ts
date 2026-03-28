const pendingTopListings = new Map<
  string,
  { userId: string; listingData: any; createdAt: number }
>();

setInterval(
  () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [sessionId, data] of pendingTopListings) {
      if (data.createdAt < oneHourAgo) pendingTopListings.delete(sessionId);
    }
  },
  15 * 60 * 1000,
);

export { pendingTopListings };
