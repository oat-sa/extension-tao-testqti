# Atlassian CLI quick reference

Summary captured from `atlassian-cli help` on this machine.

## Setup
- Show config: `atlassian-cli config show`
- Set config: `atlassian-cli config set --base-url https://<site>.atlassian.net --email you@company.com --token <apiToken>`
- Config file: `~/.atlassian-cli.json`
- Env overrides: `ATLASSIAN_EMAIL`, `ATLASSIAN_API_TOKEN`, `ATLASSIAN_BASE_URL`, `ATLASSIAN_JIRA_BASE_URL`, `ATLASSIAN_CONFLUENCE_BASE_URL`, `TEMPO_API_TOKEN`

## Jira commands
- `atlassian-cli jira get-issue --key KEY`
- `atlassian-cli jira search --jql "project = DEMO order by created DESC" --limit 10`
- `atlassian-cli jira comment --key KEY --body "Text to add"`
- `atlassian-cli jira transition --key KEY --transition-id 31`

## Confluence commands
- `atlassian-cli confluence get-page --id 12345`
- `atlassian-cli confluence resolve-shortlink --key KQA61Q`
- `atlassian-cli confluence search --cql 'type=page and space=ENG' --limit 10`
- `atlassian-cli confluence create-page --space ENG --title "Title" --body "<p>Hello</p>" --body-file file --markdown-file file --parent-id 123`
- `atlassian-cli confluence update-page --id 12345 --body "<p>New content</p>" --body-file file --markdown-file file --placeholder "TOKEN" --title "Optional new title"`

## Tempo (time tracking)
- `atlassian-cli tempo get-worklogs --from 2025-12-01 --to 2025-12-09`
- `atlassian-cli tempo get-worklog --id <worklogId>`
- `atlassian-cli tempo log-work --issue KEY-123 --time-spent 3600 --date 2025-12-09 [--time 09:00:00] [--description "Work done"] [--type Development] [--attributes key=value,key2=value2]`
- `atlassian-cli tempo update-worklog --id <worklogId> [--time-spent 7200] [--date 2025-12-09] [--time 10:00:00] [--description "Updated"]`
- `atlassian-cli tempo delete-worklog --id <worklogId>`
- `atlassian-cli tempo get-user --account-id <accountId>`
- `atlassian-cli tempo list-attributes [--key <attributeKey>]`

## Help
- `atlassian-cli help`
- `atlassian-cli help-macros`
