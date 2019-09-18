# CHANGELOG

## v0.2.3
- handle one more return

## v0.2.2
- make sure we alwas return a Promise from notification handler

## v0.2.1
- check if we have user_id available in the stripe event, if missing respond with 200 and log `incoming.event.warn`

## v0.2.0
- upgrade hull-node to 0.13.16
- add `/smart-notifier` endpoint
- change cache storage to hull-node default
- remove builder archetype and apply template
- use account when fetching events on webhooks

## v0.1.1
- updated Tab naming to `Credentials`, format: `small`
- Handle Accounts by default
- update dependencies
- serve CSS locally

## v0.1.0
- upgrade hull-node to beta
- adjusted `Hull.Connector` api
- fixed promises chains
- fixed events data variable
- added a `metadata_id_parameter` field to customize the user resolution. If the selected metadata param is set on particular customer, it will be used as a value of id which is chosen by `id_parameter` private setting
- changed all Stripe client initialization from `Stripe(clientSecret)` to `Stripe(accessToken)`, so the connector doesn't fetch data from outside the connected account scope
