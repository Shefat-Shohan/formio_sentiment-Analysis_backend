import { Worker } from "bullmq";
import { redisClient } from "../lib/redis.js";
import { sentimentAnalysisPrompt } from "../data/prompt.js";
import { sentimentAnalysis } from "../lib/aiModel.js";
import { pool } from "../lib/db.js"; 

const queueName = "sentiment-analysis";
export const worker = new Worker(
  queueName,
  async (job) => {
    console.log(`Processing job id: ${job.id}`);
    try {
      const processData =
        sentimentAnalysisPrompt.SENTIMENT_PROMPT + JSON.stringify(job.data);
      const aiResponse = await sentimentAnalysis(processData);

      if (!aiResponse || aiResponse.length === 0) {
        throw new Error("AI response failed or returned empty data.");
      }

      const db = await pool.connect();
      try {
        await db.query("BEGIN");

        for (const response of aiResponse) {
          if (!response.formRef) {
            console.warn("Invalid AI response format:", response);
            continue;
          }

          await db.query(
            `INSERT INTO "aiSentiment" ("sentimentResponse", "formRef", "status") 
             VALUES ($1, $2, $3)`,
            [JSON.stringify(response), response.formRef, 0]
          );

          const { rowCount } = await db.query(
            `UPDATE "userResponses" SET "status" = 2 WHERE "formRef" = $1`,
            [response.formRef]
          );
          if (rowCount === 0) {
            console.warn(`No rows updated for formRef: ${response.formRef}`);
          }
        }

        await db.query("COMMIT");
      } catch (error) {
        await db.query("ROLLBACK");
        console.error("Transaction failed:", error);

        // Reset status only if AI response contains valid `formRef`
        for (const response of aiResponse) {
          if (response.formRef) {
            await db.query(
              `UPDATE "userResponses" SET "status" = 0 WHERE "formRef" = $1`,
              [response.formRef]
            );
          }
        }
      } finally {
        db.release();
      }

      console.log(`Job id: ${job.id} completed`);
    } catch (error) {
      console.error(`Job id: ${job.id} failed.`, error);
    }
  },
  {
    connection: redisClient,
    concurrency: 10,
  }
);