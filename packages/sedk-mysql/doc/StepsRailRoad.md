# RailRoad
RailRoad diagram generated using https://www.bottlecaps.de/rr/ui

### Steps Grammar: 
```
SQL ::=  

  (  // SELECT Path

  ( ( ( 'SELECT' ) ( 'FROM' ) ) | ( 'SELECT_ASTERISK_FROM' ) )
  
  ( ( 'JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'INNER JOIN' ) 'ON' ( 'AND' | 'OR' )* )*

  ( 'WHERE' ( 'AND' | 'OR' )* )? 

  ( 'GROUPBY' ('HAVING' ( 'AND' | 'OR' )*)? )? 

  'ORDER BY'?

  ) | ( // DELETE Path

  ( ( 'DELETE' 'FROM' ) | ( 'DELETE_FROM' ) )

  ( 'WHERE' ( 'AND' | 'OR' )* )?

  ) | ( // INSERT Path

  ( ( 'INSERT' 'INTO' ) | ( 'INSERT_INTO' ) )

  ( 'VALUES' | SELECT )

  ) | ( // UPDATE Path

  ( 'UPDATE' 'SET' )

  ( 'WHERE' ( 'AND' | 'OR' )* )?
  )
```
