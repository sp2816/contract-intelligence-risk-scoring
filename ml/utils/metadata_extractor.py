# ml/utils/metadata_extractor.py

import re


IGNORE_ORGS = {

    "Party",
    "Party A",
    "Party B",
    "Company",
    "Consultant",
    "Services",
    "Agreement",
    "Confidential Information",
    "Milestone",
    "Target Date",
    "FTE",

    "Development Agreement",

    "LIMITED AUTHORITY AS AGENT 14.1",
    "RELATIONSHIP 12.1",
    "NOTICES",
    "FURTHER",
    "CONFIDENTIALITY",
    "DISCLOSURE",
    "SEVERABILITY",

    "Board",
    "Works",
    "Term"
}


COMPANY_KEYWORDS = (

    "INC",
    "INC.",
    "CORP",
    "CORP.",
    "CORPORATION",
    "LTD",
    "LTD.",
    "LLC",
    "LIMITED",
    "COMPANY",
    "CAPITAL",
    "HOLDINGS",
    "GROUP",
    "TECHNOLOGY",
    "INDUSTRIES"
)


def extract_contract_metadata(
    entities,
    contract_text
):

    orgs = []
    dates = []
    locations = []

    for entity in entities:

        text = entity["text"].strip()
        label = entity["label"]

        # -------------------------
        # ORGS / PARTIES
        # -------------------------

        if label == "ORG":

            if text in IGNORE_ORGS:
                continue

            if len(text) < 8:
                continue

            # remove junk headings
            if any(char.isdigit() for char in text):
                continue

            if text.upper() in {
                "LLC",
                "INC",
                "CORP",
                "LTD"
            }:
                continue

            if any(
                keyword in text.upper()
                for keyword in COMPANY_KEYWORDS
            ):
                orgs.append(text)

        # -------------------------
        # DATES
        # -------------------------

        elif label == "DATE":

            dates.append(text)

        # -------------------------
        # LOCATIONS
        # -------------------------

        elif label == "GPE":

            locations.append(text)

    # -----------------------------------
    # Remove duplicates
    # -----------------------------------

    orgs = list(dict.fromkeys(orgs))
    dates = list(dict.fromkeys(dates))
    locations = list(dict.fromkeys(locations))

    # -----------------------------------
    # Effective Date
    # -----------------------------------

    effective_date = dates[0] if dates else None

    # -----------------------------------
    # Governing Law
    # -----------------------------------

    governing_law = None

    text = contract_text.replace("\n", " ")

    # State of California
    state_match = re.search(
        r"State of\s+([A-Z][a-zA-Z\s]+)",
        text
    )

    if state_match:

        governing_law = (
            state_match.group(1)
            .split(" and ")[0]
            .split(",")[0]
            .strip()
        )

    # Province of British Columbia
    if not governing_law:

        province_match = re.search(
            r"Province of\s+([A-Z][a-zA-Z\s]+)",
            text
        )

        if province_match:

            governing_law = (
                province_match.group(1)
                .split(" and ")[0]
                .split(",")[0]
                .strip()
            )

    # Fallback
    if not governing_law and locations:

        governing_law = locations[0]

    # -----------------------------------
    # Return
    # -----------------------------------

    return {

        "parties": orgs[:2],

        "effective_date": effective_date,

        "governing_law": governing_law
    }