import { Queue } from "bullmq";
import { redisClient } from "../lib/redis.js";
import { pool } from "../lib/db.js";

const queueName = "sentiment-analysis";
const queue = new Queue(queueName, { connection: redisClient });

export async function enqueueJobs() {
  console.log("Checking for unprocessed response...");

  const db = await pool.connect();
  try {
    const { rows } = await db.query(
      'SELECT * FROM "userResponses" WHERE "status" = 0  LIMIT 50'
    );

    if (rows.length === 0) {
      console.log("No new jobs found, refetching...");
      return; // Gracefully exit if no unprocessed responses are found
    }

    // update the database processing state to true to prevent duplicate task
    const ids = rows.map((row) => row.id);
    await db.query(
      `UPDATE "userResponses"  SET "status" = 1  WHERE id = ANY(ARRAY[${ids}])`
    );
    await queue.add("process-feedback", rows);
    console.log(`Added ${rows.length} jobs to the queue.`);
  } catch (error) {
    console.error("Error enqueueing jobs", error);
  } finally {
    db.release();
  }
}

// check every minute
setInterval(enqueueJobs, 30000000);
