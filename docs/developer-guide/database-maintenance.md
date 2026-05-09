---
sidebar_position: 16
---
# Timescale DB Maintenance

**Pay attention to shared memory setting of postgres container; Docker sets this very low by default and this will cause problems for any reasonable size DB, see here for info:**

## Overview
This document summarises the database performance, storage footprint, and system efficiency of the OpenRemote instance before and after enabling **TimescaleDB Hypercore** compression features. It serves as a reference for System Administrators to understand the expected baselines, trade-offs, and critical maintenance thresholds.

---

## 1. Storage & Compression
Enabling Hypercore compression drastically reduced the database storage footprint by converting uncompressed historical row-data into highly compressed columnar structures.

| Metric | Before Hypercore | After Hypercore | Improvement |
| :--- | :--- | :--- | :--- |
| **Total DB Disk Size** | 225.5 GB | 16.1 GB | **~93% Reduction** |
| **Datapoint Table Size** | 219.6 GB | 10.0 GB | **~95% Reduction** |
| **Index Size** | 130.8 GB | 3.4 GB | **~97% Reduction** |
| **Compression Ratio** | N/A | ~61.8x | - |

**SysAdmin Note:** The massive reduction in index size occurs because TimescaleDB discards traditional B-Tree indexes on compressed chunks, relying instead on lightweight columnar metadata.

---

## 2. Memory & Cache Efficiency
Prior to compression, the database footprint vastly exceeded the allocated Docker memory, resulting in severe disk thrashing and Out-Of-Memory (OOM) risks. Post-compression, the active data easily fits within PostgreSQL's `shared_buffers`.

| Metric | Before Hypercore | After Hypercore |
| :--- | :--- | :--- |
| **Overall Cache Hit Ratio** | 5.6% | **95.3%** |
| **Uncompressed Cache Hit Ratio** | 0.5% | **91.9%** |

**SysAdmin Note:** A >95% cache hit ratio means PostgreSQL is serving almost all queries instantly from RAM. To maintain this efficiency, ensure that the Docker `shm_size` (Shared Memory) is appropriately configured to be slightly larger (e.g., +10-20%) than the PostgreSQL `shared_buffers` setting to prevent startup crashes.

---

## 3. Query Performance Benchmarks
Query execution times were fundamentally transformed. Heavy historical aggregations that previously choked the database are now highly optimised, with a minor architectural trade-off for ultra-fast, single-point queries.

| Query Type | Example | Before (ms) | After (ms) | Change |
| :--- | :--- | :--- | :--- | :--- |
| **Overall Average** | All Queries | ~4,359 ms | ~436 ms | **~90% Faster** |
| **Heavy Aggregation** | `4hOF-kwMax_Daily_MinMaxAvg_30d` | 44,442.0 ms | 583.9 ms | **98.6% Faster** |
| **Heavy Aggregation** | `2pPI-power_Daily_MinMaxAvg_30d` | 9,951.1 ms | 284.2 ms | **97.1% Faster** |
| **Heavy Aggregation** | `4jp8-power_Daily_MinMaxAvg_30d` | 7,815.3 ms | 158.4 ms | **97.9% Faster** |
| **Light Micro-Query** | `4hOF-kwMin_Hourly_Avg_7d` | 4.4 ms | 157.1 ms | *(Expected Trade-off)* |

**SysAdmin Note:**
* **The Win:** Complex, multi-day historical aggregations improved by 97-98%, eliminating 40+ second query timeouts.
* **The Trade-off:** Micro-queries taking \<10ms previously will now take ~50-150ms. This is expected behavior; querying compressed chunks requires on-the-fly decompression CPU overhead to unpack the columnar data back into rows.

---

## 4. Critical Maintenance Guidelines

To keep this instance healthy and prevent Docker crashes, adhere to the following rules:

### A. Docker Memory vs. PostgreSQL Memory
* PostgreSQL's `shared_buffers` must fit inside Docker's `shm_size`.
* **Do not** run `timescaledb-tune` automatically on container startup. It may miscalculate limits if Docker's cgroup namespaces are restricted.
* **Best Practice:** Run `timescaledb-tune --dry-run` manually, verify the outputs, and hardcode the tuned `shared_buffers`, `effective_cache_size`, and `maintenance_work_mem` directly into the `docker-compose.yml` command args.

### B. Uncompressed Chunk Size Management
* **The 25% Rule:** The largest uncompressed chunk should never exceed 25% of the total Docker container RAM limit.
* For a 2GB container limit, the `pg_datapoint_largest_uncompressed_chunk` metric must stay below **512 MB**.
* If chunks grow too large, the background compression worker will exhaust RAM during the sorting phase and trigger the Linux OOM killer. If this occurs, reduce the hypertable's `chunk_time_interval` via `set_chunk_time_interval()`.