# BROOKLYN
Autonomous AI Artist Character that lives onchain with a goal to raise $1000 in 90days

## DB schema for the backend
```sql
create table public.nft_queue (
  name text not null,
  description text null,
  nft_ipfshash character varying(100) null,
  created_at timestamp with time zone null default now(),
  posted_at timestamp with time zone null,
  status character varying(20) not null default 'pending'::character varying,
  tx character varying(66) null,
  coin character varying(42) null,
  error_message text null,
  id uuid null default gen_random_uuid (),
  constraint nft_queue_pkey primary key (name),
  constraint nft_queue_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'processing'::character varying,
            'completed'::character varying,
            'failed'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;
```