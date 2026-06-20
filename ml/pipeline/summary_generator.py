def generate_summary(result):

    return f"""
Contract Analysis Summary

Characters:
{result['characters']}

Entities Found:
{result['entity_count']}

Primary Clause:
{result['clause_prediction']['prediction']}

Confidence:
{round(result['clause_prediction']['confidence'] * 100, 2)}%
"""