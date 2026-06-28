from pprint import pprint

from ml.pipeline.contract_analyzer import (
    analyze_contract
)

from ml.risk_scoring.risk_summary import (
    generate_summary
)

pdf_path = r"D:\INTERNSHIP_ZAALIMA\contract-intelligence-risk-scoring\ml\data\raw\CUAD_v1\full_contract_pdf\Part_I\Co_Branding\2ThemartComInc_19990826_10-12G_EX-10.10_6700288_EX-10.10_Co-Branding Agreement_ Agency Agreement.pdf"

result = analyze_contract(
    pdf_path
)

summary = generate_summary(

    result["risk_score"],

    result["risk_level"],

    result["risk_reasons"]
)

print()

print(summary)