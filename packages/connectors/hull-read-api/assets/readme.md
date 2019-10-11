# Hull Read API (Experimental)

This connector exposes a READ api for Hull that returns a payload similar to the Kraken notifications that are emitted in case of a change in the platform.

For now, it only returns the first result for a given set of claims. If you rely on Anonymous IDs or External IDs, it will work as expected, but Domains or Emails aren't unique, so we will return the first result we find.

Other APIs will follow that will return paginated results. Contact us in case you need this.

### Notable differences:

- `trait_` prefix is gone from all payloads
- The `Events` array will be empty (because it usually is made of the new events since the last update)
- The `Changes` object will be empty (because it usually is made of the changes since the last update)

### Caveats

This API is not yet production ready, and it is not made for high-volume queries. If you need higher volumes, we suggest you build a connector, or rely on the Exports API instead. Contact us for guidance.

# Fetching the first User found

### HTTP Call:
`POST /entity?token=YOUR_TOKEN_FROM_SETTINGS`

### Body:
```js
{
	"entityType": "user",
	"claims": {
		"email": "romain@hull.io"
	},
	"include": {
		"account": false, //Default: true
	}
}
```

### Response:

*Note*: account, account_segments, account_segment_ids will not be present if you passed `account: false` under `include`

```json
{
  "user": {
    "id": "572f63eb8c35fc5d4300034e",
    "domain": "hull.io",
    "external_id": "romain@hull.io",
    "anonymous_ids": [ "1479906786-4b31d32d-43de-41e3-9a4f-ec986ecdcebe", ... ],
    "email": "romain@hull.io",
    "first_name": "Romain",
    "last_name": "Dardour",
    "name": "Romain Dardour",
    "last_known_ip": "216.239.36.21",
    "last_seen_at": "2019-03-15T09:48:15Z",
    "country": "",
    "created_at": "2016-05-08T16:06:04Z",
    "first_seen_at": "2017-06-13T14:23:16Z",
    "first_session_id": "1497363796-31cdcadf-984d-41ba-910e-70441eebac31",
    "first_session_initial_referrer": "",
    "first_session_initial_url": "https://example.com",
    "first_session_platform_id": "561fb665450f34b1cf00000f",
    "first_session_started_at": "2017-06-13T14:23:16Z",
    "latest_session_id": "1506070466-db50f4e5-6679-4e52-8c73-906ca44df75c",
    "latest_session_initial_referrer": "https://example.com",
    "latest_session_initial_url": "https://example.com",
    "latest_session_platform_id": "5937d205fc9109971000002b",
    "latest_session_started_at": "2017-09-22T08:54:26Z",
    "foo": "bar",
    "signup_session_id": "1497363796-31cdcadf-984d-41ba-910e-70441eebac31",
    "signup_session_initial_referrer": "",
    "signup_session_initial_url": "https://example.com",
    "signup_session_platform_id": "561fb665450f34b1cf00000f",
    "signup_session_started_at": "2017-06-13T14:23:16Z",
    "datanyze": { ... },
    "intercom": { ... },
    "hubspot": { ... },
    "mailchimp": { ... },
    "clearbit": { ... },
    "salesforce_contact": { ... },
    "customerscore": { "combined": 145810, ... }
  },
  "segments": [
    {
      "id": "5798e61503577df344000559",
      "name": "Sync with Mailchimp",
      "type": "users_segment",
      "updated_at": "2019-08-31T01:53:57Z",
      "created_at": "2016-07-27T16:49:25Z"
    },
    ...
  ],
  "segment_ids": [ "5798e61503577df344000559", ... ],
  "account": {
    "id": "593x7dffc38d9c7gfd000001",
    "external_id": "123",
    "domain": "hull.io",
    "created_at": "2017-06-06T10:01:39Z",
    "updated_at": "2019-08-31T02:51:58Z",
    "name": "Hull",
    "clearbit": { ... },
    "anonymous_ids": [ "hubspot:236264269" ... ],
    "hubspot": { ... },
    "datanyze": { ... },
    "madkudu": { ... }
  },
  "account_segments": [
    {
      "id": "5a74b268f7c101f212000023",
      "name": "ICP Accounts",
      "type": "accounts_segment",
      "updated_at": "2019-08-31T01:57:28Z",
      "created_at": "2018-02-05T19:37:12Z"
    }
    ...
  ],
  "account_segment_ids": [ "5a74b268f7c101f212000023", .... ]
}
```


# Fetching the first Account found

### HTTP Call:
`POST /entity?token=YOUR_TOKEN_FROM_SETTINGS`

### Body:
```js
{
	"entityType": "account",
	"claims": {
		"domain": "hull.io"
	},
	"include": {
		"account": false, //Default: true
	}
}
```

### Response:

*Note*: account, account_segments, account_segment_ids will not be present if you passed `account: false` under `include`

```json
{
  "account": {
    "id": "593x7dffc38d9c7gfd000001",
    "external_id": "123",
    "domain": "hull.io",
    "created_at": "2017-06-06T10:01:39Z",
    "updated_at": "2019-08-31T02:51:58Z",
    "name": "Hull",
    "clearbit": { ... },
    "anonymous_ids": [ "hubspot:236264269" ... ],
    "hubspot": { ... },
    "datanyze": { ... },
    "madkudu": { ... }
  },
  "account_segments": [
    {
      "id": "5a74b268f7c101f212000023",
      "name": "ICP Accounts",
      "type": "accounts_segment",
      "updated_at": "2019-08-31T01:57:28Z",
      "created_at": "2018-02-05T19:37:12Z"
    }
    ...
  ],
  "account_segment_ids": [ "5a74b268f7c101f212000023", .... ]
}
```

## Errors.

If we don't find a result, we will return a HTTP 200 with the following content:

```
{
  "error": "Searching for a account with domain=hull.io returned no result"
}
```


# Fetching all matching Users / Accounts

Not yet supported. Contact us so we can learn more and provide solutions

# Including Events

Not yet supported. Contact us so we can learn more and provide solutions
