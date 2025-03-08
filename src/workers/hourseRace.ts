import { parentPort, workerData } from 'worker_threads';
import { sleep } from '../utils/sleep';

const { name, raceLength, sharedBuffer } = workerData;
const raceOverFlag = new Int32Array(sharedBuffer); // 共享變數
let distance = 0;
const speed = 5; // 固定速度

function runRace() {
    // 每次移動前，先檢查比賽是否已結束
    if (Atomics.load(raceOverFlag, 0) === 1) {
        process.exit(0); // 比賽結束，立即退出 Worker
    }

    distance += speed; // 速度固定
    console.log(`${name} 跑了 ${distance} 公尺`);
    parentPort?.postMessage({ name, distance });

    if (distance >= raceLength) {
        parentPort?.postMessage({ winner: name });

        // 設定比賽結束標誌
        Atomics.store(raceOverFlag, 0, 1);
        process.exit(0);
    } else {
        sleep(100).then(runRace);
    }
}

runRace();
