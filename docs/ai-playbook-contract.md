# AI playbook contract (`pitchprox.premium-playbook/1`)

For the AI developer building the live-call assistant. This is the playbook data the AI loads and how to get it. The structure follows Spec 12 §5. The AI receives only methodology: Spec 12 §6.1 and §11 say that commercial and internal data must never steer live strategy, so that data is left out.

## Getting the playbook

| Endpoint | Who | What |
|---|---|---|
| `GET /api/v1/me/playbook-runtime` | Signed-in customer or sales rep | The user's **active** playbook, at the version currently in force |
| `GET /api/v1/admin/playbooks/{playbookId}/export?version=N` | Super Admin (Playbook section) | Downloads one published version as `{playbookId}-vN-ai.json`. Leave out `version` to get the version in force. |

The Super Admin can also download the export from **Playbook → Version History → For AI developer**.

### `GET /api/v1/me/playbook-runtime`

```json
{
  "playbookId": "closing-with-confidence",
  "title": "Closing with Confidence",
  "kind": "premium",
  "version": 3,
  "playbook": { "contract": "pitchprox.premium-playbook/1", "...": "see below" }
}
```

- `playbook` is `null` for playbooks that were never published from the Super Admin builder: the seeded standard playbook and custom playbooks. For these, the AI uses its built-in methodology.
- A publish or rollback changes the version in force. Re-fetch at the start of each call, and don't cache the playbook across calls.

## The `playbook` object

| Key | Contents |
|---|---|
| `contract` | Always `"pitchprox.premium-playbook/1"`. If the shape changes incompatibly, this value changes too. |
| `identity` | `playbook_id`, `name`, `author`, `category`, `industry`, `experience_level`, `style`, `best_for_lead_types[]`, `focus_areas[]`, `key_outcomes[]`, `version` |
| `methodology` | `core_coaching_philosophy`, `selling_principles[]`, `strategic_framing`, `trust_style`, `discovery_style`, `objection_tone`, `closing_style`, `follow_up_style` |
| `voice_language` | `tones[]`, communication, sentence and formality settings, `unique_phrases[]`, `language_preferences[]`, `words_to_avoid[]`, `prompt_voice`, `language_rules`, `voice_guide_audio` |
| `conversation_flow[]` | Ordered stages (`order`, `title`, `description`, `goal`, …). These are **advisory**, not a fixed script (§6.3). |
| `objection_library[]` | `phrase`, `root_category`, `subtype`, `stage_relevance[]`, `lead_types[]`, `preferred_response_style`, `goal`, `example_response` |
| `resources[]` | Scripts and reference text (`name`, `type`, `description`, `content`, `provenance`, `use`). `use: "live"` resources may inform prompts. `use: "after_call"` (types `Email Template` and `Follow Up`) must never appear on the teleprompter: Email Templates come **without** `content`/`subject` (only `name`, `purpose`, `description`) so the AI knows which follow-up it can offer; Follow Up resources carry `followUpKind`, `templatePurpose` and guidance. The after-call email draft is built by PitchProX, not by the live AI. |
| `prompt_framework` | Context inputs, instructions, system prompt, response sequence, active triggers, generation mode, creativity, teleprompter layout |
| `prompt_dna` | `core_identity`, directness, empathy, urgency and authority levels, `pillars[]` |
| `logic_rules` | Enabled methodology `rules[]` and `rule_families[]`. These are not a competing decision engine (§6.8). |
| `prompt_delivery` | Length limits, brevity, words per minute, cooldown, single-word cues |
| `safety_boundaries` | `hard_boundaries[]` and `prohibited_terms[]` (never break these), `methodology_preferences[]` (soft), `guardrails` |
| `advanced` | Remaining builder settings |
| `publication` | `version`, `published_at`, `based_on_version` |

`root_category` is always one of `Financial`, `Risk`, `Logistics`, `Relationship`. Anything more specific goes in `subtype` (§6.4).

## Never included

The following fields are stripped. If one of them appears, treat it as a bug and report it.

- `commerce`: price, access type, distribution, visibility, cover image, marketplace assets.
- `internal`: staff notes.
- `identity.description` (marketplace text), `identity.internal_tags`, `identity.status`.

## Where it is built

- `src/lib/playbook-compile.js` (`compilePlaybook`) turns the builder form into the full stored version.
- `src/lib/playbook-runtime.js` (`aiPlaybook`) produces the AI-safe copy described here.
- Published versions are stored, immutable, in `playbook_versions.content`.
