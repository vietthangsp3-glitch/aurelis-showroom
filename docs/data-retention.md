# Customer data retention

This project stores lead and test-drive contact information. The production operator must choose retention periods that match the business purpose and applicable law.

Recommended baseline for this portfolio implementation:

- New/active leads: retain while sales follow-up is active.
- Lost or inactive leads: review for deletion after 12 months unless there is a documented business/legal reason to retain them longer.
- Test-drive bookings: retain operational booking data only as long as needed; minimize retained contact details after the purpose ends.
- Audit logs: do not copy phone numbers, email addresses, notes or other unnecessary lead PII into audit records.
- Authentication logs: store hashed network identifiers rather than raw IP addresses where practical.

Deletion requests should remove the lead and cascade related activities/bookings according to the Prisma relations. Before any automated purge is enabled, verify legal, accounting and CRM retention requirements.

Never put production customer data in seed files, screenshots, issue trackers or public logs.
