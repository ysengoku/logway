# Database

How the app uses SQLite in the browser, from the UI down to storage.

```mermaid
flowchart TD
    subgraph Main["Main thread"]
        UI["UI (Vue)"] --> Store["Stores<br/>stores/"]
        Store --> Repository["Repositories<br/>repositories/"]
        Repository -- "db.query() / db.exec()" --> Client["Client<br/>db/client.ts"]
    end

    subgraph WorkerThread["Web Worker"]
        Worker["Worker<br/>db/worker.ts"] --> Executor["Executor<br/>db/executor.ts"]
        Executor --> SQLite[("SQLite<br/>WebAssembly + OPFS")]
    end

    Client -- "postMessage" --> Worker
```

## Layers

| Layer | File | Responsibility |
|---|---|---|
| Stores | `stores/` | Hold UI state and call repositories |
| Repositories | `repositories/` | Validate input and run reads and writes |
| Client | `db/client.ts` | Implement `Db` by sending requests to the worker and returning promises |
| Worker | `db/worker.ts` | Open SQLite, pass requests to the executor, and send responses |
| Executor | `db/executor.ts` | Call the SQLite API. `exec` runs in a transaction |

SQL statements are written in repositories and migrations. The other layers pass them along or run them.

## Web Worker

- The synchronous access handles that OPFS needs for fast writes are only available in workers.
- SQLite work doesn't block the UI.
- The `opfs-sahpool` VFS doesn't need COOP/COEP headers, but only one tab can open it at a time. `db/tabLock.ts` limits the app to one tab.

## Requests and responses

Each request has an `id`, so a response can be matched to its request regardless of order.

```mermaid
sequenceDiagram
    participant R as Repository
    participant C as Client
    participant W as Worker
    participant E as Executor
    participant S as SQLite

    R->>C: db.query(sql, bind)
    C->>C: Store id and promise
    C->>W: postMessage({ id, kind: 'query', sql, bind })
    W->>E: executor.query(sql, bind)
    E->>S: Run SELECT
    S-->>E: Rows
    E-->>W: Array of rows
    W-->>C: postMessage({ id, ok: true, result })
    C->>C: Find promise by id and resolve it
    C-->>R: Array of rows
```

On failure, the worker sends `{ id, ok: false, error }` and the client rejects the promise.

## Startup and migrations

`getDb()` starts the worker and runs migrations once, then returns the same promise on later calls.

1. `db/client.ts` starts the worker.
2. `migrate(db)` reads `schema_version` from the `meta` table.
3. Newer files in `db/migrations/NNN_*.sql` run in version order.
4. Each migration and its version update run in the same transaction.

## Tables

`events` holds the fields shared by every event type, and detail tables hold the type-specific fields. Reads go through the `event_details` view, which joins them.

```mermaid
erDiagram
    trips ||--o{ events : "trip_id"
    events ||--o| transport_events : "event_id"
    events ||--o| hotel_events : "event_id"
    events ||--o| place_events : "event_id"
    events ||--o| link_events : "event_id"

    trips {
        TEXT id PK
        TEXT title
        TEXT start_date
        TEXT end_date
        TEXT share_file_id
        TEXT created_at
        TEXT updated_at
    }
    events {
        TEXT id PK
        TEXT trip_id FK
        TEXT type
        TEXT start_date
        TEXT start_time
        TEXT end_date
        TEXT note
        TEXT created_at
        TEXT updated_at
    }
    transport_events {
        TEXT event_id PK
        TEXT mode
        TEXT service_number
        TEXT booking_ref
        TEXT dep_place
        TEXT dep_tz_id
        TEXT arr_date
        TEXT arr_time
        TEXT arr_place
        TEXT arr_tz_id
    }
    hotel_events {
        TEXT event_id PK
        TEXT name
        TEXT booking_ref
        TEXT address
        TEXT check_out_time
        TEXT url
    }
    place_events {
        TEXT event_id PK
        TEXT name
        TEXT address
        TEXT url
    }
    link_events {
        TEXT event_id PK
        TEXT title
        TEXT url
    }
```

| `events.type` | Detail table | Rules |
|---|---|---|
| `flight` | `transport_events` | `mode` is `flight`; number and time required |
| `transport` | `transport_events` | Mode and time required |
| `hotel` | `hotel_events` | `end_date` is the check-out date and must be after `start_date` |
| `restaurant` | `place_events` | Time required |
| `activity` | `place_events` | Time optional |
| `link` | `link_events` | Title and URL required |

`events.end_date` is the last day an event appears on the calendar. For hotels it is the check-out date. For flights and transport it is the later of `start_date` and `transport_events.arr_date`, so overnight trips also appear on the arrival day. For other types it equals `start_date`.

The `meta` table stores information about the database itself, such as `schema_version`. `db/migrate.ts` creates it.

## Writes

All statements passed to one `db.exec()` call run in a single transaction. Saving an event passes `events` and its detail table to the same call, so one can't be saved without the other.

| Operation | SQL |
|---|---|
| Create | INSERT into `events`, INSERT OR REPLACE into the detail table |
| Update | UPDATE `events`, INSERT OR REPLACE into the detail table |
| Delete | DELETE from `events`; `ON DELETE CASCADE` removes the detail row |

`INSERT OR REPLACE` deletes the existing row before inserting. Don't use it on `trips` or `events`, because it can also delete their child rows.

Foreign keys must be enabled per connection, so `db/executor.ts` runs `PRAGMA foreign_keys = ON`.

## Tests

Tests skip the worker and OPFS. `__tests__/unit/helpers/memoryDb.ts` passes an in-memory SQLite database to the executor. Repositories still see a `Db`, so the same code runs in both cases.

```mermaid
flowchart LR
    Test["Test"] --> Repository["Repository"]
    Repository --> Memory["memoryDb.ts"]
    Memory --> Executor["Executor"]
    Executor --> SQLite[("SQLite<br/>in memory")]
```
