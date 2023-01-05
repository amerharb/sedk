TODO: add Date type to this table truth

| Left     | Operator | Right    | Result          | Example                           |
|----------|----------|----------|-----------------|-----------------------------------|
| null     | AO       | null     | error           |                                   |
| null     | AO       | boolean  | error           |                                   |
| null     | AO       | number   | null            |                                   |
| null     | AO       | text     | error           |                                   |
| boolean  | AO       | null     | error           |                                   |
| boolean  | AO       | boolean  | error           |                                   |
| boolean  | AO       | number   | error           |                                   |
| boolean  | AO       | text     | error           |                                   |
| number   | AO       | null     | null            |                                   |
| number   | AO       | boolean  | error           |                                   |
| number   | AO       | number   | number          |                                   |
| number   | AO       | text     | number / error  |                                   |
| text     | AO       | null     | error           |                                   |
| text     | AO       | boolean  | error           |                                   |
| text     | AO       | number   | number / error  |                                   |
| text     | AO       | text     | error           |                                   |
| -        | -        | -        | -               |                                   |
| null     | RO       | null     | null            |                                   |
| null     | RO       | boolean  | null            |                                   |
| null     | RO       | number   | null            |                                   |
| null     | RO       | text     | null            |                                   |
| boolean  | RO       | null     | null            |                                   |
| boolean  | RO       | boolean  | boolean         |                                   |
| boolean  | RO       | number   | error           |                                   |
| boolean  | RO       | text     | error           |                                   |
| number   | RO       | null     | null            |                                   |
| number   | RO       | boolean  | error           |                                   |
| number   | RO       | number   | boolean         |                                   |
| number   | RO       | text     | boolean / error |                                   |
| text     | RO       | null     | null            |                                   |
| text     | RO       | boolean  | error           |                                   |
| text     | RO       | number   | boolean / error |                                   |
| text     | RO       | text     | boolean         |                                   |
| -        | -        | -        | -               |                                   |
| null     | TO       | null     | null            |                                   |
| null     | TO       | boolean  | null            |                                   |
| null     | TO       | number   | null            |                                   |
| null     | TO       | text     | null            |                                   |
| boolean  | TO       | null     | null            |                                   |
| boolean  | TO       | boolean  | error           |                                   |
| boolean  | TO       | number   | error           |                                   |
| boolean  | TO       | text     | error           |                                   |
| number   | TO       | null     | null            |                                   |
| number   | TO       | boolean  | error           |                                   |
| number   | TO       | number   | error           |                                   |
| number   | TO       | text     | text            |                                   |
| text     | TO       | null     | null            |                                   |
| text     | TO       | boolean  | error           |                                   |
| text     | TO       | number   | text            |                                   |
| text     | TO       | text     | text            |                                   |
| -        | -        | -        | -               |                                   |
| null     | IS       | null     | boolean         |                                   |
| null     | IS       | boolean  | boolean         |                                   |
| null     | IS       | number   | error           |                                   |
| null     | IS       | text     | error           |                                   |
| boolean  | IS       | null     | boolean         |                                   |
| boolean  | IS       | boolean  | boolean         |                                   |
| boolean  | IS       | number   | error           |                                   |
| boolean  | IS       | text     | error           |                                   |
| number   | IS       | null     | boolean         |                                   |
| number   | IS       | boolean  | error           |                                   |
| number   | IS       | number   | error           |                                   |
| number   | IS       | text     | error           |                                   |
| text     | IS       | null     | boolean         |                                   |
| text     | IS       | boolean  | error / boolean | in case literal 'true'            |
| text     | IS       | number   | error           |                                   |
| text     | IS       | text     | error           |                                   |
| -        | -        | -        | -               |                                   |
| null     | BO       | null     | error           | select null & null;               | 
| null     | BO       | boolean  | null            | select null & true;               |
| null     | BO       | number   | error           | select null & 1;                  |
| null     | BO       | text     | error           | select null & 'A';                |
| boolean  | BO       | null     | error           | select true & null;               |
| boolean  | BO       | boolean  | error           | select true & true;               |
| boolean  | BO       | number   | error           | select true & 1;                  |
| boolean  | BO       | text     | error           | select true & 'A';                |
| number   | BO       | null     | null            | select 1 & null;                  |
| number   | BO       | boolean  | error           | select 1 & true;                  |
| number   | BO       | number   | number          | select 1 & 1;                     |
| number   | BO       | text     | error / number  | select 1 & 'A'; / select 1 & '1'; |
| text     | BO       | null     | error           | select 'A' & null;                |
| text     | BO       | boolean  | error           | select 'A' & true;                |
| text     | BO       | number   | error / number  | select 'A' & 1; / select '1' & 1; |
| text     | BO       | text     | error           | select 'A' & 'A';                 |
| -        | -        | -        | -               |                                   |

