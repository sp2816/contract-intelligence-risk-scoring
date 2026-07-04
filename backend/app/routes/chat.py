import time
import json
from flask import Blueprint, request, Response, stream_with_context, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.chat import ChatSession, ChatMessage
from extensions import db
from services.chat_router import route_question

import sys
import os

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..")
    )
)

try:
    from ml.rag.contract_qa import answer_question as run_rag_pipeline
    HAS_RAG = True
    print("[OK] RAG Loaded")
except Exception as e:
    print("[FAIL] RAG FAILED")
    print(e)
    HAS_RAG = False

chat_bp = Blueprint('chat', __name__)

def get_mock_ai_response(user_query: str) -> str:
    query = user_query.lower()
    
    if 'nda' in query or 'disclosure' in query or 'confidential' in query:
        return """### **Mutual NDA Risk Analysis Report**

Based on standard enterprise legal benchmarks, here is an automated risk assessment for Mutual Non-Disclosure Agreements (NDAs):

#### **1. High-Risk Red Flags (Must Redline)**
*   **Unilateral Obligations**: Ensure that confidentiality rules bind **both** parties equally. A one-sided NDA is highly unfavorable.
*   **Definition of Confidential Information**: Watch out for rules requiring marked written tags (e.g., *"Must be marked as Confidential"*). Verbal disclosures should be covered if confirmed in writing within **30 days**.
*   **Survival Period**: Standard term is **2 to 5 years** from disclosure. Be cautious of *"perpetual"* survival terms, unless dealing with trade secrets.
*   **Intellectual Property Rights**: Beware of hidden clauses that imply licensing or assignment of patent/technology rights. NDAs should explicitly state **no licenses are granted**.

---

#### **2. Standard Permitted Exceptions**
A standard NDA must exclude information that:
1. Is or becomes publicly known through no breach of the receiving party.
2. Was already in the receiving party's possession before receipt.
3. Is independently developed without reference to the confidential info.
4. Is rightfully obtained from a third party without confidentiality breaches.

```markdown
[REDLINE SUGGESTION]
"No License. Nothing in this Agreement shall be construed to grant Receiving Party any license, title, or interest in Disclosing Party's Intellectual Property Rights, which shall remain solely with the Disclosing Party."
```
"""

    if 'liability' in query or 'cap' in query or 'limit' in query:
        return """### **Boilerplate Limitation of Liability (LoL) Drafting Guide**

In commercial agreements, the Limitation of Liability is the most critical risk-transfer mechanism. Here is a balanced, board-ready draft and analysis:

#### **1. Recommended Boilerplate Clause (Delaware Law)**

```javascript
/**
 * LIMITATION OF LIABILITY.
 * EXCEPT FOR (A) A PARTY'S BREACH OF CONFIDENTIALITY OBLIGATIONS (SECTION 8), 
 * (B) A PARTY'S INDEMNIFICATION OBLIGATIONS (SECTION 11), OR (C) GROSS 
 * NEGLIGENCE OR WILLFUL MISCONDUCT:
 * 
 * 1. NEITHER PARTY WILL BE LIABLE FOR ANY CONSEQUENTIAL, INDIRECT, SPECIAL, 
 *    PUNITIVE, OR INCIDENTAL DAMAGES ARISING OUT OF THIS AGREEMENT.
 * 2. EACH PARTY'S TOTAL AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL BE 
 *    LIMITED TO THE GREATER OF (X) FIFTY THOUSAND DOLLARS ($50,000) OR 
 *    (Y) THE FEES PAID BY CUSTOMER TO PROVIDER IN THE TWELVE (12) MONTHS 
 *    PRECEDING THE CLAIM.
 */
```

---

#### **2. Key Negotation Guidelines**
*   **Mutual vs Unilateral**: Always make LoL mutual unless provider risk is disproportionately higher.
*   **Carve-outs (Exceptions)**: Never allow a total liability limit to apply to:
    *   *Confidentiality breaches* (especially data breaches).
    *   *IP Indemnification* claims (if your code infringes, you must cover the defense).
    *   *Gross negligence / willful misconduct*.
*   **Super Caps**: For data protection, implement a "Super Cap" (e.g., *2x or 3x the annual contract value*) instead of an unlimited carve-out to keep liability predictable."""

    if 'force majeure' in query or 'pandemic' in query or 'disruption' in query:
        return """### **Force Majeure Boilerplate Clause & Analysis**

A modern Force Majeure clause must account for supply chain dependencies and pandemics. Below is a legally resilient template:

#### **1. Boilerplate Draft**
```markdown
"Force Majeure. Neither party shall be liable for delay or failure to perform its obligations (excluding payment obligations) due to events beyond its reasonable control, including acts of God, strikes, war, terrorism, government regulations, orders, embargoes, pandemics, epidemics, natural disasters, or labor strikes. 

The affected party shall:
(i) Promptly notify the other party in writing, stating the expected duration;
(ii) Exercise commercially reasonable efforts to mitigate the delay or failure. 

If a Force Majeure event continues uninterrupted for more than forty-five (45) consecutive days, either party may terminate this Agreement immediately upon written notice, without penalty."
```

---

#### **2. Essential Drafting Checklist**
*   **Exclusion of Payments**: Explicitly write that Force Majeure **does not excuse payment obligations** for services already delivered.
*   **Mitigation Duty**: The affected party must show they tried to avoid the issue (e.g. disaster recovery, alternative supplier search).
*   **Termination Threshold**: Allow termination if the blockage lasts too long (e.g., 30–60 days) to prevent either party from being trapped indefinitely.
*   **Pandemic Exclusions**: Explicitly add *"pandemics, epidemics, and government lock-downs"* to avoid courts claiming covid-style events were foreseeable."""

    if 'ip' in query or 'work-made-for-hire' in query or 'copyright' in query or 'assignment' in query:
        return """### **Intellectual Property Rights: Work-for-Hire vs Assignment**

Understanding how IP transfers between contractor and client is critical to avoiding litigation.

| Concept | Work-Made-For-Hire | Assignment of IP |
| :--- | :--- | :--- |
| **Legal Basis** | US Copyright Act § 101 | General Contract Law (Assignment) |
| **Ownership Timing** | Vest directly in the client from creation | Vests in contractor first, then transfers to client |
| **Scope Limitation** | Only applies to employees OR 9 specific works | Appliable to any intellectual creations |
| **Revocability** | Non-revocable by author | Subject to termination rights after 35 years |

---

#### **1. Best Practice Drafting Strategy**
Because "Work-for-Hire" has strict statutory definitions, relying on it alone for contractors is a high risk. Standard boilerplate must include **both** concepts in a "Belt and Suspenders" approach:

```markdown
"Ownership. Developer agrees that all deliverables created under this Agreement are 'work-made-for-hire' to the extent permitted by law. 
To the extent any deliverables do not qualify as work-made-for-hire, Developer hereby irrevocably and perpetually assigns and transfers to Client all right, title, and interest in such deliverables, including all copyrights, patents, and trade secrets."
```

---

#### **2. Audit Warning**
Check all developer contracts for *"Assigns in the future"* clauses (e.g., *"Developer agrees to assign..."*). This is an agreement to agree. Ensure the transfer uses **present assignment language**: **"Developer hereby assigns..."**"""

    return """### **AI Legal Assistant Workspace**

I am ready to assist you with contract analysis, drafting guidelines, risk limits, and regulatory compliance.

Here are some commands or inquiries you can run:
*   **"Analyze NDA risk limits"** (reviews confidentiality exclusions, terms, and red flags)
*   **"Limit of liability clause drafting"** (provides Delaware templates, Super Caps, and indemnification guidelines)
*   **"Boilerplate Force Majeure clause"** (evaluates supply chain delays and epidemics)
*   **"IP Rights work-for-hire comparison"** (reviews copyright assignments and present transfers)

> **Corporate Disclaimer**: *This chatbot provides AI-driven automated legal contract suggestions based on best practices. It does not constitute formal legal counsel. Please verify critical documents with corporate legal counsel.*"""


# ─── Chat Sessions APIs ──────────────────────────────────────────────────

@chat_bp.route('/sessions', methods=['GET'])
@jwt_required()
def list_sessions():
    """List all chat sessions for the current authenticated user"""
    user_id = get_jwt_identity()
    search_query = request.args.get('q', '').strip()
    
    query = ChatSession.query.filter_by(user_id=user_id)
    if search_query:
        # Escape SQL wildcard characters to prevent unintended matches
        escaped = search_query.replace('%', '\\%').replace('_', '\\_')
        query = query.filter(ChatSession.session_title.ilike(f"%{escaped}%", escape='\\'))
        
    sessions = query.order_by(ChatSession.created_at.desc()).all()
    return jsonify([s.to_dict() for s in sessions]), 200


@chat_bp.route('/sessions/<int:session_id>/messages', methods=['GET'])
@jwt_required()
def get_session_messages(session_id):
    """Retrieve all messages for a specific session"""
    user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({'message': 'Chat session not found'}), 404
        
    # Cap at 200 messages to prevent performance degradation on long conversations
    messages = ChatMessage.query.filter_by(session_id=session_id)\
        .order_by(ChatMessage.created_at.asc())\
        .limit(200)\
        .all()
    return jsonify([m.to_dict() for m in messages]), 200


@chat_bp.route('/sessions', methods=['POST'])
@jwt_required()
def create_session():
    """Create a new chat session"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    title = data.get('title', 'New Legal Session').strip()
    contract_id = data.get('contract_id')
    
    session = ChatSession(
        user_id=user_id,
        session_title=title
    )
    db.session.add(session)
    db.session.commit()
    return jsonify(session.to_dict()), 201


@chat_bp.route('/sessions/<int:session_id>', methods=['PUT'])
@jwt_required()
def rename_session(session_id):
    """Rename a chat session title"""
    user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({'message': 'Chat session not found'}), 404
        
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'message': 'Title cannot be empty'}), 400
        
    session.session_title = title
    db.session.commit()
    return jsonify(session.to_dict()), 200


@chat_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    """Delete a session and all its messages"""
    user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({'message': 'Chat session not found'}), 404
        
    db.session.delete(session)
    db.session.commit()
    return jsonify({'message': 'Chat session deleted successfully'}), 200


# ─── Chat Streaming Endpoint ─────────────────────────────────────────────

@chat_bp.route('/stream', methods=['POST'])
@jwt_required()
def chat_stream():
    """Stream response from mock AI and persist history to database"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    session_id = data.get('session_id')
    contract_id = data.get('contract_id')
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    if len(message) > 10000:
        return jsonify({'error': 'Message exceeds maximum length of 10,000 characters'}), 400

    # Retrieve or create session
    if session_id:
        session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
        if not session:
            return jsonify({'error': 'Chat session not found'}), 404
    else:
        title = message[:30] + ('...' if len(message) > 30 else '')
        session = ChatSession(user_id=user_id, session_title=title)
        db.session.add(session)
        db.session.commit()
        session_id = session.id

    # Persist User Message
    user_msg = ChatMessage(session_id=session_id, sender='user', message=message)
    db.session.add(user_msg)
    db.session.commit()

    def generate():
        response_text = None

        try:
            print("\n==========================")
            print("QUESTION:", message)
            routed = route_question(message)
            print("ROUTED TO:", routed["type"])

            if routed["type"] in [
                "database",
                "greeting",
                "goodbye",
                "thanks",
                "out_of_domain"
            ]:
                response_text = routed["answer"]

            else:

                print("Running RAG pipeline...")

                rag_results = run_rag_pipeline(message)

                response_text = rag_results["answer"]

        except Exception as e:
            import traceback

            traceback.print_exc()

            current_app.logger.exception(e)

            response_text = f"ERROR:\n{str(e)}"

        if not response_text:
            response_text = "Sorry, I couldn't generate a response."
        
        # Persist AI response BEFORE streaming so it's never lost
        # if the client disconnects mid-stream (BUG-004 fix)
        print("\nFINAL RESPONSE:")
        print(response_text)
        print("==========================\n")
        ai_msg = ChatMessage(session_id=session_id, sender='assistant', message=response_text)
        db.session.add(ai_msg)
        db.session.commit()
        
        # Split into chunks of 3 words to simulate streaming realistically
        chunk_size = 3
        words = response_text.split(' ')
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i+chunk_size])
            if i + chunk_size < len(words):
                chunk += ' '
            
            payload = json.dumps({'content': chunk, 'session_id': session_id})
            yield f"data: {payload}\n\n"
            time.sleep(0.05)
        
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream')
