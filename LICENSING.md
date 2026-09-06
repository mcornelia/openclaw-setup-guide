# License scope

The [MIT License](LICENSE) grants permission for this project's original
contributions in the following files, along with this README and licensing
documentation. Any third-party portions retain their original terms.

- `client/src/App.tsx`
- `client/src/components/CodeBlock.tsx`
- `client/src/components/CommonIssuesPanel.tsx`
- `client/src/components/CompletionScreen.tsx`
- `client/src/components/StepContent.tsx`
- `client/src/components/StepNotes.tsx`
- `client/src/components/StepTroubleshootingHelper.tsx`
- `client/src/components/TopProgressBar.tsx`
- `client/src/lib/guideData.ts`
- `client/src/lib/troubleshootingData.ts`
- `client/src/pages/Home.tsx`
- `client/src/pages/NotesReview.tsx`
- `client/src/pages/Troubleshooting.tsx`
- `client/src/index.css`

This is a limited grant for the project-specific code, not a blanket license
for every file in this repository. Preserve this scope notice with the MIT notice.

## Not covered by this grant

All other files are excluded unless they have a separate applicable license.
In particular, this grant does not cover:

- Pre-existing Manus platform or template code, including
  `client/public/__manus__/`, `client/src/components/ManusDialog.tsx`,
  `client/src/components/Map.tsx`, and other scaffolding not listed above.
  Their redistribution permissions have not been established by this audit.
- Copied shadcn/ui components and helpers. Their upstream MIT notice is preserved
  in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- Dependency packages and the bundled Wouter patch's upstream code. Their
  original licenses still apply; installing dependencies does not relicense them.
- Images, logos, trademarks, third-party content, linked material, or external services.

Manus's [ownership guidance](https://help.manus.im/en/articles/13125514-do-i-own-the-assets-websites-images-videos-slides-generated-via-manus)
states that users own their generated project content, subject to third-party rights.
That is not permission to relicense pre-existing platform software. Before
redistributing a complete application bundle, review those excluded components
and retain the licenses required by all bundled dependencies.
