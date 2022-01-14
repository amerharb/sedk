regex to replace multi white space with one space, ignore singel quoted text
NEED: enhance it to cover the case when there is escape quote "\'"
`const whiteSpaceRegex = /\s+(?=(?:'[^']*'|[^'])*$)/g`


exp operator logic:
- null     +   null     -> error
- null     +   boolean  -> error
- null     +   number   -> null
- null     +   text     -> error
- boolean  +   null     -> error
- boolean  +   boolean  -> error
- boolean  +   number   -> error
- boolean  +   text     -> error
- number   +   null     -> null
- number   +   boolean  -> error
- number   +   number   -> number
- number   +   text     -> error
- text     +   null     -> error
- text     +   boolean  -> error
- text     +   number   -> error
- text     +   text     -> error





text   + text   error

Idea
there is alias step all capital
.select() and .SELECT()
if you pick the SELECT then the result will be also all capital


todo:
- steps:
  - xor
  - order-by
  - group-by
  - having
  - left/right/inner join, on
  - Asterisk
  - column
  - as
  - insert
  - update
  - delete

- FROM should take more than one table
- alias step for all capital letter
- 
