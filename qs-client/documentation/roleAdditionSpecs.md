# Create new role

Two types of new roles, system roles and guild roles
System roles are to be used system wide whereas guild roles are specific to an individual guild

## Pages

- Admin
- CreateRole
- RoleEdit

## Tables

### Role table

| Column                    | Type              | Nullable | Description                          |
| :------------------------ | :---------------- | :------- | :----------------------------------- |
| id                        | integer           | not null | primary key auto increment row id    |
| name                      | char(255)         | not null | unique name of role                  |
| guild_id                  | integer           |          | id of guild that created role        |
| permissions               | permission[]      |          | Array enum of permissions            |
| max_pub_state             | publication_state |          | enum max available publication state |
| role_draft_target_role_id | integer           |          |                                      |

### Role node constraint table

| Column                   | Type              | Nullable | Description                          |
| :----------------------- | :---------------- | :------- | :----------------------------------- |
| role_id                  | integer           | not null | id that matches a role               |
| node_type                | ibis_node_type    |          | enum of the ibis node type           |
| max_pub_state            | publication_state |          | enum max available publication state |
| role_drat_target_role_id | integer           |          |                                      |

## **_Rest Calls_**

### **_Role_**

post

patch

get

### **_Role_node_constraint_**

post

Create new role

patch

get

## getters

getRoleById

getDefaultRoleId

getRoleByName

## Actions

EnsureAllRoles

### QTable

Table list existing roles. Contains role name, permissions and max puplish state. Also contains a link for editing

### QButton

Button link for new role
