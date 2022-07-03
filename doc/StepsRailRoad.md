# RailRoad
RailRoad diagram generated using https://www.bottlecaps.de/rr/ui

### Steps Grammar: 
```
SQL ::=  

  (  // SELECT Path

  ( ( ( 'SELECT' | 'SELECT_ALL' | 'SELECT_DISTINCT' ) ( 'FROM' ) ) | ( 'SELECT_ASTERISK_FROM' ) )

  ( ( ( 'JOIN' | 'LEFT_JOIN' | 'RIGHT_JOIN' | 'INNER_JOIN' | 'FULL_OUTER_JOIN' ) 'ON' ( 'AND' | 'OR' )* ) | ( 'CROSS_JOIN' ) )*

  ( 'WHERE' ( 'AND' | 'OR' )* )? 

  ( 'GROUPBY' ('HAVING' ( 'AND' | 'OR' )*)? )? 

  'ORDER BY'? 'LIMIT'? 'OFFSET'?

  ) | ( // DELETE Path

  ( ( 'DELETE' 'FROM' ) | ( 'DELETE_FROM' ) )

  ( 'WHERE' ( 'AND' | 'OR' )* )? 

  )
```
