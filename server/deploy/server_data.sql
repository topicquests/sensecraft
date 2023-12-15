-- Deploy server_data

BEGIN;

CREATE TABLE IF NOT EXISTS public.server_data (
  smtp_server varchar DEFAULT 'localhost',
  smtp_port integer DEFAULT 25,
  smtp_auth_method varchar DEFAULT 'plain',
  smtp_secure boolean,
  smtp_username varchar,
  smtp_password varchar,
  server_url varchar,
  confirm_account_mail_template_title varchar,
  confirm_account_mail_template_text TEXT,
  confirm_account_mail_template_html TEXT,
  reset_password_mail_template_title varchar,
  reset_password_mail_template_text TEXT,
  reset_password_mail_template_html TEXT
);

-- singleton
CREATE UNIQUE INDEX IF NOT EXISTS server_data_singleton ON public.server_data ((true));

INSERT INTO public.server_data (smtp_username) VALUES (NULL) ON CONFLICT DO NOTHING;

COMMIT;
