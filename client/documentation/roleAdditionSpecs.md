# Roles and Role Node Constraints

Two types of roles, system roles and guild roles

System roles are to be used system wide, whereas guild roles are specific to an individual guild.

System roles contain name, permissions and a max puplish state. Permissions and publish states are enums.

Guild roles contain same columns as system roles, but also use the guild id column.

Roles also use table RoleNodeConstraint table. This table contains node types that the role can use along with the max puplish state for that node type.

## Pages

- Admin
- CreateRole
- RoleEdit

### Components

- Role table
- Role Card
- role-node-constraint-card
- role-node-constraint-table

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

- creatRoleBase
- createRoleNodeConstraintBase

patch

- updateRole

get

- fetchRoles
- fetchRoleById

delete

- deleteRole

### **_Role_node_constraint_**

post

- createNodeConstraint

patch

- updateNodeConstraint

get

- fetchNodeConstraintById

## getters

- getRoleById
- getDefaultRoleId
- getRoleByName
- getRoleNodeConstraintsByRoleId
- getRoleNodeConstraintByType

## Actions

EnsureAllRoles

### QTable

Table list existing roles. Contains role name, permissions and max puplish state. Also contains a link for editing

### QButton

Button link for new role

### Edit Role Node COnstraint from table

Role node constraint table consist of the row containing the data for a particular constraint belonging to a role
