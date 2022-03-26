# Changelog
<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.10.0]  2022-03-18
### Changes
- BaseStep is a class now that Step inherate from it

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
