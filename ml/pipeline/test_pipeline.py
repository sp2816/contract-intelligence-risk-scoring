from pprint import pprint

from ml.pipeline.contract_analyzer import (
    analyze_contract
)

pdf_path = (
    r"ml/data/raw/CUAD_v1/full_contract_pdf/"
    r"Part_I/Affiliate_Agreements/"
    r"CybergyHoldingsInc_20140520_10-Q_EX-10.27_8605784_EX-10.27_Affiliate Agreement.pdf"
)

result = analyze_contract(
    pdf_path
)

pprint(result)