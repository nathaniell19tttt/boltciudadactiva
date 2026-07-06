/*
# Add check_email_role function

Creates a SECURITY DEFINER function that safely checks whether an email
is already registered and returns its role. Used during registration to
prevent the same email from being registered under two different user types.

1. New Functions
   - `check_email_role(check_email text) → text`
     Returns the role ('trabajador' or 'empresa') if the email exists,
     or NULL if it does not exist.

2. Security
   - SECURITY DEFINER: runs with the role of the function owner (bypasses RLS)
     so the anon client can check without exposing the whole users table.
   - GRANT EXECUTE TO anon: allows unauthenticated callers during registration.
   - Only returns 'role' — no PII or sensitive data is exposed.
*/

CREATE OR REPLACE FUNCTION check_email_role(check_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM public.users
  WHERE email = check_email
  LIMIT 1;

  RETURN v_role; -- NULL if email not registered
END;
$$;

GRANT EXECUTE ON FUNCTION check_email_role TO anon;
GRANT EXECUTE ON FUNCTION check_email_role TO authenticated;
