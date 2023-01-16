const cron = require('node-cron');
const sleepSavior = require('../sleepSavior');
const axios = require('axios');

const healthService = require('../service/health');
const forkHistoryService = require('../service/forkHistory');

//1분마다 서버 상태 체크
cron.schedule('*/1 * * * *', async () => {
    await healthService.checkServerAlive();
    console.log('check server alive');
});

//10분마다 등록 지연 확인
cron.schedule('*/10 * * * *', async () => {
    sleepSavior.alert("------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
    await forkHistoryService.forkDelay();
    await forkHistoryService.crawlDelay();
    await forkHistoryService.serverCrawlDelay();
    sleepSavior.alert("------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
});

//cron every 1 hour
cron.schedule('0 */1 * * *', async () => {
    await forkHistoryService.logFork();
})