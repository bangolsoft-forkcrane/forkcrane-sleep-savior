const client = require('../../db');
const moment = require("moment");
const sleepSavior = require("../../sleepSavior");

let crawlDelayResult = []
let serverCrawlResult = []

//수집 지연건 확인
async function crawlDelay() {
    await client.query("select count(fh.id) as crawlcount, fh.id as forkhistoryid, fh.crawl_start_date from crawl_detail join fork_history fh on fh.id = crawl_detail.fork_history_id where fh.status = 'CRAWLING' and crawl_detail.crawl_result = 'WAIT' group by fh.id", async (err, res) => {
        //filter res.rows fork_start_date is over 10 minutes ago
        let result = res.rows.map(data => {
            return {crawlCount:data.crawlcount, forkHistoryId:data.forkhistoryid, delayedTime: moment(data.crawl_start_date).fromNow()}
        })

        let msg = '';
        //check if crawl count is same as before and if it is, alert it to slack channel #sleep-savior
        if(result.length > 0 && crawlDelayResult.length > 0){
            for (let resultElement of result) {
                for (let crawlDelayResultElement of crawlDelayResult) {
                    if(resultElement.forkHistoryId === crawlDelayResultElement.forkHistoryId){
                        if(resultElement.crawlCount === crawlDelayResultElement.crawlCount){
                            msg += `${resultElement.forkHistoryId} : ${resultElement.delayedTime} 지연되었습니다.\n`
                        }
                    }
                }
            }
        }

        if(msg !== ''){
            sleepSavior.alert("수집 지연 확인",msg);
        }
        else {
            sleepSavior.normal("수집 지연 확인","현재 수집 지연건이 없습니다.");
        }
        crawlDelayResult = result;
    });
}

//크롤링 서버 수집 중단 확인
async function serverCrawlDelay() {
    await client.query("select count(cs.mac_address), cs.mac_address, cs.description from crawl_detail join fork_history fh on fh.id = crawl_detail.fork_history_id join crawl_server cs on fh.mac_address = cs.mac_address where fh.status = 'CRAWLING' and crawl_detail.crawl_result = 'WAIT' group by cs.mac_address", async (err, res) => {
        //filter res.rows fork_start_date is over 10 minutes ago
        let result = res.rows.map(data => {
            return {crawlCount:data.count, macAddress:data.mac_address, description: data.description}
        })

        let msg = '';
        //check if crawl count is same as before and if it is, alert it to slack channel #sleep-savior
        if(result.length > 0 && serverCrawlResult.length > 0){
            for (let resultElement of result) {
                for (let crawlDelayResultElement of serverCrawlResult) {
                    if(resultElement.macAddress === crawlDelayResultElement.macAddress){
                        if(resultElement.crawlCount === crawlDelayResultElement.crawlCount){
                            msg += `${resultElement.macAddress}(${resultElement.description}) 수집 개수가 ${resultElement.crawlCount}로 이전 10분 전과 동일한 수치입니다.\n`
                        }
                    }
                }
            }
        }

        if(msg !== ''){
            sleepSavior.alert("크롤링 서버 수집 중단 확인",msg);
        }
        else {
            sleepSavior.normal("크롤링 서버 수집 중단 확인","현재 크롤링 서버 수집 중단건이 없습니다.");
        }
        serverCrawlResult = result;
    });
}
//60분 단위로 등록 정보 확인
async function logFork() {
    //date 60 minutes ago from now in kst time zone (9 hours ahead of utc) and format it to yyyy-mm-dd hh:mm:ss format for query to db server
    let date = moment().utcOffset(540).subtract(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    await client.query(`select count(id), fork_result, store_division, fail_type from fork_history_detail where created_date > DATE('${date}') group by fork_result, store_division, fail_type`, async (err, res) => {
        //filter res.rows fork_start_date is over 10 minutes ago
        let result = res.rows.map(data => {
            return {count:data.count, forkResult:data.fork_result, storeDivision: data.store_division, failType: data.fail_type}
        })

        let coupangFailCount = result.filter(data => data.forkResult === 'FAIL' && data.storeDivision === 'COUPANG').reduce((acc, cur) => acc + parseInt(cur.count), 0);
        //sum of count forkResult is FAIL and storeDivision is SMARTSTORE
        let smartstoreFailCount = result.filter(data => data.forkResult === 'FAIL' && data.storeDivision === 'SMARTSTORE').reduce((acc, cur) => acc + parseInt(cur.count), 0);

        //find data of forkResult is 'SUCCESS' and storeDivision is SMARTSTORE
        let smartStoreSuccessCount = result.find(data => data.forkResult === 'SUCCESS' && data.storeDivision === 'SMARTSTORE').count
        let coupangSuccessCount = result.find(data => data.forkResult === 'SUCCESS' && data.storeDivision === 'COUPANG').count

        //msg date from 60 minutes ago to now
        let msg = `*${moment().utcOffset(540).subtract(60, 'minutes').format('YYYY-MM-DD HH:mm:ss')} ~ ${moment().utcOffset(540).format('YYYY-MM-DD HH:mm:ss')}*\n`
        msg += `쿠팡 등록 성공 건수 : ${coupangSuccessCount.toLocaleString()}, 쿠팡 등록 실패 건수 : ${coupangFailCount.toLocaleString()}\n`;
        msg += `스마트스토어 등록 성공 건수 : ${smartStoreSuccessCount.toLocaleString()}, 스마트스토어 등록 실패 건수 : ${smartstoreFailCount.toLocaleString()}\n`;
        msg += `\n`;
        msg += `쿠팡 등록 실패 사유 : ${coupangFailCount.toLocaleString()}\n`;
        for (let failType of result.filter(data => data.forkResult === 'FAIL' && data.storeDivision === 'COUPANG')) {
            msg += `- ${failType.failType} : ${failType.count.toLocaleString()}건\n`
        }
        msg += `\n`;
        msg += `스마트스토어 등록 실패 사유 : ${smartstoreFailCount.toLocaleString()}\n`;
        for (let failType of result.filter(data => data.forkResult === 'FAIL' && data.storeDivision === 'SMARTSTORE')) {
            msg += `- ${failType.failType} : ${failType.count.toLocaleString()}건\n`
        }
        sleepSavior.normal("등록 정보 확인",msg);
    });
}

//수집 지연건 확인
async function forkDelay() {
    await client.query("select fork_history.id as forkhistoryid, * from fork_history join users on fork_history.user_id = users.id where status = 'FORKING' order by fork_history.fork_start_date desc", async (err, res) => {
        //filter res.rows fork_start_date is over 10 minutes ago
        let result = res.rows.filter((forkHistory) => {
            const forkStartDate = moment(forkHistory.fork_start_date);
            const now = moment();
            const diff = now.diff(forkStartDate, 'minutes');
            return diff > 10;
        }).map(data => {
            return {forkHistoryId:data.forkhistoryid, userId:data.user_id, email:data.user_email, delayedTime: moment(data.fork_start_date).fromNow()}
        })

        let msg = '';
        for(let i = 0; i < result.length; i++){
            msg += `${result[i].forkHistoryId} : ${result[i].userId}(${result[i].email})님의 등록이 ${result[i].delayedTime} 지연되었습니다.\n`
        }

        if(msg !== ''){
            sleepSavior.alert("등록 지연 확인",msg);
        }
        else {
            sleepSavior.normal("등록 지연 확인","현재 등록 지연건이 없습니다.");
        }
    });
}
module.exports = {
    forkDelay, crawlDelay, serverCrawlDelay, logFork
}