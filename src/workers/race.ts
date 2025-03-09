import { parentPort, workerData } from 'worker_threads';

const { name, raceLength, sharedBuffer } = workerData;
const raceOverFlag = new Int32Array(sharedBuffer);
let distance = 0;

(function run() {
    if (Atomics.load(raceOverFlag, 0) === 1) return; // 比賽已經結束

    if (distance <= raceLength) {
        distance += 20; // 每次跑 20 公尺
    } else {
        distance = raceLength; // 確保距離不超過比賽距離
        Atomics.store(raceOverFlag, 0, 1); // 設置比賽結束標誌
    }

    parentPort?.postMessage({ name, distance });

    sleep(100).then(run); // 模擬跑步時間
})();

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}