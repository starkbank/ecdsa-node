# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to the following versioning pattern:

Given a version number MAJOR.MINOR.PATCH, increment:

- MAJOR version when **breaking changes** are introduced;
- MINOR version when **backwards compatible changes** are introduced;
- PATCH version when backwards compatible bug **fixes** are implemented.


## [Unreleased]

## [1.1.5] - 2022-08-31
### Fixed
- unset variables on math and der files

## [1.1.4] - 2021-11-09
### Fixed
- point at infinity verification in signature and public key

## [1.1.3] - 2021-11-04
### Fixed
- Signature r and s range check

## [1.1.2] - 2020-09-27
### Added
- package-lock.json

## [1.1.1] - 2020-09-02
### Changed
- mocha to dev dependencies in package.json

## [1.1.0] - 2020-08-26
### Added
- external randNum override to Ecdsa.sign

## [1.0.0] - 2020-04-15
### Added
- first official version