for f in /migrations/*.sql; do
    echo Running $f;
    PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -d $POSTGRES_DB -f $f;
done


# it's might be interesting to expose a way to upgrade the database if a new migration file added
# or let make use of node-pg-migrate to manage our migrations...