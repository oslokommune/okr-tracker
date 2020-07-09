# Test data

## File structure

The test data must adhere to the following structure:

```
📁 /mock
   📁 users
      📄 users.json
   📁 orgs
      📁 /MyCustomOrganisation
         📄 data.json
         📁 objectives
         📁 departments
            📁 MyCustomDepartment
               📄 data.json
               📁 objectives
               📁 products
                  📁 MyCustomProduct
                     📄 data.json
                     📁 objectives
```

Files in the `objectives` folder must adhere to the following structure:

```
📁 objectives
   📄 myPeriod.json
   📄 myPeriod_myObjective.json
   📄 myPeriod_myObjective_myKeyResult.json
   📄 myPeriod_myObjective_mySecondKeyResult.json
   📄 myPeriod_myOtherObjective.json
   📄 myPeriod_myOtherObjective_myThirdKeyResult.json
```

## users.json

```
[
  {
    "id": "email@example.com",
    "displayName": "My Display Name", // optional
    "admin": false
  },
  // ...
]
```

## Organisation data

```
{
  "name": "My Organisation Name",
  "missionStatement": "My mission statement" // Markdown is supported
}
```

## Department data

```
{
  "name": "My Department Name",
  "missionStatement": "My mission statement" // Markdown is supported
}
```

## Product data

```
{
  "name": "My Product Name",
  "missionStatement": "My mission statement" // Markdown is supported,

  // TODO: Teams
}
```

## Period data

```
{
  "name": "Q1 2020",
  "startDate": "2020-01-01",
  "endDate": "2020-03-31"
}
```

## Objective data

```
{
  "name": "Objective Name",
  "icon": "trophy", // icon name (Font Awesome)
  "description": "This is a description of the objective"
}
```

## Key result data

```
{
  "auto": false, // must be false
  "description": "My description",
  "longDescription": "My long description",
  "unit": "My unit",
  "startValue": 0,
  "targetValue": 100,
  "progress": [
    {
      "value": 25,
      "timestamp": "2020-01-03"
      "comment": "This is an optional comment",
    },
    {
      "value": 88,
      "timestamp": "2020-07-01"
    },
    // ...
  ]
}
```
