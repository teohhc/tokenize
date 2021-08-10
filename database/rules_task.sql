-- Table: tokenize.rules_task

-- DROP TABLE tokenize.rules_task;

CREATE TABLE IF NOT EXISTS tokenize.rules_task
(
    id integer NOT NULL DEFAULT nextval('tokenize.rules_task_id_seq'::regclass),
    category character varying COLLATE pg_catalog."default",
    name character varying COLLATE pg_catalog."default",
    "desc" character varying COLLATE pg_catalog."default",
    task jsonb,
    update_dt timestamp with time zone,
    CONSTRAINT rules_task_pkey PRIMARY KEY (id),
    CONSTRAINT unq_rules_flow UNIQUE (category, name)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE tokenize.rules_task
    OWNER to sasuser;
