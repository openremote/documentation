---
sidebar_position: 14
---

# Useful commands and queries

## Docker
Replace `<PROJECT_NAME>` with value used when creating the container with `docker-compose up` (`docker ps` will show the actual names).
### Restart manager docker container

`docker restart <PROJECT_NAME>_manager_1`

### Start interactive `psql` shell in postgresql container
`docker exec -it <PROJECT_NAME>_postgresql_1 psql -U postgres`

### Copy exported data point file to local machine (exported using query below)
`docker cp <PROJECT_NAME>_postgresql_1:/deployment/datapoints.csv ./`

### Backup/Restore OpenRemote DB

* Create backup: `docker exec or-postgresql-1 pg_dump -Fc openremote -f /tmp/db.bak`
* Copy to the docker host: `docker cp or-postgresql-1:/tmp/db.bak ~/`
* SCP the backup off the source server onto the destination server
* On the destination server stop the manager and keycloak containers and any project specific containers that are using the DB: `docker stop or-manager-1 or-keycloak-1`
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

### Clear Syslogs older than 1 day
`docker exec or-postgresql-1 psql -U postgres -d openremote -c "delete from syslog_event where timestamp < now() - INTERVAL '1day';"`

### Restart exited containers (without using `docker-compose up`)
If the containers are exited then they can be restarted using the `docker` command, the startup order is important:

* docker start `<PROJECT_NAME>_postgresql_1`
* docker start `<PROJECT_NAME>_keycloak_1`
* docker start `<PROJECT_NAME>_map_1` (only if there is a map container)
* docker start `<PROJECT_NAME>_manager_1`
* docker start `<PROJECT_NAME>_proxy_1`

:::note

**On Docker v18.02 there is a bug which means you might see the message `Error response from daemon: container "<CONTAINER_ID>": already exists` to resolve this simply enter the following command (you can ignore any error messages) and try starting again**

:::

`docker-containerd-ctr --address /run/docker/containerd/docker-containerd.sock --namespace moby c rm $(docker ps -aq --no-trunc)`

### Running demo deployment

```
eval $(docker-machine env or-host1)

OR_ADMIN_PASSWORD=******** OR_SETUP_RUN_ON_RESTART=true OR_HOSTNAME=demo.openremote.io \
OR_EMAIL_ADMIN=support@openremote.io docker-compose -p demo up --build -d
```

To find out the password:

`docker exec demo_manager_1 env | awk -F= '/ADMIN_PASSWORD/ {print $2}'`


### Enabling bash auto-completion

You might want to install bash auto-completion for Docker commands. On OS X, install:

```
brew install bash-completion
```

Then add this to your `$HOME/.profile`:

```
if [ -f $(brew --prefix)/etc/bash_completion ]; then
. $(brew --prefix)/etc/bash_completion
fi
```

And link the completion-scripts from your local Docker install:

```
find /Applications/Docker.app \
-type f -name "*.bash-completion" \
-exec ln -s "{}" "$(brew --prefix)/etc/bash_completion.d/" \;
```
Start a new shell or source your profile to enable auto-completion.

### Cleaning up images, containers, and volumes

Working with Docker might leave exited containers and untagged images. If you build a new image with the same tag as an existing image, the old image will not be deleted but simply untagged. If you stop a container, it will not be automatically removed. The following bash function can be used to clean up untagged images and stopped containers, add it to your `$HOME/.profile`:

```
function dcleanup(){
    docker rm -v $(docker ps --filter status=exited -q 2>/dev/null) 2>/dev/null
    docker rmi $(docker images --filter dangling=true -q 2>/dev/null) 2>/dev/null
}
```

To remove data volumes no longer referenced by a container (deleting ALL persistent data!), use:

```
docker volume prune
```

### Revert failed PostgreSQL container auto upgrade
```
docker exec --rm -it -v or_postgresql-data:/var/lib/postgresql/data --entrypoint=bash openremote/postgresql
mv -v data/old/* $PGDATA
rm -r data/new data/old
```

## Queries

### Get DB table size info
```
SELECT
  schema_name,
  relname,
  pg_size_pretty(table_size) AS size,
  table_size

FROM (
       SELECT
         pg_catalog.pg_namespace.nspname           AS schema_name,
         relname,
         pg_relation_size(pg_catalog.pg_class.oid) AS table_size

       FROM pg_catalog.pg_class
         JOIN pg_catalog.pg_namespace ON relnamespace = pg_catalog.pg_namespace.oid
     ) t
WHERE schema_name NOT LIKE 'pg_%'
ORDER BY table_size DESC;
```

### Data points
#### Export all asset data points
```
copy asset_datapoint to '/var/lib/postgresql/datapoints.csv' delimiter ',' CSV;
```

or with asset names instead of IDs and a header row in the export:
```
copy (select ad.timestamp, a.name, ad.attribute_name, ad.value from asset_datapoint ad, asset a where ad.entity_id = a.id) to '/var/lib/postgresql/datapoints.csv' delimiter ',' CSV HEADER;
```

#### Export a subset of asset data points (asset and direct child assets)
```
copy (select ad.timestamp, a.name, ad.attribute_name, value from asset_datapoint ad, asset a where ad.entity_id = a.id and (ad.entity_id = 'ID1' or a.parent_id = 'ID1')) to '/var/lib/postgresql/datapoints.csv' delimiter ',' CSV HEADER;
```

#### Delete all asset datapoints older than N days
`delete from asset_datapoint where timestamp < now() - INTERVAL '7 days';`

#### Importing asset data points
To import data points stored in multiple exports (with potential duplicates) then first create a temp table:
```
CREATE TEMP TABLE tmp_table AS SELECT * FROM asset_datapoint WITH NO DATA;
```

Import the CSV files into this temp table:
`COPY tmp_table FROM '/var/lib/postgresql/datapoints.csv' DELIMITER ',' CSV;`

Remove values for assets that don't exist in the running system:
```
DELETE FROM tmp_table D WHERE NOT (D.entity_id IN (SELECT DISTINCT ID from ASSET));
```

Insert unique values into `ASSET_DATAPOINT` table:
```
INSERT INTO asset_datapoint SELECT * FROM tmp_table ON CONFLICT DO NOTHING;
```

Drop temp table:
`DROP TABLE tmp_table;`

### Selfsigned SSL
To add the OpenRemote selfsigned certificate to the default java keystore `cacerts`:

1. Convert to `p12`: `openssl pkcs12 -export -in proxy/selfsigned/localhost.pem -out or_selfsigned.p12` (use default password `changeit`
2. Import into default java keystore: `openssl pkcs12 -export -in openremote/proxy/selfsigned/localhost.pem -out or_selfsigned.p12` (Windows will need to execute this in Command Prompt with Admin permissions)

### Consoles

#### Remove consoles that haven't registered for more than N days

:::note

**Following will require manager to be restarted**

:::

`DELETE FROM asset a WHERE a.asset_type = 'urn:openremote:asset:console' AND to_timestamp((a.attributes#>>'{consoleName, valueTimestamp}')::bigint /1000) < (current_timestamp - interval '30 days');`

### Notifications

#### Count notifications with specific title sent to consoles (Android/iOS) in past N days

`select count(*) FROM notification n JOIN asset a ON a.id = n.target_id WHERE n.message ->> 'title' = 'NOTIFICATION TITLE' and n.sent_on > (current_timestamp - interval '7 days') and a.attributes #>> '{consolePlatform, value}' LIKE 'Android%' and n.acknowledged_on is not null;`

#### Count notifications with specific title sent to consoles (Android/iOS) and acknowledged by:

##### Closing/Dismissing
`select count(*) FROM notification n JOIN asset a ON a.id = n.target_id WHERE n.message ->> 'title' = 'Kijk mee naar de proefbestrating op de Demer' and n.acknowledged_on is not null and n.acknowledgement = 'CLOSED';`

##### Clicking the notification
`select count(*) FROM notification n JOIN asset a ON a.id = n.target_id WHERE n.message ->> 'title' = 'NOTIFICATION TITLE' and n.acknowledged_on is not null and n.acknowledgement is null;`

##### Clicking a specific action button
`select count(*) FROM notification n JOIN asset a ON a.id = n.target_id WHERE n.message ->> 'title' = 'Kijk mee naar de proefbestrating op de Demer' and n.acknowledged_on is not null and n.acknowledgement LIKE '%BUTTON TITLE%';`
