const pendingPrivateListings = new Map<
  string,
  { userId: string; listingData: any; createdAt: number }
>();

setInterval(
  () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [sessionId, data] of pendingPrivateListings) {
      if (data.createdAt < oneHourAgo) pendingPrivateListings.delete(sessionId);
    }
  },
  15 * 60 * 1000,
);

export { pendingPrivateListings };
