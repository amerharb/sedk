# Changelog
<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.11.5]  2022-05-21
### Changes
- validate if there is more than one WHERE step

## [0.11.4]  2022-04-30
### Added
- Support bitwise operations in `&`, `|` and `#` 
- Unit test for On step and more coverage
### Changes
- use backtick instead of single quote in unit test files
### Breaking Changes
- Remove deprecated function `getBinds()` and type `PostgresBinder`

## [0.11.3]  2022-04-19
### fix
- Version mistake in package.json
### Changes
- Deprecate PostgresBinder Type and getBinder() function
- Add SelectItemInfo to select method

## [0.11.1]  2022-04-15
### Fixed
- Change package.json files to include sub folders

## [0.11.0]  2022-04-11
### Changes
- Table data builder change to array of FromItemInfo
- testTable in unit test renamed to table1
- Remove set builderOption from OrderByItemInfo and SelectItemInfo, not needed anymore as we are passing the builderData to getStmt()
- Update RailRoad documentation to include Joins steps

### Added
- From step can take more than one table
- Builder option addAsBeforeTableAlias to Builder Option
- AliasedTable class, table can be aliased
- CrossJoin Step
- Join, InnerJoin, LeftJoin, RightJoin, FullOuterJoin Steps

## [0.10.1]  2022-04-08
### Changes
- Rename "column?" to "col?" in unit test
- Refactor group by aggregate functions
- Refactor all change getStmt arg to BuilderData
- Add Condition functions (eq, ne, gt...etc) to AggregateFunction
- Move Expression into Expression.ts file
- Move Condition into Condition.ts file
- Move Operand class into Operand.ts file
- Rename models to types and move it inside models folder
- Rename file select.ts to SelectItemInfo.ts

### Added
- Having step can contain aggregate function condition
- IStatementGiver Interface
- option addPublicSchemaName to Builder Option
- Builder data to Table getStmt
- option addTableName to Builder Option
- Builder data to Column getStmt

## [0.10.0]  2022-03-26
### Changes
- BaseStep is a class now that Step inherits from it
- Rename `OrStep` and `AndStep` to `WhereOrStep` and `WhereAndStep`
- Make WhereStep a class instead of Interface, do the same with HavingStep, so we won't have conflict with `Or` and `And` functions
- Refactored the code write BaseStep, WhereStep and HaveStep in separate files
### Added
- Add HavingStep class
- Add HavingOrStep and HavingAndStep classes

## [0.9.0]  2022-03-14
### Added
- Add GroupBy step
- Add GroupBy aggregated functions
- Add "$()" function that give binder directly from primitive type
### Breaking Changes
- Add new function cleanUp() that need to be called manually before start building a new query
- property "columnName" in Column class renamed to "name"

## [0.8.2]  2022-03-05
### Fix
- Mistake in README.md
### Breaking Changes
- Add columns as generic to Table class
- Add tables as generic to Schema class
- Add schemas as generic to Database class

## [0.8.1]  2022-02-25
### Added
- in test folder add schema in separate folder
### Breaking Changes
- restructure Database schema classes
  - move version no to Database 
  - rename class Database to Schema
  - tables now belong to Schema
  - create class Database that contain several schemas
  - construct database schema by object

## [0.8.0]  2022-02-17
### Added
- Add LIMIT and OFFSET steps
- Add LIMIT$ and OFFSET& for binds values
### Breaking Changes
- cleanUp() only called when select step called from builder
- cleanUp() never call automatically when calling getSQL() or getPostgresqlBinding()
- rename getPostgresqlBinding() to getBinds()

## [0.7.1]  2022-02-14
### Added
- Flex arg for OrderBy step, now you can add DESC, ASC, NULLS_FIRST... as argument with columns and aliases
### Fixed
- Convert OrderByDirection & OrderByNullsPosition enum into classes to avoid mistakes when enum counted as string

## [0.7.0]  2022-02-12
### Added
- Add SelectItemInfo that contain info about the SelectItem and the alias that it use
- Column has as() function can be used to export SelectItemInfo
- Expression also has as() function
- Add new option `addAsBeforeColumnAlias?: 'always'|'never'`
- OrderBy Expression
- OrderBy helper function o() to create OrderByItemInfo class
### Fixed
- ASTERISK, DISTINCT & ALL uses Symbol for better identification
- BuilderOption refactored by moving it to a new separate file
- Column name always produced with double quote around them
- Table name always produced with double quote around them
- Typo in Table class rename getColumn() to getColumns()
- Bug in when "addNulls" & "addAsc" options set to "never"

## [0.6.1]  2022-01-31
### Fixed
- export DISTINCT & ALL 

## [0.6.0]  2022-01-30
### Added
- enhance Builder Option Object
  - ASC for ORDER BY
  - NULLS LAST for ORDER BY

- orderBy Step can generate ASC, DESC, NULLS FIRST, NULLS LAST
- 8 functions added to Column class to give OrderByItemInfo class
- Column class knows its table
- Add **Distinct** and **All** clauses as function name `selectDistinct(...` and `selectAll(...`
- Add **Distinct** and **All** clauses as param in select `select(DISTINCT, ...` and `select(ALL, ...`

## [0.5.1]  2022-01-29
### fixed
- typo in function name from "selectAstriskFrom" to "selectAsteriskFrom"

## [0.5.0]  2022-01-28
### Added
- Select step can include null value
- Add Asterisk to Select step
- Add selectAsteriskFrom function to Builder
- Add Steps RailRoad in doc
- Add OrderBy step

## [0.4.9]  2022-01-27
### Fixed
- bug in extending classes STEPs
- fix mistake in error message
