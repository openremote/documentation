---
sidebar_position: 9
---

# Maintaining an installation

## Monitoring

Tail log output of all containers with `docker-compose -p openremote -f profile/demo.yml logs -f`.

Use `docker stats` to show CPU, memory, network read/writes, and total disk read/writes for running containers.

## Diagnosing database problems

Access the database:

```
docker exec -it openremote_postgresql_1 psql -U openremote
```

Get statistics for all tables and indices (note that these are collected statistics, not live data):

```
SELECT
    t.tablename,
    indexname,
    c.reltuples AS approximate_row_count,
    pg_size_pretty(pg_relation_size(quote_ident(t.tablename)::text)) AS table_size,
    pg_size_pretty(pg_relation_size(quote_ident(indexrelname)::text)) AS index_size,
    CASE WHEN indisunique THEN 'Y'
       ELSE 'N'
    END AS UNIQUE,
    idx_scan AS number_of_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_tables t
LEFT OUTER JOIN pg_class c ON t.tablename=c.relname
LEFT OUTER JOIN
    ( SELECT c.relname AS ctablename, ipg.relname AS indexname, x.indnatts AS number_of_columns, idx_scan, idx_tup_read, idx_tup_fetch, indexrelname, indisunique FROM pg_index x
           JOIN pg_class c ON c.oid = x.indrelid
           JOIN pg_class ipg ON ipg.oid = x.indexrelid
           JOIN pg_stat_all_indexes psai ON x.indexrelid = psai.indexrelid )
    AS foo
    ON t.tablename = foo.ctablename
WHERE t.schemaname='openremote'
ORDER BY 1,2;
```

Find transactions/queries waiting for more than 30 seconds:

```
SELECT pid, client_addr, now() - query_start AS duration, query, state
    FROM pg_stat_activity
    WHERE now() - query_start > interval '30 seconds';
```

Kill them with:

```
select pg_cancel_backend(pid);
```

Pay attention to shared memory setting of postgres container; docker sets this very low by default and this will cause problems for any reasonable size DB, see here for info:

* https://www.instaclustr.com/blog/postgresql-docker-and-shared-memory/#:~:text=Docker%20and%20SHM%2DSize&text=This%20means%20that%20instead%20of,default%2C%20this%20limit%20is%2064MB.

More useful queries and maintenance operations can be found here:

* https://wiki.postgresql.org/wiki/Index_Maintenance
* https://github.com/ioguix/pgsql-bloat-estimation

You can log all queries taking longer than 2 seconds:

```
alter system set log_min_duration_statement=2000;
select pg_reload_conf();
show log_min_duration_statement;
```

To disable, set the duration to `-1`.

Use `explain analyze <SQL query>` to obtain the query plan and display it in https://explain.depesz.com/.

## Diagnosing JVM memory problems

If the JVM was started with `-XX:NativeMemoryTracking=summary`, use this to get an overview (see [here](https://trustmeiamadeveloper.com/2016/03/18/where-is-my-memory-java/) for more details):

```
docker exec -it openremote_manager_1 /usr/bin/jcmd 1 VM.native_memory summary
```

Otherwise, use [jstat](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/jstat.html) to monitor a running system/JVM. 

Get current memory configuration:

```
docker exec -it openremote_manager_1 /usr/bin/jstat -gccapacity 1
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

```
docker exec -it openremote_manager_1 /usr/bin/jstat -gcutil 1 2500 1000
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

```
docker exec -it openremote_manager_1 /usr/bin/jcmd 1 GC.run
```

## Install the JDK
By default the manager docker image only contains a JRE; many java profiling tools are available in the JDK so to install within a running manager container:
```
docker exec or-manager-1 /bin/bash -c 'microdnf --setopt=install_weak_deps=0 --setopt=tsflags=nodocs install -y java-17-openjdk-devel && microdnf clean all && rpm -q java-17-openjdk-devel'
```



## Performing a heap dump (`jmap`)

The `jmap` tool within the JDK can be used to create a heap dump of a running jvm.

### Create heap dump
```
docker exec or-manager-1 /bin/bash -c 'jmap -dump:live,format=b,file=/dump.hprof 1'
```

### Copy to docker host
```
docker cp or-manager-1:/dump.hprof ~
```

### Use scp to copy from docker host to local machine
```
scp {HOST}:~/dump.hprof ~
```

You can then explore the heap dump with an IDE or other tool.

## Performing a thread dump (`jstack`)
The `jmap` tool within the JDK can be used to create a heap dump of a running jvm.

### Create thread dump
```
docker exec or-manager-1 /bin/bash -c 'jstat -F -l 1 > /threads.txt'
```

### Copy to docker host
```
docker cp or-manager-1:/threads.txt ~
```

### Use scp to copy from docker host to local machine
```
scp {HOST}:~/thread.txt ~
```

You can then explore the thread dump with an IDE or other tool.
