# Contributing

- Non-trivial changes should be discussed in an issue first
- Develop in a topic branch, not master
- Squash your commits

## Commit Message Format

```
TYPE/CONTEXT: SHORT TITLE

DESCRIPTION IN SEVERAL
LINES IF NEEDED

FOOTER
```

| TYPE         | MEANING                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| **feature**  | new functionality                                                           |
| **refactor** | a change that restructures the code without modifying its external behavior |
| **fix**      | a change that fixes an identified/registered bug                            |
| **docs**     | a change that adds or updates docs                                          |
| **style**    | coding conventions etc                                                      |
| **test**     | test added or update                                                        |

|               |                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| `TITLE`       | Succinct description of the change. - imperative mood, e.g. change, NOT changed or changes - all lower case |
| `CONTEXT`     | (optional) Part of Huncwot affected by change (e.g. cli, server)                                            |
| `DESCRIPTION` | Motivation for the change using simple English phrases                                                      |
| `FOOTER`      | References issues in a ticketing system.                                                                    |

### Example

```
feature/checkout: add cart functionality

Add cart with checkout process. Integrate payment
gateway.

Closes #112 #123 #345 [4:00]
```
