# Test data

## Setup

- Rename `customUsers-template.json` to `customUsers.json` and insert your own Google ID. Set `admin` to `true`.
- Optionally, add or modify the mock data by changing the json files. See below.

## File structure

The test data must adhere to the following structure:

```
📁 /mock
   📁 users
      📄 systemUsers.json                                   (required)
      📄 customUsers.json
   📁 orgs
      📁 /MyCustomOrganisation
         📄 data.json                                 (required)
         📁 objectives
         📁 departments
            📁 MyCustomDepartment
               📄 data.json                           (required)
               📁 objectives
               📁 products
                  📁 MyCustomProduct
                     📄 data.json                     (required)
                     📄 kpis.json
                     📁 objectives
                        📄 myPeriod.json
                        📄 myPeriod_myObjective.json
                        📄 myPeriod_myObjective_myKeyResult.json
                        📄 myPeriod_myObjective_mySecondKeyResult.json
                        📄 myPeriod_myOtherObjective.json
                        📄 myPeriod_myOtherObjective_myThirdKeyResult.json
```

Files in the `objectives` folder must adhere to the structure above, where periods, objectives and key results are linked through this naming convention.

## Data structures

### User data (customUsers.json)

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

### Organisation data (data.json)

```
{
  "name": "My Organisation Name",
  "missionStatement": "My mission statement" // Markdown is supported
}
```

### Department data (data.json)

```
{
  "name": "My Department Name",
  "missionStatement": "My mission statement" // Markdown is supported
}
```

### Product data (data.json)

```
{
  "name": "My Product Name",
  "missionStatement": "My mission statement" // Markdown is supported,
  team: [0,1]
}

The `team` array must contain indecies for objects in the `customUsers.json` file. E.g. `[0, 1]` adds the first two custom users to the product team.
```

### Period data (myPeriod.json)

- Use camelCase in file name.
- Replace ‘myPeriod’ with whatever name you'd like. It doesn’t matter, but make sure to reuse this name for the period’s objectives and key results.

```
{
  "name": "Q1 2020",
  "startDate": "2020-01-01",
  "endDate": "2020-03-31"
}
```

### Objective data (myPeriod_myObjective.json)

- Use camelCase in file name.
- Replace ‘myPeriod’ with the period you want the objective to be nested in.
- Replace ‘myObjective’ with whatever name you'd like. It doesn’t matter, but make sure to reuse this name for the objective’s key results.

```
{
  "name": "Objective Name",
  "icon": "trophy", // icon name (Font Awesome)
  "description": "This is a description of the objective"
}
```

### Key result data (myPeriod_myObjective_myKeyResult.json)

- Use camelCase in file name.
- Replace ‘myPeriod’ with the period the key result belongs to.
- Replace ‘myObjective’ with the objective the key result belongs to.
  Replace ‘myKeyResult’ with whatever name you'd like.

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

### KPI data (kpis.json)

```
{
  "kpi/users": {
    "description": "MyDescription",
    "sheet": {
      "id": "mySheetId",
      "name": "Sheet1",
      "cell": "A1"
    },
    "progress": [
      { "created": "2020-07-15", "value": 535 },
      { "created": "2020-07-14", "value": 521 },
      // ...
    ]
  },
  "kpi/user-satisfaction": { /* same as above */ },
  "kpi/conversion-rate": { /* same as above */ }
}
```
