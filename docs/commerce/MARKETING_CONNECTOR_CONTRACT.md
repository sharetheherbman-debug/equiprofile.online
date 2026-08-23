# Future Marketing Connector Contract

This repository does not implement or configure the Marketing connector. It defines only a future generic application contract for `equiprofile-store`.

| Object              | Permitted fields                                                                                                | Boundary                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Product publication | product identity, canonical public URL, approved title, approved price, offer, availability, licensed image URL | Exclude supplier confidential terms and unlicensed imagery.                                             |
| Academy plan        | plan identity, public URL, approved pricing and availability                                                    | Do not expose learner progress or education records.                                                    |
| Conversion          | consent state, server-generated event ID, order number, currency, trusted paid total                            | Send only after verified Store payment; no address, payment card, medical, veterinary, or welfare data. |
| Availability update | product identity, availability state, stock-freshness timestamp                                                 | Do not promise delivery dates without a supplier guarantee.                                             |

The later connector must consume only server-generated records, use idempotent event keys, honour consent, and reject browser-provided price or conversion data. `shop_order_paid` may be emitted only after verified payment reconciliation; checkout preparation is not a paid conversion.
