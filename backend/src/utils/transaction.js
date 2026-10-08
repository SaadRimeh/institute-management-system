import mongoose from "mongoose";

/**
 * Executes a callback within a MongoDB transaction if replica sets are enabled,
 * or gracefully runs it standalone if running in local single-instance mode.
 *
 * @template T
 * @param {(session: mongoose.ClientSession | null) => Promise<T>} work
 * @returns {Promise<T>}
 */
export const runInTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    try {
      await session.withTransaction(async () => {
        result = await work(session);
      });
      return result;
    } catch (txError) {
      // Check if the error is due to MongoDB running as a standalone server without replica set
      const isStandaloneError =
        txError.message?.includes("replica set") ||
        txError.message?.includes("Transaction numbers are only allowed") ||
        txError.codeName === "IllegalOperation";

      if (isStandaloneError) {
        // Fallback execution without transaction for standalone development instances
        return await work(null);
      }
      throw txError;
    }
  } finally {
    session.endSession();
  }
};
