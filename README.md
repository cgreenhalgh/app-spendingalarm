# Spending Alarm

Chris Greenhalgh, The University of Nottingham, 2019

A Databox driver based on a mental health early warning signs
application, which monitors bank transactions (from the TrueLayer
driver), applies a configurable check, and reports an alarm
to a remote monitoring service (provisionally based on 
[RADAR-BASE](https://radar-base.org/).

Status: broken and just starting...

- imported quickstart node driver example
- changed driver name
- changed Dockerfile-dev to just sleep as i'm running it within my regular databox, not a specific test instance (then need to docker exec ... and docker cp ...)
- changed node-databox version to latest 0.10.6
- seems the API has changed since 0.9.x so need to update main.js...
(e.g. see [TrueLayer driver](https://github.com/me-box/driver-truelayer/blob/master/src/main.js)
and updated [lib-node-databox docs](https://github.com/me-box/lib-node-databox)
- updated to api 0.10.6
- found bugs in lib-node-databox 0.10.6
- trying to fix in cgreenhalgh/lib-node-databox - clone it here... 
(see workaround in Dockerfile-dev)

