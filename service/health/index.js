const axios = require("axios");
const sleepSavior = require("../../sleepSavior");
const serverUrl = [{url:"https://itempoclain.com/actuator/health", name:"spring-platform"}, {url:"http://15.165.24.1:3000/health", name:"node-core"}, {url:"http://15.165.70.252/actuator/health", name:"spring-crawler"}, {url:"http://3.34.128.6/actuator/health", name:"spring-store"}]

async function checkServerAlive() {
    for (const server of serverUrl) {
        await axios.get(server.url)
            .then((response) => {
                if (response.status === 200) {
                }
                else {
                    sleepSavior.alert(`server ${server.name} is dead`)
                }
            })
            .catch((error) => {
                sleepSavior.alert(`server ${server.name} is dead`)
            })
    }
}
module.exports = {
    checkServerAlive
}