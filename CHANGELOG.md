## Changelog
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

#### [2.0.0] - 2020-25-02

##### Updated
- Module now uses Instagram's Basic display api

#### [1.3.0] - 2020-19-11

##### Updated
- Added caching to vsf-api request


#### [1.2.0] - 2020-15-07

##### Updated
- New shiny README.md
- Renamed `media_url` and `media_url_hq` to `image` and `image_hq` respectively so that the feed works out-of-the-box with capybara images grid
- Moved graphql query id to a constant, since it might change in the future

##### Fixed
- Fixed an error when item caption was not set
- Fixed type errors VSF module
- Renamed components directory to mixins


#### [1.1.0] - 2020-12-03

##### Added
- Edited API, to provide intagram feed without API token
- Added Like count, instagram profile name, hq image link to JSON response
- Edited README files for both API and VSF, provided detailed information about dispatch

#### [1.0.0] - 2020-03-03

##### Added
- Created vsf and vsf-api modules with readme


