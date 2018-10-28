# KafkaTest

This is an end-to-end example of using Kafka to integrate with various APIs and streams.

The only thing missing as of writing is a working docker-compose.yml to tie it all together.

An outdated version of kafka-node is used due to a breaking change in `3.0.1`.

- The code sets up a single client which is used to construct a provider and two consumers.
- The provider, after verifying the existence of the `beer` topic, allows the consumers to init.
- The provider is then invoked in an (unthrottled) loop of `request`s to the public API: https://api.punkapi.com/v2/beers
- Nearly instantly (as far as stdin could tell me), consumer A will rave about having received a bunch of data.
- Consumer B will quietly stream this data into `/tmp/kafka.data`.

That's all there is to it!

## TLDR!

```
    make kafka
    npm i
    node producer.js
```