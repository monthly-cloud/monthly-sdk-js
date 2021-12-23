# Monthly Cloud JS SDK

## Installation

```
npm install monthly-sdk-js
```

## Usage

```
const storage = require('monthly-sdk-js').storage();
```

Get locale (dictionary):
```
storage.website(1).findLocale('en').then(dictionary => {});
```

Get website routes:
```
storage.website(1).getRoutes(3).then(routes => {});
```

Get menus:
```
storage.website(1).getMenus('en').then(menus => {});
```

Find website content:
```
storage.website(1).findContent(3).then(content => {});
```

Find listing:
```
storage.website(1).list(2).findListing(3).then(listing => {});
storage.website(1).list(2).findListing('lang/slug/slug').then(listing => {});

```

Check [test.js](https://github.com/monthly-cloud/monthly-sdk-js/blob/master/test.js) for more use cases.
