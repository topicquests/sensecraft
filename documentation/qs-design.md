# QS Design

## Program Framework

* Vue
* Vuex
* Quasar
* Feathersjs
* Postgres

## Folder Structure

qs-client used for frontend code

qs-server used for backend code

Standard feathers folder structure

Standard Vue and Vuex folder structure

&nbsp;

## TABLES

### QUEST

| NAME            | DATA TYPE | OPTIONS  |
| :-------------- | :-------- | :------- |
| questId         | integer   | NOT NULL |
| quest           | TEXT      | NOT NULL |
| manager         | integer   | NULL     |
| qsme            | DATE      | NULL     |
| pubDate         | DATE      | NULL     |
| maxNumberRounds | integer   | NULL     |
| delay           | integer   | NULL     |
| creator         | integer   | NULL     |
&nbsp;

### ROLES

| NAME   | DATA TYPE | OPTIONS  |
| :----- | :-------- | :------- |
| roleId | serial    | NOT NULL |
| owner  | integer   | NOT NULL |
| player | integer   | NOT NULL |
| leader | integer   | NOT NULL |
| member | integer   | NOT NULL |

&nbsp;

### USERES

| NAME     | DATA TYPE | OPTIONS  |
| :------- | :-------- | :------- |
| userId   | serial    | NOT NULL |
| user     | TEXT      | NOT NULL |
| lastName | TEXT      | NOT NULL |
| handle   | TEXT      | NOT NULL |
| homepage | TEXT      | NULL     |
| password | TEXT      | NOT NULL |
| roleId   | serial    | NULL     |

&nbsp;

### GUILD

| NAME    | DATA TYPE | OPTIONS  |
| :------ | :-------- | :------- |
| guildId | serial    | NOT NULL |
| questId | integer   | NOT NULL |

&nbsp;

### GUILD_QUEST

| NAME         | DATA TYPE | OPTIONS  |
| :----------- | :-------- | :------- |
| guildQuestId | serial    | NOT NULL |
| guildId      | serial    | NOT NULL |
| questId      | integer   | NOT NULL |
&nbsp;

### USER_GUILD
| NAME        | DATA TYPE | OPTIONS  |
| :---------- | :-------- | :------- |
| userGuildId | serial    | NOT NULL |
| guildId     | serial    | NOT NULL |
| userId      | serial    | NOT NULL |
