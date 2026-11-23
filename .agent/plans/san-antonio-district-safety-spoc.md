# San Antonio District Safety SPOC

## Build scope
- Build one mobile-responsive Power Apps web application for facility safety audits, authorized audit history, the SPOC directory, reference documents, and role-gated administration.
- Use the existing Microsoft Dataverse connection as the preferred relational backend; preserve a SharePoint-compatible logical design as the documented fallback.
- Treat Blocks 1–15 as authoritative and label every unresolved policy point exactly **Needs TxDOT Confirmation**.
- Use a high-contrast TxDOT-appropriate blue/white visual system, large touch targets, clear required indicators, and phone/tablet layouts.

## Roles and access
- Safety SPOC: create, save, complete, validate, and submit audits; add comments, evidence, and corrective actions; view authorized history; edit only permitted contact information.
- Supervisor / Designated Recipient: review authorized submitted audits and deficiencies for applicable work groups.
- Safety Office Administrator: maintain inspection configuration, organizational reference data, SPOCs, documents, and authorized oversight information.
- Read-Only Stakeholder: view authorized submitted records without modification.
- Use the signed-in Power Apps user for personalization and identity snapshots.

## Data entities
- Audit
- AuditSection
- AssetInspection
- InspectionResponse
- Evidence
- Comment
- CorrectiveAction
- SPOC
- WorkGroup
- WorkLocation
- InspectionType
- Question
- ChoiceSet
- ReferenceDocument

## Data behavior
- Preserve relational links from audits through sections, assets, responses, comments, evidence, and corrective actions.
- Snapshot inspector and contact identity on submitted audits so later directory changes do not rewrite history.
- Store reference-document metadata and authoritative SharePoint references rather than PDF binaries in ordinary records.
- Support evidence metadata and file/photo associations; use Dataverse file/image columns or SharePoint document storage with record links according to environment capability.
- Keep submitted responses immutable in normal editing by default while clearly marking later edit rights as **Needs TxDOT Confirmation**.
- Seed configuration for all specified Fire Extinguisher, Portable Ladder, HAZMAT, Office / Administration, Laboratory, and AED questions, response types, choices, required flags, ordering, and repeatability.

## Navigation and screens
- Persistent left navigation for Home, New Safety Audit, My Draft Audits, Audit History, SPOC Directory, Reference Documents, and role-gated Administration.
- Home: responsive action cards for each authorized destination.
- Site Information: required visit, inspector, work-group, supervisor-email, recipient, safety specialist, and address/location experience with Back and guarded Continue.
- Select Sections: six cards with explicit Applicable or Not Applicable states.
- Audit Sections: section status, unanswered-required count, potential deficiencies, and corrective-action count.
- Repeatable Assets: add/edit/review/remove draft cards for extinguishers, ladders, and AEDs without fixed empty copies.
- Question Form: configuration-driven controls, help text, required state, comments, evidence, and corrective-action entry.
- Corrective Action: triggering context and confirmed description, with unresolved workflow fields visibly marked **Needs TxDOT Confirmation**.
- Review: site summary, completion, missing requirements, potential deficiencies, comments, evidence count, corrective actions, validation errors, and navigation to affected items.
- Submit: full validation, blocked invalid submissions, successful submission state, AuditID, SubmittedDate, Return Home, and View Submitted Audit.
- My Draft Audits: resumable drafts with policy caveats marked **Needs TxDOT Confirmation**.
- Audit History: authorized search/filter by date, inspector, work group, work location, section, status, and deficiency presence.
- SPOC Directory: search/filter by name, work group, work location, and active status; self-edit scope marked **Needs TxDOT Confirmation**.
- Reference Documents: categorized links to authoritative SharePoint documents.
- Administration: maintain inspection types, questions, choice sets, required flags, ordering, work groups, locations, SPOCs, documents, and active states without changing historical submissions.

## Audit workflow and rules
- Implement the six-step flow: Site Information, Select Sections, Complete Sections, Issues / Corrective Actions, Review, Submit.
- Support Save Draft throughout editable audit steps and persist navigation state.
- A Not Applicable section hides/collapses its questions and is excluded from required validation.
- Never convert blank required responses to Not Applicable.
- Show section states: Not Started, In Progress, Complete, Not Applicable, Deficiency Present.
- Render Yes/No/Not Applicable, Yes/No, single choice, multi-select, text, multiline text, date, and number controls from configuration.
- Validate active required questions, repeatable-asset identities/responses, and configured required corrective-action fields.
- Show all submission errors together with direct navigation to affected sections/items.
- Visibly flag No responses as potential deficiencies without automatically creating corrective actions.

## Repeatable inspections
- Fire Extinguisher: asset cards show number, serial number, location, completion, and deficiency count; support FIRE-001 through FIRE-013.
- Portable Ladder: asset cards and configured controls support LAD-001 through LAD-015 and specified choice sets.
- AED: asset cards show unit, serial, location, completion, and deficiency state; support AED-001 through AED-011 with a calendar date control for battery expiration.

## Comments, evidence, and corrective actions
- Keep question-level comments distinct from section/asset “Other Notes / Comments” responses.
- Relate evidence to inspection responses and corrective actions where appropriate.
- Relate each corrective action to its audit, section, optional asset, and triggering response.
- Require only corrective-action fields explicitly configured as required.

## Confirmed non-inventions
- Do not define assignee requirements, due dates, status values, escalation, closure verification, notifications, submitted-record edit rights, retention, SPOC self-edit fields, draft ownership/expiration/cleanup/admin access, or future Form 1993/2194/1301 modules.
- Surface each unresolved item in relevant UI/admin guidance as **Needs TxDOT Confirmation** without blocking confirmed functionality.

## Delivery and verification
- Build in the user-specified order from schema through Administration.
- Verify responsive behavior, role-based visibility, dynamic question rendering, draft persistence, repeatable assets, validation, submission locking, filters, and all interactive controls.
- Run project validation and SDK-usage validation for Dataverse integration.
- Final report will list created entities and screens, working and unimplemented functionality, technical limitations and recommended Power Platform patterns, and every remaining **Needs TxDOT Confirmation** item.
