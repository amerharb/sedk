# Changelog
<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.0.4]  2022-09-12
### Added
- return a Cypher statement without return clause
- use A `ASTERISK` in return step
- dynamic unit test from text file using eval command 
- backtick to label and variable names
### Changed
- major refactoring of the way cypher get generated
### Breaking Changes
- remove function cleanUp()
- not steps like code `cypher.getCypher()` is now return an empty string instead of throwing error

## [0.0.3]  2022-09-05
### Added
- use Variable and Labels in "match()" step
- use Variable in "return()" step

## [0.0.2]  2022-07-20
### Added
- documentation
- make Label a class
### Breaking Change
- match step takes spread array instead of array

## [0.0.1]  2022-07-17
### Added
- initial project
