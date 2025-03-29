import { parentPort, workerData } from 'worker_threads';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

parentPort?.on('message', async (workerData) => {
    const { name, raceLength, sharedBuffer } = workerData;
    const raceOverFlag = new Int32Array(sharedBuffer);
    let distance = 0;

    while (distance < raceLength && Atomics.load(raceOverFlag, 0) === 0) {
        distance += 10; // 增加距離

        if (distance >= raceLength) {
            distance = raceLength;
        }

        parentPort?.postMessage({ name, distance });

        if (distance < raceLength) {
            await sleep(1); // 繼續跑
        }
    }
});
