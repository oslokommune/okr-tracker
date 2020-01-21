# List of events for Audit log

In addition to the data under 'What to log', the `user.id` and `timestamp` fields should be populated.

| Event name        | Trigger                         | What to log             |
| ----------------- | ------------------------------- | ----------------------- |
| `login`           | When the user signs in          |                         |
| `sign-out`        | When the user signs out         |                         |
| `dept-create`     | Creating a department           | `[department]`          |
| `dept-update`     | Updating department details     | `[department]`          |
| `dept-archive`    | Archiving a department          | `[department]`          |
| `dept-delete`     | Permanently delete a department | `[department]`          |
| `prod-create`     | Creating a product              | `[product]`             |
| `prod-update`     | Updating product details        | `[product]`             |
| `prod-archive`    | Archiving a product             | `[product]`             |
| `prod-delete`     | Permantently delete a product   | `[product]`             |
| `progress-create` | Creating a progress             | `[product, key_result]` |
| `progress-delete` | Deleting a progress             | `[product, key_result]` |
