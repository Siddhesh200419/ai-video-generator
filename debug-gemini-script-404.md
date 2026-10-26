# Debug Session: gemini-script-404
- **Status**: [OPEN]
- **Issue**: Clicking Generate Script triggers a 500 because the Gemini text-generation model configured in `config/AiModel.jsx` is not available for the API/version being used.
- **Debug Server**: Pending startup
- **Log File**: `.dbg/trae-debug-log-gemini-script-404.ndjson`

## Reproduction Steps
1. Open the create-new-video flow.
2. Enter a topic or theme.
3. Click the Generate Script button.
4. Observe the 500 response from `/api/generate-script`.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | `config/AiModel.jsx` is using an outdated text model name for the current API path/version | High | Low | Confirmed by pre-fix log: helper invoked `gemini-1.5-flash` and immediately received 404 |
| B | `generate-script` is importing the wrong Gemini helper or stale build output | Medium | Low | Rejected by pre-fix log: route reached `generateScript.sendMessage` successfully |
| C | The shared helper is forcing a TTS-only or incompatible config into normal text generation | Medium | Low | Rejected by pre-fix log: failure occurs before any TTS config is involved |
| D | The generate-video flow depends on this same helper and will fail even after script generation is fixed if model separation is incomplete | Medium | Medium | Pending verification after fix |

## Log Evidence
- Route entry confirmed request reached `/api/generate-script`.
- Helper invocation logged `model: "gemini-1.5-flash"`.
- Helper failure logged a direct 404 for `models/gemini-1.5-flash:generateContent`.
- Route catch logged the same propagated 404.

## Verification Conclusion
Confirmed root cause: the shared text-generation helper is still configured to use `gemini-1.5-flash`, which is not available for the current API/version in this project runtime. The fix should separate text generation onto a supported text model while keeping TTS on `gemini-3.8-flash-tts`.
