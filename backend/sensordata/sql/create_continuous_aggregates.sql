-- Create a continuous aggregate for each time bucket
-- This will allow us to query the data in a more efficient way
-- The continuous aggregate will be updated every 24 hours except the hourly one which will be updated every hour
-- Data aggregation will not include the current day to get all data

-- Create a continuous aggregate for year with respective refresh policy
CREATE MATERIALIZED VIEW yearly_sensor_data
WITH (timescaledb.continuous) AS
SELECT time_bucket(INTERVAL'1 year',time) AS "bucket",
AVG((value)::double precision) AS "average",
COUNT(value) AS "count",
parameter_id,
stream_id
FROM "datapoints"
GROUP BY bucket,parameter_id,stream_id
WITH NO DATA;

SELECT add_continuous_aggregate_policy('yearly_sensor_data',
start_offset => NULL,
end_offset => INTERVAL '1 day',
schedule_interval => INTERVAL '1 day');

-- Create a continuous aggregate for month with respective refresh policy
CREATE MATERIALIZED VIEW monthly_sensor_data
WITH (timescaledb.continuous) AS
SELECT time_bucket(INTERVAL'1 month',time) AS "bucket",
AVG((value)::double precision) AS "average",
COUNT(value) AS "count",
parameter_id,
stream_id
FROM "datapoints"
GROUP BY bucket,parameter_id,stream_id
WITH NO DATA;

SELECT add_continuous_aggregate_policy('monthly_sensor_data',
start_offset => NULL,
end_offset => INTERVAL '1 day',
schedule_interval => INTERVAL '1 day');

-- Create a continuous aggregate for day with respective refresh policy
CREATE MATERIALIZED VIEW daily_sensor_data
WITH (timescaledb.continuous) AS
SELECT time_bucket(INTERVAL'1 day',time) AS "bucket",
AVG((value)::double precision) AS "average",
COUNT(value) AS "count",
parameter_id,
stream_id
FROM "datapoints"
GROUP BY bucket,parameter_id,stream_id
WITH NO DATA;

SELECT add_continuous_aggregate_policy('daily_sensor_data',
start_offset => NULL,
end_offset => INTERVAL '1 day',
schedule_interval => INTERVAL '1 day');

-- Create a continuous aggregate for hour with respective refresh policy
CREATE MATERIALIZED VIEW hourly_sensor_data
WITH (timescaledb.continuous) AS
SELECT time_bucket(INTERVAL'1 hour',time) AS "bucket",
AVG((value)::double precision) AS "average",
COUNT(value) AS "count",
parameter_id,
stream_id
FROM "datapoints"
GROUP BY bucket,parameter_id,stream_id
WITH NO DATA;

SELECT add_continuous_aggregate_policy('hourly_sensor_data',
start_offset => NULL,
end_offset => INTERVAL '1 hour',
schedule_interval => INTERVAL '1 hour');
