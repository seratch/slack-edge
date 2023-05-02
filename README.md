## Slack Edge

[![npm version](https://badge.fury.io/js/slack-edge.svg)](https://badge.fury.io/js/slack-edge) 

The **slack-edge** library is a Slack app development framework designed specifically for the following runtimes:

* Cloudflare Workers
* Vercel Edge Functions

This framework draws significant inspiration from Slack's [Bolt framework](https://api.slack.com/tools/bolt), but its design does not strictly follow the [bolt-js](https://github.com/slackapi/bolt-js) blueprint.

Key differences include:

* _TypeScript focused_: Enhances type safety and clarifies typings for developers
* _Lazy listener enabled_: [bolt-python's lazy listener feature](https://slack.dev/bolt-python/concepts#lazy-listeners) is provided out of the box
* _Zero additional dependencies_: No other dependencies required beyond TypeScript types

More document pages will be published soon!