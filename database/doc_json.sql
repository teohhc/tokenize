-- Table: tokenize.doc_json

-- DROP TABLE tokenize.doc_json;

CREATE TABLE IF NOT EXISTS tokenize.doc_json
(
    id integer NOT NULL DEFAULT nextval('tokenize.doc_json_id_seq'::regclass),
    data jsonb,
    update_dt timestamp with time zone,
    filename character varying COLLATE pg_catalog."default",
    subgroup jsonb,
    ext character varying COLLATE pg_catalog."default",
    language jsonb,
    CONSTRAINT doc_json_pkey PRIMARY KEY (id),
    CONSTRAINT doc_json_unq UNIQUE (filename, subgroup, ext, language)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE tokenize.doc_json
    OWNER to sasuser;
