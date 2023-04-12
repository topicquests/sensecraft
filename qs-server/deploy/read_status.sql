-- Deploy sensecraft:read_status to pg

-- requires members

-- requers conversation_node

BEGIN;

--

-- Name: read_status; Type: TABLE

--

CREATE TABLE
    IF NOT EXISTS public.read_status (
        node_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        last_read TIMESTAMP
        WITH
            TIME ZONE,
            seconds_shown INTERVAL,
            force_unread BOOLEAN DEFAULT FALSE,
            PRIMARY KEY (node_id, member_id),
            CONSTRAINT read_status_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.conversation_node(id) ON UPDATE CASCADE ON DELETE CASCADE,
            CONSTRAINT read_status_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE
    );

COMMIT;