---
sidebar_position: 20
---

# System Administration

## Monitoring

Use `docker stats` to show CPU, memory, network read/writes, and total disk read/writes for running containers.
Also use prometheus metrics to monitor individual container health (see: [Metrics](../user-guide/metrics.md)).

## JVM

### Diagnosing JVM memory problems

If the JVM was started with `-XX:NativeMemoryTracking=summary`, use this to get an overview (see [here](https://trustmeiamadeveloper.com/2016/03/18/where-is-my-memory-java/) for more details):

```shell
docker exec -it or-manager-1 /usr/bin/jcmd 1 VM.native_memory summary
```

Otherwise, use [`jstat`](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jstat.html) to monitor a running system/JVM. 

Get current memory configuration:

```shell
docker exec -it or-manager-1 /usr/bin/jstat -gccapacity 1
```

Output contains:

```
NGCMN: Minimum new generation capacity (kB).
NGCMX: Maximum new generation capacity (kB).
NGC: Current new generation capacity (kB).
S0C: Current survivor space 0 capacity (kB).
S1C: Current survivor space 1 capacity (kB).
EC: Current eden space capacity (kB).
OGCMN: Minimum old generation capacity (kB).
OGCMX: Maximum old generation capacity (kB).
OGC: Current old generation capacity (kB).
OC: Current old space capacity (kB).
MCMN: Minimum metaspace capacity (kB).
MCMX: Maximum metaspace capacity (kB).
MC: Metaspace capacity (kB).
CCSMN: Compressed class space minimum capacity (kB).
CCSMX: Compressed class space maximum capacity (kB).
CCSC: Compressed class space capacity (kB).
YGC: Number of young generation GC events.
FGC: Number of full GC events.
```

The following command will connect to a Manager and print garbage collection statistics (polling 1000 times, waiting for 2.5 seconds):

```shell
docker exec -it or-manager-1 /usr/bin/jstat -gcutil 1 2500 1000
```

The output contains:

```
S0: Survivor space 0 utilization as a percentage of the space's current capacity.
S1: Survivor space 1 utilization as a percentage of the space's current capacity.
E: Eden space utilization as a percentage of the space's current capacity.
O: Old space utilization as a percentage of the space's current capacity.
M: Metaspace utilization as a percentage of the space's current capacity.
CCS: Compressed class space utilization as a percentage.
YGC: Number of young generation GC events.
YGCT: Young generation garbage collection time.
FGC: Number of full GC events.
FGCT: Full garbage collection time.
GCT: Total garbage collection time.
```

Force garbage collection with: 

```shell
docker exec -it openremote_manager_1 /usr/bin/jcmd 1 GC.run
```

### Install the JDK
By default the manager Docker image only contains a JRE; many java profiling tools are available in the JDK so to install within a running manager container:
```shell
docker exec or-manager-1 /bin/bash -c 'microdnf --setopt=install_weak_deps=0 --setopt=tsflags=nodocs install -y java-21-openjdk-devel && microdnf clean all && rpm -q java-21-openjdk-devel'
```

### Performing a heap dump (`jmap`)

The [`jmap`](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jmap.html) tool within the JDK can be used to create a heap dump of a running JVM.

#### Create heap dump
```shell
docker exec or-manager-1 /bin/bash -c 'jmap -dump:live,format=b,file=/dump.hprof 1'
```

#### Copy to Docker host
```shell
docker cp or-manager-1:/dump.hprof ~
```

#### Use scp to copy from Docker host to local machine
```shell
scp {HOST}:~/dump.hprof ~
```

You can then explore the heap dump with an IDE or other tool.

### Performing a thread dump (`jstack`)
The [`jstack`](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jstack.html) tool within the JDK can be used to create a thread dump of a running JVM.

#### Create thread dump
```shell
docker exec or-manager-1 /bin/bash -c 'jstack -l 1 > /threads.txt'
```

#### Copy to Docker host
```shell
docker cp or-manager-1:/threads.txt ~
```

#### Use scp to copy from Docker host to local machine
```shell
scp {HOST}:~/threads.txt ~
```

You can then explore the thread dump with an IDE or other tool.

---


## Database
This document summarises the database performance, storage footprint, and system efficiency of the OpenRemote instance before and after enabling **TimescaleDB Hypercore** compression features. It serves as a reference for System Administrators to understand the expected baselines, trade-offs, and critical maintenance thresholds.

---

Use the following docker command to access the database on the docker host:
```shell
docker exec -it openremote_postgresql_1 psql -U postgres
```

### Storage & compression
Enabling Hypercore compression drastically reduced the database storage footprint by converting uncompressed historical row-data into highly compressed columnar structures.

| Metric | Before Hypercore | After Hypercore | Improvement |
| :--- | :--- | :--- | :--- |
| **Total DB Disk Size** | 225.5 GB | 16.1 GB | **~93% Reduction** |
| **Datapoint Table Size** | 219.6 GB | 10.0 GB | **~95% Reduction** |
| **Index Size** | 130.8 GB | 3.4 GB | **~97% Reduction** |
| **Compression Ratio** | N/A | ~61.8x | - |

**SysAdmin Note:** The massive reduction in index size occurs because TimescaleDB discards traditional B-Tree indexes on compressed chunks, relying instead on lightweight columnar metadata.

---

### Memory & cache efficiency
Prior to compression, the database footprint vastly exceeded the allocated Docker memory, resulting in severe disk thrashing and Out-Of-Memory (OOM) risks. Post-compression, the active data easily fits within PostgreSQL's `shared_buffers`.

| Metric | Before Hypercore | After Hypercore |
| :--- | :--- | :--- |
| **Overall Cache Hit Ratio** | 5.6% | **95.3%** |
| **Uncompressed Cache Hit Ratio** | 0.5% | **91.9%** |

**SysAdmin Note:** A >95% cache hit ratio means PostgreSQL is serving almost all queries instantly from RAM. To maintain this efficiency, ensure that the Docker `shm_size` (Shared Memory) is appropriately configured to be slightly larger (e.g., +10-20%) than the PostgreSQL `shared_buffers` setting to prevent startup crashes.

---

### Query performance benchmarks
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

### Critical maintenance guidelines

To keep this instance healthy and prevent Docker crashes, adhere to the following rules:

#### A. Docker Memory vs. PostgreSQL Memory
* Docker's `shm_size` must be sized appropriately **Docker sets this very low by default and this will cause problems for any reasonable size DB**
* PostgreSQL's `shared_buffers` must fit inside Docker's `shm_size` and should be as large as possible
* **Do not** run `timescaledb-tune` automatically on container startup. It may miscalculate limits if Docker's cgroup namespaces are restricted.
* **Best Practice:** Run `timescaledb-tune --dry-run` manually, verify the outputs, and hardcode the tuned `shared_buffers`, `effective_cache_size`, and `maintenance_work_mem` directly into the `docker-compose.yml` command args.

#### B. Uncompressed Chunk Size Management
* **The 25% Rule:** The largest uncompressed chunk should never exceed 25% of the total Docker container RAM limit.
* For a 2GB container limit, the `pg_datapoint_largest_uncompressed_chunk` metric must stay below **512 MB**.
* If chunks grow too large, the background compression worker will exhaust RAM during the sorting phase and trigger the Linux OOM killer. If this occurs, reduce the hypertable's `chunk_time_interval` via `set_chunk_time_interval()`.

### Backup/Restore
* Create backup: `docker exec or-postgresql-1 pg_dump -Fc openremote -f /tmp/db.bak`
* Optional: Exclude datapoint records from the backup using the following command: `docker exec or-postgresql-1 pg_dump -Fc openremote -f /tmp/db.bak --exclude-table-data='_timescaledb_internal._hyper_*'`
* Copy to the Docker host: `docker cp or-postgresql-1:/tmp/db.bak ~/`
* Remove the backup from within the container: `docker exec or-postgresql-1 rm /tmp/db.bak`
* SCP the backup off the source server onto the destination server: e.g. `scp <HOST>:~/db.bak .`
* On the destination server stop the manager and Keycloak containers and any project specific containers that are using the DB: `docker stop or-manager-1 or-keycloak-1`
* Copy backup into the postgresql container: `docker cp db.bak or-postgresql-1:/tmp/`
* Drop existing DB: `docker exec or-postgresql-1 dropdb openremote`
* Create new DB: `docker exec or-postgresql-1 createdb openremote`
* Add POSTGIS extension: `docker exec or-postgresql-1 psql -U postgres -d openremote -c "CREATE EXTENSION IF NOT EXISTS postgis;"`
* Add Timescale DB extension: `docker exec or-postgresql-1 psql -U postgres -d openremote -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"`
* Run timescale DB pre restore command: `docker exec or-postgresql-1 psql -U postgres -d openremote -c "SELECT timescaledb_pre_restore();"`
* Restore the backup: `docker exec or-postgresql-1 pg_restore -Fc --verbose -U postgres -d openremote /tmp/db.bak`
* Run timescale DB restore command: `docker exec or-postgresql-1 psql -U postgres -d openremote -c "SELECT timescaledb_post_restore();"`
* Start the stopped containers: `docker start or-keycloak-1 or-manager-1`

For more details related to TimescaleDB backup/restore see [here](https://docs.timescale.com/self-hosted/latest/backup-and-restore/pg-dump-and-restore/).

### Recover failed update
The `openremote/postgresql` container should handle automatic updates to the latest TimescaleDB version in the image and also auto migration
to the major version of PostgreSQL in the image (note: you must incrementally go through each major version of the `openremote/postgresql` images i.e. you cannot go from 14.x to 17.x but must go `14.x` -> `15.x` -> `17.x` \[there is no `16.x` image so this can be skipped\]).

The PostgreSQL auto migration process will move `PGDATA` to a sub directory called `old` and create a `new` directory for the initialisation of the new major version DB, if the upgrade fails then you will need to manually handle the issue and move files back to the `PGDATA` folder like so:
```bash
docker exec --rm -it -v or_postgresql-data:/var/lib/postgresql/data --entrypoint=bash openremote/postgresql:latest-slim
mv -v data/old/* $PGDATA
rm -r data/new data/old
```

### Useful resources
- [Shared memory](https://www.instaclustr.com/blog/postgresql-docker-and-shared-memory/#:~:text=Docker%20and%20SHM%2DSize&text=This%20means%20that%20instead%20of,default%2C%20this%20limit%20is%2064MB)
- [Index maintenance](https://wiki.postgresql.org/wiki/Index_Maintenance)
- [Bloat estimation](https://github.com/ioguix/pgsql-bloat-estimation)
- [Query Exporter Documentation](https://github.com/albertodonato/query-exporter)
- [Configuration Format](https://github.com/albertodonato/query-exporter/blob/main/docs/configuration.rst)
- [PostgreSQL Statistics Views](https://www.postgresql.org/docs/current/monitoring-stats.html)
- [PostgreSQL Bloat Detection](https://wiki.postgresql.org/wiki/Show_database_bloat)

### Useful queries
Refer to the [Query Exporter configuration file](https://github.com/openremote/openremote/blob/master/deployment/query-exporter/config.yaml) for useful DB monitoring queries.

#### Clear syslogs older than 1 day
`docker exec or-postgresql-1 psql -U postgres -d openremote -c "delete from syslog_event where timestamp < now() - INTERVAL '1day';"`

#### Export all asset data points
```sql
copy asset_datapoint to '/var/lib/postgresql/datapoints.csv' delimiter ',' CSV;
```

or with asset names instead of IDs and a header row in the export:
```sql
copy (select ad.timestamp, a.name, ad.attribute_name, ad.value from asset_datapoint ad, asset a where ad.entity_id = a.id) to '/var/lib/postgresql/datapoints.csv' delimiter ',' CSV HEADER;
```

#### Export a subset of asset data points (asset and direct child assets)
```sql
copy (select ad.timestamp, a.name, ad.attribute_name, value from asset_datapoint ad, asset a where ad.entity_id = a.id and (ad.entity_id = 'ID1' or a.parent_id = 'ID1')) to '/var/lib/postgresql/datapoints.csv' delimiter ',' CSV HEADER;
```

#### Delete all asset datapoints older than N days
```sql
delete from asset_datapoint where timestamp < now() - INTERVAL '7 days';
```

#### Accessing the exported CSV file
```shell
docker cp <PROJECT_NAME>_postgresql_1:/deployment/datapoints.csv ./
```

#### Importing asset data points
To import data points stored in multiple exports (with potential duplicates) then first create a temp table:
```sql
CREATE TEMP TABLE tmp_table AS SELECT * FROM asset_datapoint WITH NO DATA;
```

Import the CSV files into this temp table:
```shell
COPY tmp_table FROM '/var/lib/postgresql/datapoints.csv' DELIMITER ',' CSV;
```

Remove values for assets that don't exist in the running system:
```sql
DELETE FROM tmp_table D WHERE NOT (D.entity_id IN (SELECT DISTINCT ID from ASSET));
```

Insert unique values into `ASSET_DATAPOINT` table:
```sql
INSERT INTO asset_datapoint SELECT * FROM tmp_table ON CONFLICT DO NOTHING;
```

Drop temp table:
```sql
DROP TABLE tmp_table;
```

#### Remove consoles that haven't registered for more than N days

:::note

**Following will require manager to be restarted**

:::

```sql
DELETE FROM asset a
WHERE a.asset_type = 'urn:openremote:asset:console' AND
    to_timestamp((a.attributes#>>'{consoleName, valueTimestamp}')::bigint /1000) < (current_timestamp - interval '30 days');
```

#### Count notifications with specific title sent to consoles (Android/iOS) in past N days

```sql
SELECT count(*)
FROM notification n
JOIN asset a ON a.id = n.target_id
WHERE n.message ->> 'title' = 'NOTIFICATION TITLE' AND 
    n.sent_on > (current_timestamp - interval '7 days') AND 
    a.attributes #>> '{consolePlatform, value}' LIKE 'Android%' AND
    n.acknowledged_on IS NOT null;
```

#### Count notifications with specific title sent to consoles (Android/iOS) and acknowledged by:

##### Closing/Dismissing
```sql
SELECT count(*)
FROM notification n
JOIN asset a ON a.id = n.target_id
WHERE n.message ->> 'title' = 'Kijk mee naar de proefbestrating op de Demer' AND
    n.acknowledged_on IS NOT null AND
    n.acknowledgement = 'CLOSED';
```

##### Clicking the notification
```sql
SELECT count(*)
FROM notification n
JOIN asset a ON a.id = n.target_id
WHERE n.message ->> 'title' = 'NOTIFICATION TITLE' AND
     n.acknowledged_on IS NOT null AND
     n.acknowledgement IS null;
```

##### Clicking a specific action button
```sql
select count(*)
FROM notification n
JOIN asset a ON a.id = n.target_id
WHERE n.message ->> 'title' = 'Kijk mee naar de proefbestrating op de Demer' AND
    n.acknowledged_on IS NOT null AND
    n.acknowledgement LIKE '%BUTTON TITLE%';
```



---

### Data migration

Sometimes it is desirable to bulk edit existing assets (add/remove attributes and/or configuration items) rather than wiping the DB and starting again.

DB migration scripts can be used to perform these migrations but also raw SQL can be used to make such alterations.

There are several DB functions included in the system to help with this task:

#### DB Functions
The DB functions and their arguments can be found in the code at:

https://github.com/openremote/openremote/blob/master/manager/src/main/resources/org/openremote/manager/setup/database

#### Examples

##### Add/Update meta items to specific attribute of asset(s)
```sql
SELECT a.id, ADD_UPDATE_META(a, 'newAttribute1',
    jsonb_build_object('meta1', false, 'meta2', 456, 'meta3', 'Some text'))
FROM asset a WHERE...;
```

##### Remove meta items from specific attribute of asset(s)
```sql
SELECT a.id, REMOVE_META(a, 'newAttribute1', 'meta2', 'meta3') FROM asset a WHERE...;
```

##### Remove attributes from specific asset(s)
```sql
SELECT a.id, REMOVE_ATTRIBUTES(a, 'oldAttribute1', 'oldAttribute2') FROM asset a WHERE...;
```

##### Add attribute to specific asset(s) (with meta items)
**Warning**: this will override any existing attribute data!
```sql
SELECT a.id, ADD_ATTRIBUTE(a, 'newAttribute2', 'GEO_JSONPoint', '1'::jsonb, now(),
    jsonb_build_object('meta1', true, 'meta2', 123))
FROM asset a WHERE...;
```

##### Add attribute to specific asset(s) (without meta items)
**Warning**: this will override any existing attribute data!
```sql
SELECT a.id, ADD_ATTRIBUTE(a, 'newAttribute1', 'GEO_JSONPoint', '1'::jsonb, now(), null)
FROM asset a WHERE...;
```

---

## Proxy
### SSH tunnel for proxy stats
HAProxy stats web page is only accessible on localhost in our default config, this can be tunnelled to your local machine to allow access at http://localhost:8404/stats:
```shell
ssh -L 8404:localhost:8404 <HOST>
```

---

## OpenRemote Manager
### Insert a different manager_config.json file
```shell
docker exec <PROJECT_NAME>_manager_1 mkdir -p /deployment/manager/app
docker cp ./manager_config.json <PROJECT_NAME>_manager_1:/deployment/manager/app/manager_config.json

# Make sure to restart the containers for applying the changes
```

### Insert an .mbtiles file for applying a different map
```shell
docker exec <PROJECT_NAME>_manager_1 mkdir -p /deployment/map
docker cp ./<FILE_NAME>.mbtiles <PROJECT_NAME>_manager_1:/deployment/map/mapdata.mbtiles

# Make sure to restart the containers for applying the changes
```

---

## Docker
### Cleaning up Docker images, containers, and volumes
Working with Docker might leave exited containers and untagged images. cleanup using (use with caution):
```shell
docker volume prune -a
docker image prune -a
```

### Restart exited containers (without using `docker-compose up`)
If the containers are exited then they can be restarted using the `docker` command, the startup order is important:

* docker start `<PROJECT_NAME>_postgresql_1`
* docker start `<PROJECT_NAME>_keycloak_1`
* docker start `<PROJECT_NAME>_map_1` (only if there is a map container)
* docker start `<PROJECT_NAME>_manager_1`
* docker start `<PROJECT_NAME>_proxy_1`


### Using Docker Compose

Our services are configured as a stack of containers with Docker Compose.

Service images will be built automatically when they do not exist in the Docker engine image cache or when the `Dockerfile` for the service changes. **Docker Compose does not track changes to the files used in a service so when code changes are made you will need to manually force a build of the service**.

Here are a few useful Docker Compose commands:

* `docker-compose -f <PROFILE> pull <SERVICE> <SERVICE>...` - Force pull requested services from Docker Hub, if no services specified then all services will be pulled (e.g. docker-compose -f profile/manager.yml pull to pull all services)
* `docker-compose -f <PROFILE> build <SERVICE> <SERVICE>...` - Build/Rebuild requested services, if no services specified then all services will be built
* `docker-compose -f <PROFILE> up <SERVICE> <SERVICE>...` - Creates and starts requested services, if no services specified then all services will be created and started (also auto attaches to console output from each service use `-d` to not attach to the console output)
* `docker-compose -f <PROFILE> up --build <SERVICE> <SERVICE>...` - Creates and starts requested services but also forces building the services first (useful if the source code has changed as docker-compose will not be aware of this change and you would otherwise end up deploying 'stale' services)
* `docker-compose -f <PROFILE> down <SERVICE> <SERVICE>...` - Stops and removes requested services, if no services specified then all services will be stopped and removed. Sometimes the shutdown doesn't work properly and you have to run `down` again to completely remove all containers and networks.

* When deploying profiles you can provide a project name to prefix the container names (by default Docker Compose will use the configuration profile's folder name); the project name can be specified with the -p argument using the CLI:

```shell
docker-compose -p <your_project_name> -f <profile> -f <profile_override> up -d <service1> <service2> ...
```


---

## Shell
### Enabling bash auto-completion

You might want to install bash auto-completion for Docker commands. On OS X, install:

```shell
brew install bash-completion
```

Then add this to your `$HOME/.profile`:

```bash
if [ -f $(brew --prefix)/etc/bash_completion ]; then
. $(brew --prefix)/etc/bash_completion
fi
```

And link the completion-scripts from your local Docker install:

```shell
find /Applications/Docker.app \
-type f -name "*.bash-completion" \
-exec ln -s "{}" "$(brew --prefix)/etc/bash_completion.d/" \;
```
Start a new shell or source your profile to enable auto-completion.