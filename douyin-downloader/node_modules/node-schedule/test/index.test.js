import schedule, { 
  scheduleJob, 
  rescheduleJob, 
  cancelJob, 
  gracefulShutdown 
} from '../dist/index.js'

// 创建一个初始任务，定时每隔 5 秒执行一次
const job = scheduleJob('*/5 * * * * *', () => {
  console.log('任务每 5 秒执行一次');
});

// 创建一个额外的任务，每 3 秒执行一次
const job2 = scheduleJob('*/3 * * * * *', () => {
  console.log('任务 2 每 3 秒执行一次');
});

// 查看当前所有的调度任务
console.log('重新调度之前的任务列表:', Object.keys(schedule.scheduledJobs).length);

// 在 10 秒后重新调度第一个任务，使其每 2 秒执行一次
setTimeout(() => {
  console.log('正在重新调度任务...');
  rescheduleJob(job, '*/2 * * * * *');
}, 10000);

// 在 15 秒后取消第二个任务
setTimeout(() => {
  cancelJob(job2);
  console.log('任务 2 在 15 秒后被取消');
}, 15000);

// 在 20 秒后优雅关闭所有任务
setTimeout(() => {
  gracefulShutdown();
  console.log('所有任务已优雅关闭');
}, 20000);

// 程序运行 25 秒后结束
setTimeout(() => {
  console.log('程序结束');
  process.exit(0);
}, 25000);
