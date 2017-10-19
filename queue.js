const log = require('debug')('simple-job-queue');

const watcher = (waitTime, getNextJob, onJob, onJobCompleted) => {
  let interval;
  let job;
  const watch = () => interval = setInterval(job, waitTime);
  job = () => {
    const job = getNextJob();
    if (!job) {
      return;
    }
    // Now handling an item. Do not start another worker
    clearInterval(interval);
    log('Trying to handle job', job);
    onJob(job)
      .then(() => {
        log('Handled job', job);
        onJobCompleted();        
      })
      .catch(err => log('There was an error with', job, err))
      .then(watch);
  };
  log('Started watching');
  watch();
};

const createQueue = (handler, waitTime = 1000) => {
  const items = [];
  watcher(
    waitTime,
    () => items[0],
    handler, 
    () => items.shift()
  );
  return {
    add(item) {
      items.push(item);
    }
  };
};

module.exports = createQueue;