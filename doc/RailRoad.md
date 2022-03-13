# RailRoad
RailRoad diagram generated using https://www.bottlecaps.de/rr/ui

### Steps Grammar: 
```
SEDK ::= Builder ( ( 'SELECT' | 'SELECT_ALL' | 'SELECT_DISTINCT' ) 'FROM' | 'SELECT_ASTERISK_FROM' ) 

( 'WHERE' ( 'AND' | 'OR' )* )? 

( 'GROUPBY' ('HAVING' ( 'AND' | 'OR' )*)? )? 

'ORDER BY'? 'LIMIT'? 'OFFSET'?
```
