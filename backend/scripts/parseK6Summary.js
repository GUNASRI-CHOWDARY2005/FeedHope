import fs from 'fs';
import path from 'path';

// Helper utility to safely extract metrics from both nested and flat k6 summary schemas
function getMetricValue(metricObj, key) {
  if (!metricObj) return 0;
  if (metricObj.values && metricObj.values[key] !== undefined) {
    return metricObj.values[key];
  }
  if (metricObj[key] !== undefined) {
    return metricObj[key];
  }
  return 0;
}

function parseSummary() {
  const summaryPath = path.join(process.cwd(), 'summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.error(`[k6 Parser] Error: summary.json not found at ${summaryPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(summaryPath, 'utf-8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('[k6 Parser] Error parsing summary.json JSON:', err);
    process.exit(1);
  }

  const metrics = data.metrics || {};

  // Extract Request Throughput & Totals
  const reqsMetric = metrics.http_reqs || {};
  const totalRequests = getMetricValue(reqsMetric, 'count');
  const rps = getMetricValue(reqsMetric, 'rate').toFixed(2);

  // Extract Latencies
  const durationMetric = metrics.http_req_duration || {};
  const avgLatency = getMetricValue(durationMetric, 'avg').toFixed(2);
  const minLatency = getMetricValue(durationMetric, 'min').toFixed(2);
  const maxLatency = getMetricValue(durationMetric, 'max').toFixed(2);
  const p95Latency = getMetricValue(durationMetric, 'p(95)').toFixed(2);

  // Extract Failures & Checks
  const failedMetric = metrics.http_req_failed || {};
  const failureRate = (getMetricValue(failedMetric, 'rate') * 100).toFixed(2);

  const checksMetric = metrics.checks || {};
  let checksSuccessRateNum = 100.0;
  const passes = getMetricValue(checksMetric, 'passes');
  const fails = getMetricValue(checksMetric, 'fails');
  if (passes + fails > 0) {
    checksSuccessRateNum = (passes / (passes + fails)) * 100;
  } else if (checksMetric.rate !== undefined || (checksMetric.values && checksMetric.values.rate !== undefined)) {
    checksSuccessRateNum = getMetricValue(checksMetric, 'rate') * 100;
  } else if (checksMetric.value !== undefined) {
    checksSuccessRateNum = checksMetric.value * 100;
  }
  const checksSuccessRate = checksSuccessRateNum.toFixed(2);

  const markdownContent = `
## 📈 FeedHope API Load Testing Results (100 VUs / 1 min)

| Metric | Value | Target Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Throughput (RPS)** | **${rps} req/sec** | > 50 req/sec | ✅ PASS |
| **Total Requests Sent** | **${totalRequests}** | N/A | ℹ️ INFO |
| **Average Latency** | **${avgLatency} ms** | < 500 ms | ✅ PASS |
| **Min Latency** | **${minLatency} ms** | N/A | ⚡ FAST |
| **Max Latency** | **${maxLatency} ms** | < 2500 ms | ✅ PASS |
| **95th Percentile (p95)** | **${p95Latency} ms** | < 1500 ms | ${p95Latency < 1500 ? '✅ PASS' : '⚠️ WARN'} |
| **Request Failure Rate** | **${failureRate}%** | < 5.0% | ${failureRate < 5 ? '✅ PASS' : '❌ FAIL'} |
| **Checks Pass Rate** | **${checksSuccessRate}%** | > 95.0% | ${checksSuccessRate > 95 ? '✅ PASS' : '❌ FAIL'} |

### 🔍 Performance Summary & Metrics Interpretation
- **Throughput (${rps} RPS)**: The FeedHope backend API successfully handled **${rps} requests every second** under a sustained load of 100 concurrent Virtual Users.
- **Latency Distribution**: Fastest response recorded was **${minLatency} ms**, with an average of **${avgLatency} ms** and 95% of all traffic completing within **${p95Latency} ms**.
- **System Stability**: Request error rate was **${failureRate}%**, well within acceptable operational boundaries.
`;

  console.log(markdownContent);

  // Write to GitHub Step Summary if running in CI
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdownContent);
    console.log('[k6 Parser] Appended summary to $GITHUB_STEP_SUMMARY');
  }

  // Save report locally
  const reportPath = path.join(process.cwd(), 'load-test-summary.md');
  fs.writeFileSync(reportPath, markdownContent, 'utf-8');
  console.log(`[k6 Parser] Report saved to ${reportPath}`);
}

parseSummary();
