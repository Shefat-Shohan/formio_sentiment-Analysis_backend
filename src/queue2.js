import { Queue } from "bullmq";
import { redisClient } from "../lib/redis.js";
import { pool } from "../lib/db.js";

const queueName = "mergeFeedback";
const queue = new Queue(queueName, { connection: redisClient });

export const mergeFeedback = async () => {
  console.log("Checking for unprocessed feedback...");

  const db = await pool.connect();
  try {
    const { rows } = await db.query(
      'SELECT * FROM "aiSentiment" WHERE "status" = 0 LIMIT 10'
    );
    if (rows.length === 0) {
      console.log("No new jobs found, refetching...");
      return; // exit if no unprocessed responses are found
    }
    // update the database processing state to true to prevent duplicate task
    const ids = rows.map((row) => row.id);
    await db.query(
      `UPDATE "aiSentiment"  SET "status" = 1  WHERE id = ANY(ARRAY[${ids}])`
    );
    await queue.add("aggregate-feedback", rows);
    console.log(`Added ${rows.length} jobs to the queue.`);
  } catch (error) {
    console.error("Error enqueueing jobs", error);
  } finally {
    db.release();
  }
};

setInterval(mergeFeedback, 60000);
