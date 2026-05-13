# 🤝 Bounty Program Negotiation & Triage Tips

Effective communication with vendor security teams ensures rapid issue resolution, fair bounty compensation, and mutual technical respect.

## 1. Establishing Contextual Impact
Always bridge the gap between technical exploits and business risk. Demonstrating an IDOR on `/api/user` is valuable, but demonstrating how that endpoint data leak maps directly to internal customer records accelerates triage severity scaling.

## 2. Providing PoC Cleanliness
Ensure reproduction scripts are straightforward:
- Attach streamlined `curl` reproduction one-liners.
- Remove redundant headers from trace snippets.
- Highlight custom User-Agents confirming authorized scope testing.

## 3. Collaborative Professionalism
If scope coverage remains ambiguous during triage interactions, reference the platform's automated scope compliance validation matrices to show good-faith adherence to general programmatic guidelines.
