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

When a member signs in check if belong to guild.
If member does not belong to a guild send to Lobbby.
Lobby contains list of guilds.
*getGuilds()
User chooses a guild to join
*joinGuild
First make sure user does not belong to that guild.
If they are not already a member then join


Mamber joins a Guild by choosing on from the guild list.
Upon joining Guild member is directed to that Guilds page

Methods:
getQuests()
getGuilds()
checkMemberBelongToGuild()

## Quest Request

Description: A guild request to participate in a quest. The member that makes the request must be a member of the guild requesting. The guild must not be actively participating in any other quest. When making the request the requestor will need to choose which guild, if participating in more then one guild, the request is for.


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

