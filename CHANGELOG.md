# Changelog
<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.6.0]  2022-01-29
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
