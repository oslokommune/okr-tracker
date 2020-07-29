# Database objects

## API

Organisations, Departments, Products, Periods, Objectives and Key results are classes that share some CRUD operations like archiving and restoring. All operations are saved in the audit log. Note that slugs are generated and updated automatically.

### Create

```js
import Product from '@/db/Product';

const myProduct = Product.create({
  name: 'My product name',
  description: 'My mission statement',
  organization: ParentOrganizationReference,
  department: ParentDepartmentReference,
}).then(() => {
  console.log('Successfully created');
});
```

### Update

```js
import Product from '@/db/Product';

const myProduct = new Product(id)
  .update({
    name: 'My new name',
  })
  .then(() => {
    console.log('Successfully updated');
  });
```

### Archive

```js
import Product from '@/db/Product';

const myProduct = new Product(id).archive().then(() => {
  console.log('Successfully archived');
});
```

### Restore

```js
import Product from '@/db/Product';

const myProduct = new Product(id).restore().then(() => {
  console.log('Successfully restored');
});
```

### Delete

```js
import Product from '@/db/Product';

try {
  const myProduct = new Product(id).delete().then(() => {
    console.log('Successfully deleted');
  });
} catch (err) {
  console.error(err);
}
```
