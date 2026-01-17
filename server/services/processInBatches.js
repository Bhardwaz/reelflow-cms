// /// this is helper function for processing https request to joonweb in batches to be gentle with server 
// //const productsCache = require("./cacheStore")

// async function processInBatches(productsIds, batchSize, iteratorFn) {
//     // const missingIds = productsIds.filter(id => !productsCache.has(id))

//     for (let i = 0; i <= missingIds.length - 1; i += batchSize) {
//         const batch = productsIds.slice(i, i + batchSize);

//         // processing this batch 
//         await Promise.all(batch.map(iteratorFn));

//         // adding a small throttle to take a gap between batch requesting so third party server does not overwhelm with requests 
//         if (i + batchSize < productsIds?.length) {
//             await new Promise(resolve => setTimeout(resolve, 500));
//         }
//     }
//     const fullList = productsIds.map(id => productsCache.get(id));
//     return fullList.filter(item => item !== undefined);
// }

// module.exports = processInBatches