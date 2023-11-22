# Changelog
<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.3.2]  2023-11-19
### Changed
- Lint must have no warning in GitHub pipeline
- Update root package dependencies to latest version (sedk only has dev dependencies), which fix vulnerabilities
- Remove unused dependencies `ts-node`
- End support for node v14.x (only applicable for root package)
- publish sedk-mysql in pipeline

## [0.3.1]  2023-09-23
### Added
- test against node v20.x in pipeline
- refactor examples
- add example for sedk-mysql: sedk-mysql-ts-example, sedk-mysql-js-example
- add example for sedk-neo4j: sedk-neo4j-js-example

## [0.3.0]  2023-01-06
### Added
- add package sedk-mysql to workspace

## [0.1.2]  2023-01-05
### Added
- add package sedk-neo4j to workspace
- add example project sedk-neo4j-ts-example

## [0.0.1]  2023-01-05
### Added
- workspace for  sedk-postgres
- add 2 examples project for sedk-postgres in js and ts
