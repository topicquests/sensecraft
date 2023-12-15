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

client used for frontend code

server used for backend code

Standard feathers folder structure

Standard Vue and Vuex folder structure
*Store
*Services

## Security

When users are not logged in they do not have access to pages that contain users data.

### Logon

*Validate member has been registered
*Check member's email and password
*Change member to be authorized
*Create member information in store
*Change Layout to layout with left drawer and logout button

### Logoff

*route member to home page
*Clear users data
*Change member to be unauthorized

Pages requiring member to be logged in to view

* Quest
* Guild

## Lobby

Description: Lobby page is where a member that does not belong to a guild is directed. There are views of Quests and Guilds. Also at the top will be a scoreboard and info. From here a member can join a guild.

When a member signs in check if belong to guild.
If member does not belong to a guild send to Lobbby.
Lobby contains list of guilds.
*getGuilds()
User chooses a guild to join
*joinGuild
First make sure member does not belong to that guild.
If they are not already a member then join


Mamber joins a Guild by choosing on from the guild list.
Upon joining Guild member is directed to that Guilds page

Methods:
getQuests()
getGuilds()
checkMemberBelongToGuild()

## Guild-app
Description: This is where guild members make decissions. GuildAdmin can choose the quest. Members can work on the node of the quest.

## Join Guild
A member chooses to join a guild from the lobby

When a member chooses to join a guild they are taken to that guild.
First check to see if not already a member
Second if not a member join
Third if guild is participating in a quest add member to quests
## Quest Request

Description: A guild request to participate in a quest. The guild admin select the quests for the guild. The requester must be a member of the guild requesting. When making the request the requestor will need to choose which guild, if participating in more then one guild, the request is for.

before mount
ensure list of quests and guilds are up to date in vuex.
set current guild in vuex
Determine members associated with guild

Display handles and roles of each member.
Display the quest currently playing
Display list of quests registered


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

