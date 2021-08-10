-- Table: tokenize.rules_category

-- DROP TABLE tokenize.rules_category;

CREATE TABLE IF NOT EXISTS tokenize.rules_category
(
    id integer NOT NULL DEFAULT nextval('tokenize.rules_category_id_seq'::regclass),
    category character varying COLLATE pg_catalog."default",
    CONSTRAINT rules_category_pkey PRIMARY KEY (id),
    CONSTRAINT unq_rules_category UNIQUE (category)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE tokenize.rules_category
    OWNER to sasuser;
