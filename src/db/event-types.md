# List of events for Audit log

In addition to the data under 'What to log', the `user.id` and `timestamp` fields should be populated. The _Audit_ and _Newsfeed_ columns indicate whether the functionality has been implemented or not.

**Note:** Please keep this list updated.

| Event name               | Trigger                           | What to log                       | Audit | Newsfeed |
| :----------------------- | :-------------------------------- | :-------------------------------- | :---: | :------: |
| `login`                  | A user signs in                   |                                   |   ✓   |          |
| `sign-out`               | A user signs out                  |                                   |   ✓   |          |
| `promoted-admin`         | A user is promoted to admin       | `[affectedUser]`                  |   ✓   |    ✓     |
| `demoted-admin`          | A user is demoted from admin      | `[affectedUser]`                  |   ✓   |    ✓     |
| `addUsers`               | A list of users is added          | `[usersList]`                     |   ✓   |    ✓     |
| `deleted-user`           | A user is deleted from the system | `[affectedUser]`                  |   ✓   |    ✓     |
| `create-objective`       | An objective is created           | `[objective, product]`            |   ✓   |    ✓     |
| `update-objective`       | An objective is updated           | `[objective, product]`            |   ✓   |    ✓     |
| `archive-objective`      | An objective is archived          | `[objective, product]`            |   ✓   |    ✓     |
| `delete-objective`       | An objective is deleted           | `[objective, product]`            |       |          |
| `create-product`         | A product is created              | `[product, department]`           |   ✓   |    ✓     |
| `update-product`         | A product is updated              | `[product, department]`           |   ✓   |    ✓     |
| `archive-product`        | A product is archived             | `[product, department]`           |   ✓   |    ✓     |
| `delete-product`         | A product is deleted              | `[product, department]`           |       |          |
| `create-department`      | A department is created           | `[department]`                    |       |          |
| `update-department`      | A department is updated           | `[department]`                    |   ✓   |    ✓     |
| `archive-department`     | A department is archived          | `[department]`                    |       |          |
| `delete-department`      | A department is deleted           | `[department]`                    |       |          |
| `create-key-result`      | A key result is created           | `[keyResult, product, objective]` |   ✓   |    ✓     |
| `update-key-result`      | A key result is updated           | `[keyResult, product, objective]` |   ✓   |    ✓     |
| `archive-key-result`     | A key result is archived          | `[keyResult, product, objective]` |   ✓   |    ✓     |
| `delete-key-result`      | A key result is deleted           | `[keyResult, product, objective]` |       |          |
| `update-product-image`   | A product image is uploaded       | `[product]`                       |   ✓   |    ✓     |
| `update-profile-image`   | A user image is uploaded          |                                   |   ✓   |    ✓     |
| `keyRes-update-progress` | Progress changes for a key result | `[keyResult, product, objective]` |   ✓   |    ✓     |
| `create-progress`        | A progress is recorded            | `[keyResult, product, objective]` |       |          |
| `delete-progress`        | A progress is deleted             | `[keyResult, product, objective]` |       |          |
