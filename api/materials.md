# Public materials

`GET /api/v1/public/materials` returns the backend's material catalogue without
authentication. Use it to populate labels, categories and KES prices in clients.
There is no standalone material CRUD, photo-identification or price-quote API.

```sh
curl --fail-with-body https://wastefi-backend.onrender.com/api/v1/public/materials
```

The response is HTTP 200 with `Cache-Control: public, max-age=300`:

```json
{
  "success": true,
  "data": {
    "currency": "KES",
    "materials": [
      {
        "materialType": "PET",
        "category": "Plastic",
        "description": "PET bottles (water, soda)",
        "pricePerKg": 25
      }
    ]
  }
}
```

This shows one material from the current source table; the actual response
includes the whole catalogue. Fetch it rather than copying these values into a
client. The endpoint accepts no search, category, pagination or sorting filters.

| Field | Use |
| --- | --- |
| `materialType` | Code submitted with a collection, such as `PET` or `GLASS_CLEAR` |
| `category` | Submit as `materialCategory`; used to map to an on-chain material category |
| `description` | Human-readable label, such as Clear glass bottles |
| `pricePerKg` | KES price per kilogram before the collection pricing helper's weight-based adjustment |

The collection pricing helper calculates the KES estimate. Its current bulk
adjustment adds 5% for 50 to under 100 kg, or 10% for 100 kg and above. That KES
estimate is separate from the `material_pricing` contract's WASTE price. Neither
is a guaranteed cash-out or exchange rate.

For submissions, see [collections](/api/transactions). For token amounts and
material enums, see [smart contracts](/technical/smart-contracts#units-categories-and-states).

Source: [public router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/public.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/public.controller.ts)
and [pricing helper](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/utils/material-pricing.util.ts).
