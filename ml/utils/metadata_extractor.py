import re

# Ignore common false-positive ORGs
IGNORE_ORGS = {
    "Party",
    "Party A",
    "Party B",
    "Company",
    "Consultant",
    "Agreement",
    "Services",
    "Confidential Information",
    "Board",
    "Works",
    "Term",
    "Witness",
    "Exhibit",
    "Schedule",
    "Article",
    "Section",
    "Notice",
    "Disclosure",
    "Confidentiality",
    "Severability",
    "LLC",
}

# Words that indicate a company
COMPANY_WORDS = (
    "INC",
    "INC.",
    "CORP",
    "CORP.",
    "CORPORATION",
    "LTD",
    "LTD.",
    "LIMITED",
    "LLC",
    "PLC",
    "GROUP",
    "HOLDINGS",
    "CAPITAL",
    "TECHNOLOGY",
    "TECHNOLOGIES",
    "THERAPEUTICS",
    "BIOPHARMA",
    "BIO",
    "HEALTH",
    "SYSTEMS",
)


def clean_company(name):

    name = re.sub(r"\s+", " ", name)
    name = name.strip()

    name = name.rstrip(",.;")

    return name


def extract_contract_metadata(entities, contract_text):

    text = contract_text.replace("\n", " ")

    companies = []
    dates = []

    # -----------------------------
    # NER extraction
    # -----------------------------

    for entity in entities:

        value = entity["text"].strip()
        label = entity["label"]

        if label == "ORG":

            upper = value.upper()

            if value in IGNORE_ORGS:
                continue

            if len(value) < 4:
                continue

            if any(char.isdigit() for char in value):
                continue

            if any(word in upper for word in COMPANY_WORDS):
                companies.append(clean_company(value))

        elif label == "DATE":

            if len(value) > 4:
                dates.append(value)

    # remove duplicates

    unique = []

    seen = set()

    for c in companies:

        key = c.lower()

        if key not in seen:

            unique.append(c)

            seen.add(key)

    companies = unique

    # ---------------------------------
    # Regex fallback for companies
    # ---------------------------------

    if len(companies) < 2:

        regex_companies = re.findall(

            r"\b[A-Z][A-Za-z&.,' ]{2,40}?(?:Inc\.?|Ltd\.?|Corp\.?|Corporation|LLC|Limited)\b",

            text

        )

        for company in regex_companies:

            company = clean_company(company)

            if company.lower() not in seen:

                companies.append(company)

                seen.add(company.lower())

    # ---------------------------------
    # Effective Date
    # ---------------------------------

    effective_date = dates[0] if dates else None

    if effective_date is None:

        m = re.search(

            r"effective(?:\s+date)?(?:\s+of|\s+as\s+of)?\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})",

            text,

            re.IGNORECASE,

        )

        if m:

            effective_date = m.group(1)

    # ---------------------------------
    # Governing Law
    # ---------------------------------

    governing_law = None

    patterns = [

        r"laws of the State of ([A-Za-z ]+)",

        r"laws of the Province of ([A-Za-z ]+)",

        r"laws of the Commonwealth of ([A-Za-z ]+)",

        r"laws of ([A-Za-z ]+)",

        r"State of ([A-Za-z ]+)",

        r"Province of ([A-Za-z ]+)",

    ]

    for pattern in patterns:

        m = re.search(pattern, text, re.IGNORECASE)

        if m:

            governing_law = m.group(1)

            governing_law = governing_law.split(",")[0]

            governing_law = governing_law.split(" and ")[0]

            governing_law = re.sub(r"\([^)]*\)", "", governing_law)

            governing_law = governing_law.strip()

            break

    return {

        "parties": companies[:2],

        "effective_date": effective_date,

        "governing_law": governing_law,

    }