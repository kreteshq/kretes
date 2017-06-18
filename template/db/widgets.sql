DROP DATABASE IF EXISTS app_dev;
CREATE DATABASE app_dev;

\c app_dev;

CREATE TABLE widgets (
  ID SERIAL PRIMARY KEY,
  name VARCHAR
);

INSERT INTO widgets (name)
VALUES
    ('Widget 1'),
    ('Widget 2'),
    ('Widget 3');
