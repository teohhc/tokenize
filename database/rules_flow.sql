-- Table: tokenize.rules_flow

-- DROP TABLE tokenize.rules_flow;

CREATE TABLE IF NOT EXISTS tokenize.rules_flow
(
    id integer NOT NULL DEFAULT nextval('tokenize.rules_flow_id_seq'::regclass),
    category character varying COLLATE pg_catalog."default",
    name character varying COLLATE pg_catalog."default",
    flow jsonb,
    update_dt timestamp with time zone,
    "desc" character varying COLLATE pg_catalog."default",
    CONSTRAINT rules_flow_pkey PRIMARY KEY (id),
    CONSTRAINT rules_flow_unq UNIQUE (category, name)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE tokenize.rules_flow
    OWNER to sasuser;
