# QS Design

## Purpose

This document details the design specifications of the QS-Demo game. It is a living document, that will be updated as needed. All contents will have been discussed and agreed upon by the team.  Document will also show how the project structure is formatted. It describes the framework used to create the game. Framework has been decided on by the applications needs and not forcing game into the framework. Details the database schema. The schema will describe the storage of data along with the relationshib of the data. Database tables are also described here.

## Program Framework

* Vue
* Vuex
* Quasar
* Feathersjs
* PostgreSql
  
## Folder Structure

documentation contains project documentation

qs-client used for frontend code

qs-server used for backend code

Standard feathers folder structure

Standard Vue and Vuex folder structure
*Store
*Services

## Security

When users are not logged in they do not have access to pages that contain users data.

### Logon

*Validate user has been registered
*Check user's email and password
*Change user to be authorized
*Create user information in store
*Change Layout to layout with left drawer and logout button 

### Logoff

*route user to home page
*Clear users data
*Change user to be unauthorized

Pages requiring user to be logged in to view

* Quest
* Guild
  
## Lobby

Description: Lobby page is where a user that does not belong to a guild is directed. There are views of Quests and Guilds. Also at the top will be a scoreboard and info. From here a member can join a guild.

When a member signs in check if belong to guild

Methods:
getQuests()
getGuilds()


## TABLES

Table names in Feathersjs are either plural of the Model or can be set with FREEZETABLENAME option.

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

### ROLES

| NAME   | DATA TYPE | OPTIONS  |
| :----- | :-------- | :------- |
| roleId | serial    | NOT NULL |
| owner  | integer   | NOT NULL |
| player | integer   | NOT NULL |
| leader | integer   | NOT NULL |
| member | integer   | NOT NULL |


### USERES

| NAME      | DATA TYPE | OPTIONS  | DESCRIPTION                     |
| :-------- | :-------- | :------- | :------------------------------ |
| userId    | serial    | NOT NULL | Auto incremented unique user id |
| user      | TEXT      | NOT NULL | Unique user name                |
| lastName  | TEXT      | NULL     | Users last name                 |
| firstName | TEXT      | NULL     | Users first name                |
| handle    | TEXT      | NULL     | Users handle                    |
| password  | TEXT      | NOT NULL | Encrypted password for sign in  |


### GUILD

| NAME    | DATA TYPE | OPTIONS  |
| :------ | :-------- | :------- |
| guildId | serial    | NOT NULL |
| questId | integer   | NOT NULL |


### GUILD_QUEST

| NAME         | DATA TYPE | OPTIONS  |
| :----------- | :-------- | :------- |
| guildQuestId | serial    | NOT NULL |
| guildId      | serial    | NOT NULL |
| questId      | integer   | NOT NULL |

### USER_GUILD

| NAME        | DATA TYPE | OPTIONS  |
| :---------- | :-------- | :------- |
| userGuildId | serial    | NOT NULL |
| guildId     | serial    | NOT NULL |
| userId      | serial    | NOT NULL |

## Registraion

Form data

* Email
* First name
* Last name
* Handle
* Password

Email must be formated correctly. And must be unique

## Sign on

Form data

* Email
* Password

## Pages

### Quest Pages

Quest
Quest Landing
QuestForm

