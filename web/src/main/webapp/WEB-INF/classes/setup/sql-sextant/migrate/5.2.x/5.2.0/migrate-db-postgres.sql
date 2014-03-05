-- Creates New tables required for this version
CREATE TABLE Address
(
	id			  int 			not null,
	address       varchar(128),
	city          varchar(128),
	state         varchar(32),
	zip           varchar(16),
	country       varchar(128),
	primary key(id)
);

CREATE TABLE UserAddress
(
	userid 	int not null,
	addressid int not null,
	primary key(userid,addressid),
    foreign key(userid) references Users(id),
    foreign key(addressid) references Address(id)
);

CREATE TABLE Email
(
	user_id			  int 			not null,
	email         varchar(128),

	primary key(user_id),
    foreign key(user_id) references Users(id)
);


ALTER TABLE Requests ALTER COLUMN query TYPE text;
ALTER TABLE Requests ALTER COLUMN type TYPE text;
ALTER TABLE Requests ALTER COLUMN spatialfilter TYPE text;

--Inserts new data and modifies data

ALTER TABLE operations DROP COLUMN reserved;
ALTER TABLE services DROP COLUMN id;

ALTER TABLE Settings ADD internal varchar(1);

UPDATE Settings SET internal = 'n' WHERE name IN ('system/site/name',
'system/site/siteId',
'system/site/organization',
'system/platform/version',
'system/platform/subVersion',
'system/server/host',
'system/server/port',
'system/server/protocol',
'system/userSelfRegistration/enable',
'system/searchStats/enable',
'system/inspire/enableSearchPanel',
'system/harvester/enableEditing',
'system/metadata/defaultView',
'system/hidewithheldelements/enable');
UPDATE Settings SET internal = 'y' WHERE internal IS NULL;



INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/harvesting/mail/recipient', NULL, 0, 9020, 'y');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/harvesting/mail/template', '', 0, 9021, 'y');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/harvesting/mail/templateError', 'There was an error on the harvesting: $$errorMsg$$', 0, 9022, 'y');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/harvesting/mail/templateWarning', '', 0, 9023, 'y');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/harvesting/mail/subject', '[$$harvesterType$$] $$harvesterName$$ finished harvesting', 0, 9024, 'y');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/harvesting/mail/enabled', 'false', 2, 9025, 'y');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/harvesting/mail/level1', 'false', 2, 9026, 'y');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/harvesting/mail/level2', 'false', 2, 9027, 'y');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/harvesting/mail/level3', 'false', 2, 9028, 'y');

INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/requestedLanguage/ignorechars', '', 0, 9590, 'y');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/userFeedback/enable', 'true', 2, 1911, 'n');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES ('system/csw/transactionUpdateCreateXPath', 'true', 2, 1320, 'n');


-- INSERT INTO Settings (name, value, datatype, position, internal) VALUES
--  ('map/backgroundChoices', '{"contextList": []}', 0, 9590, false);
INSERT INTO Settings (name, value, datatype, position, internal) VALUES
  ('map/config', '{"useOSM":false,"context":"","layer":{"url":"http://www2.demis.nl/mapserver/wms.asp?","layers":"Countries","version":"1.1.1"},"projection":"EPSG:4326","projectionList":["EPSG:4326","EPSG:2154","EPSG:3857"]}', 0, 9590, 'n');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES
  ('map/proj4js', '[{"code":"EPSG:2154","value":"+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"}]', 0, 9591, 'n');
INSERT INTO Settings (name, value, datatype, position, internal) VALUES
  ('metadata/editor/schemaConfig', '{"iso19110":{"defaultTab":"default","displayToolTip":false,"related":{"display":true,"readonly":true,"categories":["dataset"]},"validation":{"display":true}},"iso19139":{"defaultTab":"inspire","displayToolTip":false,"related":{"display":true,"categories":[]},"suggestion":{"display":true},"validation":{"display":true}},"dublin-core":{"defaultTab":"default","related":{"display":true,"readonly":true,"categories":[]},}}', 0, 10000, 'n');


-- Version update
UPDATE Settings SET value='2.11.0' WHERE name='system/platform/version';
UPDATE Settings SET value='SNAPSHOT' WHERE name='system/platform/subVersion';

-- Populate new tables from Users
INSERT INTO Address (SELECT id, address, city, state, zip, country FROM Users);
INSERT INTO UserAddress (SELECT id, id FROM Users);
INSERT INTO Email (SELECT id, email FROM Users);


CREATE SEQUENCE HIBERNATE_SEQUENCE START WITH 4000 INCREMENT BY 1;
ALTER TABLE ServiceParameters DROP COLUMN id;



-- Update Requests column type (integer > boolean)
ALTER TABLE Requests ADD COLUMN autogeneratedtemp boolean;
UPDATE Requests SET autogeneratedtemp = false;
UPDATE Requests SET autogeneratedtemp = true WHERE autogenerated = 1;
ALTER TABLE Requests DROP COLUMN autogenerated;
ALTER TABLE Requests ADD COLUMN autogenerated boolean;
UPDATE Requests SET autogeneratedtemp = autogenerated;
ALTER TABLE Requests DROP COLUMN autogeneratedtemp;

ALTER TABLE Requests ADD COLUMN simpletemp boolean;
UPDATE Requests SET simpletemp = false;
UPDATE Requests SET simpletemp = true WHERE simple = 1;
ALTER TABLE Requests DROP COLUMN simple;
ALTER TABLE Requests ADD COLUMN simple boolean;
UPDATE Requests SET simpletemp = simple;
ALTER TABLE Requests DROP COLUMN simpletemp;


-- Create temporary tables used when modifying a column type

-- Convert Profile column to the profile enumeration ordinal

CREATE TABLE USERGROUPS_TMP
(
   USERID int NOT NULL,
   GROUPID int NOT NULL,
   PROFILE int NOT NULL
);


-- Convert Profile column to the profile enumeration ordinal

CREATE TABLE USERS_TMP
  (
    id            int         ,
    username      varchar(256),
    password      varchar(120),
    surname       varchar(32),
    name          varchar(32),
    profile       int,
    organisation  varchar(128),
    kind          varchar(16),
    security      varchar(128),
    authtype      varchar(32),

    primary key(id),
    unique(username)
  );

-- ----  Change notifier actions column to map to the MetadataNotificationAction enumeration

CREATE TABLE MetadataNotifications_Tmp
  (
    metadataId         int            not null,
    notifierId         int            not null,
    notified           char(1)        default 'n' not null,
    metadataUuid       varchar(250)   not null,
    action             char(1)        not null,
    errormsg           text
  );


-- ----  Change params querytype column to map to the LuceneQueryParamType enumeration

CREATE TABLE Params_TEMP
  (
    id          int           not null,
    requestId   int,
    queryType   int,
    termField   varchar(128),
    termText    varchar(128),
    similarity  float,
    lowerText   varchar(128),
    upperText   varchar(128),
    inclusive   char(1)
);


-- Copy data from a table that needs a column migrated to an enum to a temporary table

-- Update UserGroups profiles to be one of the enumerated profiles
INSERT INTO USERGROUPS_TMP (userid, groupid, profile) SELECT userid, groupid, 0 FROM USERGROUPS where profile='Administrator';
INSERT INTO USERGROUPS_TMP (userid, groupid, profile) SELECT userid, groupid, 1 FROM USERGROUPS where profile='UserAdmin';
INSERT INTO USERGROUPS_TMP (userid, groupid, profile) SELECT userid, groupid, 2 FROM USERGROUPS where profile='Reviewer';
INSERT INTO USERGROUPS_TMP (userid, groupid, profile) SELECT userid, groupid, 3 FROM USERGROUPS where profile='Editor';
INSERT INTO USERGROUPS_TMP (userid, groupid, profile) SELECT userid, groupid, 4 FROM USERGROUPS where profile='RegisteredUser';
INSERT INTO USERGROUPS_TMP (userid, groupid, profile) SELECT userid, groupid, 5 FROM USERGROUPS where profile='Guest';
INSERT INTO USERGROUPS_TMP (userid, groupid, profile) SELECT userid, groupid, 6 FROM USERGROUPS where profile='Monitor';

-- Convert Profile column to the profile enumeration ordinal
-- create address and email tables to allow multiple per user

INSERT INTO USERS_TMP SELECT id, username, password, surname, name, 0, organisation, kind, security, authtype FROM USERS where profile='Administrator';
INSERT INTO USERS_TMP SELECT id, username, password, surname, name, 1, organisation, kind, security, authtype FROM USERS where profile='UserAdmin';
INSERT INTO USERS_TMP SELECT id, username, password, surname, name, 2, organisation, kind, security, authtype FROM USERS where profile='Reviewer';
INSERT INTO USERS_TMP SELECT id, username, password, surname, name, 3, organisation, kind, security, authtype FROM USERS where profile='Editor';
INSERT INTO USERS_TMP SELECT id, username, password, surname, name, 4, organisation, kind, security, authtype FROM USERS where profile='RegisteredUser';
INSERT INTO USERS_TMP SELECT id, username, password, surname, name, 5, organisation, kind, security, authtype FROM USERS where profile='Guest';
INSERT INTO USERS_TMP SELECT id, username, password, surname, name, 6, organisation, kind, security, authtype FROM USERS where profile='Monitor';

-- ----  Change notifier actions column to map to the MetadataNotificationAction enumeration

INSERT INTO MetadataNotifications_Tmp SELECT metadataId, notifierId, notified, metadataUuid, 0, errormsg FROM MetadataNotifications where action='u';
INSERT INTO MetadataNotifications_Tmp SELECT metadataId, notifierId, notified, metadataUuid, 1, errormsg FROM MetadataNotifications where action='d';

-- ----  Change params querytype column to map to the LuceneQueryParamType enumeration

INSERT INTO Params_TEMP SELECT id, requestId, 0, termField, termText, similarity, lowerText, upperText, inclusive FROM Params where querytype='BOOLEAN_QUERY';
INSERT INTO Params_TEMP SELECT id, requestId, 1, termField, termText, similarity, lowerText, upperText, inclusive FROM Params where querytype='TERM_QUERY';
INSERT INTO Params_TEMP SELECT id, requestId, 2, termField, termText, similarity, lowerText, upperText, inclusive FROM Params where querytype='FUZZY_QUERY';
INSERT INTO Params_TEMP SELECT id, requestId, 3, termField, termText, similarity, lowerText, upperText, inclusive FROM Params where querytype='PREFIX_QUERY';
INSERT INTO Params_TEMP SELECT id, requestId, 4, termField, termText, similarity, lowerText, upperText, inclusive FROM Params where querytype='MATCH_ALL_DOCS_QUERY';
INSERT INTO Params_TEMP SELECT id, requestId, 5, termField, termText, similarity, lowerText, upperText, inclusive FROM Params where querytype='WILDCARD_QUERY';
INSERT INTO Params_TEMP SELECT id, requestId, 6, termField, termText, similarity, lowerText, upperText, inclusive FROM Params where querytype='PHRASE_QUERY';
INSERT INTO Params_TEMP SELECT id, requestId, 7, termField, termText, similarity, lowerText, upperText, inclusive FROM Params where querytype='RANGE_QUERY';
INSERT INTO Params_TEMP SELECT id, requestId, 8, termField, termText, similarity, lowerText, upperText, inclusive FROM Params where querytype='NUMERIC_RANGE_QUERY';



-- Drop the old tables (that are being migrated to an enum) and create them again with new definition

-- Update UserGroups profiles to be one of the enumerated profiles

DROP TABLE USERGROUPS;
CREATE TABLE USERGROUPS
  (
    userId   int          not null,
    groupId  int          not null,
    profile  int          not null,

    primary key(userId,groupId,profile),

    foreign key(userId) references Users(id),
    foreign key(groupId) references Groups(id)
  );
-- Update UserGroups profiles to be one of the enumerated profiles

INSERT INTO USERGROUPS SELECT * FROM USERGROUPS_TMP;
DROP TABLE USERGROUPS_TMP;


-- Convert Profile column to the profile enumeration ordinal

ALTER TABLE metadata DROP CONSTRAINT IF EXISTS metadata_owner_fkey;
ALTER TABLE metadatastatus DROP CONSTRAINT IF EXISTS metadatastatus_userid_fkey;
ALTER TABLE useraddress DROP CONSTRAINT IF EXISTS useraddress_userid_fkey;
ALTER TABLE email DROP CONSTRAINT IF EXISTS email_user_id_fkey;
ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_referrer_fkey;
ALTER TABLE usergroups DROP CONSTRAINT IF EXISTS usergroups_userid_fkey;
DROP TABLE Users;
CREATE TABLE Users
  (
    id            int           not null,
    username      varchar(256)  not null,
    password      varchar(120)  not null,
    surname       varchar(32),
    name          varchar(32),
    profile       int not null,
    organisation  varchar(128),
    kind          varchar(16),
    security      varchar(128)  default '',
    authtype      varchar(32),
    primary key(id),
    unique(username)
  );


-- Convert Profile column to the profile enumeration ordinal

INSERT INTO USERS SELECT * FROM USERS_TMP;
DROP TABLE USERS_TMP;


ALTER TABLE metadata ADD CONSTRAINT metadata_owner_fkey FOREIGN KEY (owner)
      REFERENCES users (id);
ALTER TABLE metadatastatus ADD CONSTRAINT metadatastatus_userid_fkey FOREIGN KEY (userid)
      REFERENCES users (id);
ALTER TABLE useraddress ADD CONSTRAINT useraddress_userid_fkey FOREIGN KEY (userid)
      REFERENCES users (id);
ALTER TABLE email ADD CONSTRAINT email_user_id_fkey FOREIGN KEY (user_id)
      REFERENCES users (id);
ALTER TABLE groups ADD CONSTRAINT groups_referrer_fkey FOREIGN KEY (referrer)
      REFERENCES users (id);


-- ----  Change notifier actions column to map to the MetadataNotificationAction enumeration

DROP TABLE MetadataNotifications;
CREATE TABLE MetadataNotifications
  (
    metadataId         int            not null,
    notifierId         int            not null,
    notified           char(1)        default 'n' not null,
    metadataUuid       varchar(250)   not null,
    action             int        not null,
    errormsg           text,
    primary key(metadataId,notifierId)
  );

-- ----  Change notifier actions column to map to the MetadataNotificationAction enumeration

-- INSERT INTO MetadataNotifications SELECT * FROM MetadataNotifications_Tmp;
DROP TABLE MetadataNotifications_Tmp;

-- ----  Change params querytype column to map to the LuceneQueryParamType enumeration

DROP TABLE Params;

CREATE TABLE Params
  (
    id          int           not null,
    requestId   int,
    queryType   int,
    termField   varchar(128),
    termText    varchar(128),
    similarity  float,
    lowerText   varchar(128),
    upperText   varchar(128),
    inclusive   char(1),
    primary key(id),
    foreign key(requestId) references Requests(id)
  );

-- ----  Change params querytype column to map to the LuceneQueryParamType enumeration

INSERT INTO Params SELECT * FROM Params_TEMP;
DROP TABLE Params_TEMP;

CREATE INDEX ParamsNDX1 ON Params(requestId);
CREATE INDEX ParamsNDX2 ON Params(queryType);
CREATE INDEX ParamsNDX3 ON Params(termField);
CREATE INDEX ParamsNDX4 ON Params(termText);