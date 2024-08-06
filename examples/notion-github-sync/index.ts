/* ================================================================================

	notion-github-sync.
  
  Glitch example: https://glitch.com/edit/#!/notion-github-sync
  Find the official Notion API client @ https://github.com/makenotion/notion-sdk-js/

================================================================================ */
import { Client } from "@notionhq/client"
import {
  Database,
  NumberProperty,
  RichTextProperty,
  Schema,
  TitleProperty,
} from "dbotion"
import dotenv from "dotenv"
import _ from "lodash"
import { Octokit } from "octokit"

type GitHubIssue = {
  number: number
  title: string
  state: string
  comment_count: number
  url: string
}
type NotionIssue = { pageId: string } & GitHubIssue

dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_KEY })
const notion = new Client({ auth: process.env.NOTION_KEY })
const schema = new Schema<GitHubIssue>({
  number: new NumberProperty("Issue Number"),
  title: new TitleProperty("Name"),
  state: new RichTextProperty("State"),
  comment_count: new NumberProperty("Number of Comments"),
  url: new RichTextProperty("Issue URL"),
})
const databaseId = process.env.NOTION_DATABASE_ID!
const database = new Database(notion, databaseId!, schema)

/**
 * Local map to store  GitHub issue ID to its Notion pageId.
 */
const gitHubIssuesIdToNotionPageId: Record<number, string> = {}

/**
 * Initialize local data store.
 * Then sync with GitHub.
 */
setInitialGitHubToNotionIdMap().then(syncNotionDatabaseWithGitHub)

/**
 * Get and set the initial data store with issues currently in the database.
 */
async function setInitialGitHubToNotionIdMap() {
  const currentIssues = await getIssuesFromNotionDatabase()
  for (const { pageId, number } of currentIssues) {
    gitHubIssuesIdToNotionPageId[number] = pageId
  }
}

async function syncNotionDatabaseWithGitHub() {
  // Get all issues currently in the provided GitHub repository.
  console.log("\nFetching issues from GitHub repository...")
  const issues = await getGitHubIssuesForRepository()
  console.log(`Fetched ${issues.length} issues from GitHub repository.`)

  // Group issues into those that need to be created or updated in the Notion database.
  const { pagesToCreate, pagesToUpdate } = getNotionOperations(issues)

  // Create pages for new issues.
  console.log(`\n${pagesToCreate.length} new issues to add to Notion.`)
  await createPages(pagesToCreate)

  // Updates pages for existing issues.
  console.log(`\n${pagesToUpdate.length} issues to update in Notion.`)
  await updatePages(pagesToUpdate)

  // Success!
  console.log("\n✅ Notion database is synced with GitHub.")
}

/**
 * Gets pages from the Notion database.
 */
async function getIssuesFromNotionDatabase() {
  const pages = await database.query({})
  const issues = pages.map(({ id: pageId, ...issue }) => ({ pageId, ...issue }))
  return issues
}

/**
 * Gets issues from a GitHub repository. Pull requests are omitted.
 *
 * https://docs.github.com/en/rest/guides/traversing-with-pagination
 * https://docs.github.com/en/rest/reference/issues
 */
async function getGitHubIssuesForRepository() {
  const issues: GitHubIssue[] = []
  const iterator = octokit.paginate.iterator(
    octokit.rest.issues.listForRepo as any,
    {
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      state: "all",
      per_page: 100,
    }
  )
  for await (const { data } of iterator) {
    for (const issue of data) {
      if (!issue.pull_request) {
        issues.push({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          comment_count: issue.comments,
          url: issue.html_url,
        })
      }
    }
  }
  return issues
}

/**
 * Determines which issues already exist in the Notion database.
 */
function getNotionOperations(issues: GitHubIssue[]) {
  const pagesToCreate: GitHubIssue[] = []
  const pagesToUpdate: NotionIssue[] = []
  issues.forEach(issue => {
    const pageId = gitHubIssuesIdToNotionPageId[issue.number]
    if (pageId) pagesToUpdate.push({ pageId, ...issue })
    else pagesToCreate.push(issue)
  })
  return { pagesToCreate, pagesToUpdate }
}

/**
 * Creates new pages in Notion.
 *
 * https://developers.notion.com/reference/post-page
 */
function createPages(pagesToCreate: GitHubIssue[]) {
  return database.create(pagesToCreate)
}

/**
 * Updates provided pages in Notion.
 *
 * https://developers.notion.com/reference/patch-page
 */
async function updatePages(pagesToUpdate: NotionIssue[]) {
  return database.update(
    pagesToUpdate.map(({ pageId: id, ...issue }) => ({ id, ...issue }))
  )
}
