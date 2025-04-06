import { enqueueJobs } from "./src/queue.js";
import { worker } from "./src/worker.js";
const init = async () => {
  enqueueJobs();
  worker;
};
init();
