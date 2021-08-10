-- Table: tokenize.rules_jsonlogic

-- DROP TABLE tokenize.rules_jsonlogic;

CREATE TABLE IF NOT EXISTS tokenize.rules_jsonlogic
(
    id integer NOT NULL DEFAULT nextval('tokenize.rules_jsonlogic_id_seq'::regclass),
    category character varying COLLATE pg_catalog."default",
    jsonlogic jsonb,
    description character varying COLLATE pg_catalog."default",
    update_dt timestamp with time zone NOT NULL,
    name character varying COLLATE pg_catalog."default",
    CONSTRAINT rules_jsonlogic_pkey PRIMARY KEY (id),
    CONSTRAINT unq_rules_jsonlogic UNIQUE (category, name)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE tokenize.rules_jsonlogic
    OWNER to sasuser;
