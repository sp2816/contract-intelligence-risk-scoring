from ml.risk_scoring.risk_analyzer import (

    calculate_risk_score,

    risk_level
)

sample_predictions = [

    {
        "prediction":
        "Change Of Control"
    },

    {
        "prediction":
        "Termination For Convenience"
    },

    {
        "prediction":
        "License Grant"
    }
]

score = calculate_risk_score(
    sample_predictions
)

print(
    "Risk Score:",
    score
)

print(
    "Risk Level:",
    risk_level(score)
)