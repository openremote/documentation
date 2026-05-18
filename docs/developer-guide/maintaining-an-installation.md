---
sidebar_position: 9
---

# Maintaining an installation

## Monitoring

Tail log output of all containers with `docker-compose -p openremote -f profile/demo.yml logs -f`.

Use `docker stats` to show CPU, memory, network read/writes, and total disk read/writes for running containers.

## Diagnosing JVM memory problems

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

## Install the JDK
By default the manager Docker image only contains a JRE; many java profiling tools are available in the JDK so to install within a running manager container:
```shell
docker exec or-manager-1 /bin/bash -c 'microdnf --setopt=install_weak_deps=0 --setopt=tsflags=nodocs install -y java-21-openjdk-devel && microdnf clean all && rpm -q java-21-openjdk-devel'
```



## Performing a heap dump (`jmap`)

The [`jmap`](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jmap.html) tool within the JDK can be used to create a heap dump of a running JVM.

### Create heap dump
```shell
docker exec or-manager-1 /bin/bash -c 'jmap -dump:live,format=b,file=/dump.hprof 1'
```

### Copy to Docker host
```shell
docker cp or-manager-1:/dump.hprof ~
```

### Use scp to copy from Docker host to local machine
```shell
scp {HOST}:~/dump.hprof ~
```

You can then explore the heap dump with an IDE or other tool.

## Performing a thread dump (`jstack`)
The [`jstack`](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jstack.html) tool within the JDK can be used to create a thread dump of a running JVM.

### Create thread dump
```shell
docker exec or-manager-1 /bin/bash -c 'jstack -l 1 > /threads.txt'
```

### Copy to Docker host
```shell
docker cp or-manager-1:/threads.txt ~
```

### Use scp to copy from Docker host to local machine
```shell
scp {HOST}:~/threads.txt ~
```

You can then explore the thread dump with an IDE or other tool.
