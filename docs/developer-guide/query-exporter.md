---
sidebar_position: 18
---

# Query Exporter

The query-exporter service monitors the OpenRemote PostgreSQL database and exposes metrics on port 9560 for Prometheus scraping. It uses [query-exporter](https://github.com/albertodonato/query-exporter) to collect database health metrics.

## Available Metrics

### Table and Index Bloat
- `pg_table_bloat_count` - Number of tables/indexes with bloat exceeding thresholds
- `pg_table_bloat_ratio` - Bloat ratio per table/index (1.0 = no bloat, 2.0 = 100% bloat)
- `pg_table_bloat_bytes` - Estimated bloat size in bytes per table/index
- `pg_table_bloat_wasted_mb` - Estimated wasted space in megabytes per table/index

### Autovacuum Workers
- `pg_autovacuum_workers_active` - Number of currently active autovacuum workers
- `pg_autovacuum_workers_max` - Maximum number of autovacuum workers configured
- `pg_autovacuum_running` - Running autovacuum processes (labels: database, table_schema, table_name, phase)

### Datapoint Query Performance
- `pg_datapoint_query_duration_seconds` - Histogram of execution times for the attribute with most datapoints
- `pg_datapoint_count` - Total number of datapoints for the top attribute

### Database Health
- `pg_database_size_megabytes` - Total database size in megabytes
- `pg_connections_active` - Number of active connections
- `pg_connections_idle` - Number of idle connections
- `pg_locks_count` - Number of locks by type

## Configuration

### Environment Variables
The service uses the following environment variables (automatically configured in `profile/deploy.yml`):

**Database Connection:**
- `POSTGRES_HOST` - Database host (default: `postgresql`)
- `POSTGRES_PORT` - Database port (default: `5432`)
- `POSTGRES_DB` - Database name (default: `openremote`)
- `POSTGRES_USER` - Database user (default: `postgres`)
- `POSTGRES_PASSWORD` - Database password (default: `postgres`)

**Bloat Thresholds:**
- `TABLE_BLOAT_THRESHOLD` - Table bloat ratio threshold (default: `1.2` = 20% bloat)
- `INDEX_BLOAT_THRESHOLD` - Index bloat ratio threshold (default: `1.5` = 50% bloat)

:::note

Indexes typically bloat faster than tables, so the default index threshold is higher.

:::

### Customize Thresholds
Set environment variables before starting services:
```bash
export TABLE_BLOAT_THRESHOLD=1.3  # 30% table bloat
export INDEX_BLOAT_THRESHOLD=2.0  # 100% index bloat
```

### Query Intervals
- Table bloat queries: Every 5 minutes
- Autovacuum queries: Every 30 seconds
- Datapoint performance: Every 60 seconds
- Database size: Every 5 minutes
- Connection/lock stats: Every 30 seconds

## Accessing Metrics

### View Metrics Endpoint
```bash
curl http://localhost:9560/metrics
```

### Expose on Private Network
To expose on a private network in production, uncomment this line in `profile/deploy.yml`:
```yaml
- "${PRIVATE_IP:-127.0.0.1}:9560:9560"
```

## Prometheus Integration

Add this scrape configuration to your Prometheus config:

```yaml
scrape_configs:
  - job_name: 'openremote-postgres'
    static_configs:
      - targets: ['localhost:9560']
    scrape_interval: 30s
```

## Customizing Queries

To modify queries or add new metrics:

1. Edit the `config.yaml` file located in the `query-exporter` configuration directory (by default, this is `/deployment/query-exporter/config.yaml` which is mounted as a Docker volume at the container's `/config/config.yaml` path—see your `profile/deploy.yml` for the exact path).
2. Restart the service:
```bash
docker-compose -f profile/deploy.yml restart query-exporter
```

## Troubleshooting

### Check Service Logs
```bash
docker-compose -f profile/deploy.yml logs -f query-exporter
```

### Test Database Connectivity
```bash
docker-compose -f profile/deploy.yml exec query-exporter sh
apk add postgresql-client
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB
```

### Verify Metrics Endpoint
```bash
curl http://localhost:9560/metrics
```

## Performance Tuning

If bloat detection queries impact database performance:

- **Increase query interval** - Change from 300s to 600s or higher in `config.yaml`
- **Limit to specific schemas** - Modify queries to target specific schemas only
- **Schedule off-peak runs** - Use `schedule` option instead of `interval`
- **Reduce sample size** - Lower the datapoint query sample size (default: 100)

### Query Complexity
- Bloat detection scans `pg_stats` and `pg_class` catalogs (limited to top 50 results)
- Datapoint performance samples 100 most recent datapoints from the largest attribute
- All queries exclude PostgreSQL system schemas (`pg_%` and `information_schema`)

## Understanding Bloat

### Bloat Ratio Values
- `1.0` - No bloat (optimal size)
- `1.2` - 20% bloat (default table threshold)
- `1.5` - 50% bloat (default index threshold)
- `2.0` - 100% bloat (object is twice the optimal size)

### Maintenance Actions
- **Tables > 1.2** - Run `VACUUM FULL` during maintenance window
- **Indexes > 1.5** - Run `REINDEX` on affected indexes
- **Critical bloat (> 2.0)** - Immediate maintenance recommended

### PostgreSQL Constants
The bloat detection queries use these PostgreSQL internal constants:
- `1048576` - Bytes per megabyte (1024 × 1024)
- `8` - Bits per byte (for null bitmap calculation)
- `20` - Page header size in bytes
- `12` - Index header overhead in bytes
- `4` - Item pointer size in bytes
- `23` - Tuple header size for PostgreSQL 14+ (Linux)
- `4` - Memory alignment for Linux containers

## References

- [Query Exporter Documentation](https://github.com/albertodonato/query-exporter)
- [Configuration Format](https://github.com/albertodonato/query-exporter/blob/main/docs/configuration.rst)
- [PostgreSQL Statistics Views](https://www.postgresql.org/docs/current/monitoring-stats.html)
- [PostgreSQL Bloat Detection](https://wiki.postgresql.org/wiki/Show_database_bloat)
