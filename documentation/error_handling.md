# Error syntax

The backend (postgres functions) raise exceptions according to a syntax, which should allow to give meaningful error messages to the frontend. (TODO.)

The base syntax is `error_type params* / free text`. The free text should probably be localized on the frontend.

Established error_types and their params:

* `immutable [column_name]:` trying to change an immutable column in a table
* `permission [permission]:` lacking a specific permission to do something (When appropriate, it would be nice to say what role  would give the permission.)
* `invalid [column_name] (options:[possible_value,...])?:` giving an invalid value to a column. `possible_value` (not used yet) would be an enumeration of values.
* `missing [column_name] (options:[possible_value,...])?:` special case of above.
