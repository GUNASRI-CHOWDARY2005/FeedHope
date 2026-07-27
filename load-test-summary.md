
## 📈 FeedHope API Load Testing Results (100 VUs / 1 min)

| Metric | Value | Target Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Throughput (RPS)** | **241.49 req/sec** | > 50 req/sec | ✅ PASS |
| **Total Requests Sent** | **15215** | N/A | ℹ️ INFO |
| **Average Latency** | **305.57 ms** | < 500 ms | ✅ PASS |
| **Min Latency** | **0.00 ms** | N/A | ⚡ FAST |
| **Max Latency** | **675.85 ms** | < 2500 ms | ✅ PASS |
| **95th Percentile (p95)** | **590.57 ms** | < 1500 ms | ✅ PASS |
| **Request Failure Rate** | **0.00%** | < 5.0% | ✅ PASS |
| **Checks Pass Rate** | **100.00%** | > 95.0% | ✅ PASS |

### 🔍 Performance Summary & Metrics Interpretation
- **Throughput (241.49 RPS)**: The FeedHope backend API successfully handled **241.49 requests every second** under a sustained load of 100 concurrent Virtual Users.
- **Latency Distribution**: Fastest response recorded was **0.00 ms**, with an average of **305.57 ms** and 95% of all traffic completing within **590.57 ms**.
- **System Stability**: Request error rate was **0.00%**, well within acceptable operational boundaries.
