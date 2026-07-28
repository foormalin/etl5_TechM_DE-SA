# Inventory

Склады, предложения, цены в minor units, физический/зарезервированный остаток.
Резерв выполняется атомарным conditional update и защищает инвариант
`physical_quantity >= reserved_quantity >= 0`.
