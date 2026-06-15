import json
from ml.contract_entities.contract_metadata import (
    get_contract_metadata
)

contract_name = (
    "CybergyHoldingsInc_20140520_10-Q_EX-10.27_8605784_EX-10.27_Affiliate Agreement.pdf"
)

metadata = get_contract_metadata(
    contract_name
)

print(metadata)

with open(
    "ml/contract_entities/sample_metadata.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        metadata,
        f,
        indent=4
    )