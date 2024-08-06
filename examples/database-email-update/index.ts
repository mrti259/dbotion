/* ================================================================================

	database-update-send-email.
  
  Glitch example: https://glitch.com/edit/#!/notion-database-email-update
  Find the official Notion API client @ https://github.com/makenotion/notion-sdk-js/

================================================================================ */
import { Client } from "@notionhq/client"
import SendGrid from "@sendgrid/mail"
import { Database, RichTextProperty, Schema, TitleProperty } from "dbotion"
import { config } from "dotenv"

config()

const {
  SENDGRID_KEY,
  EMAIL_TO_FIELD,
  EMAIL_FROM_FIELD,
  NOTION_KEY,
  NOTION_DATABASE_ID,
} = process.env
if (!SENDGRID_KEY) throw "Missing key"
if (!EMAIL_TO_FIELD) throw "Missing key"
if (!EMAIL_FROM_FIELD) throw "Missing key"
if (!NOTION_KEY) throw "Missing key"
if (!NOTION_DATABASE_ID) throw "Missing key"

SendGrid.setApiKey(SENDGRID_KEY)
const notion = new Client({ auth: NOTION_KEY })
const databaseId = NOTION_DATABASE_ID
const schema = new Schema({
  title: new TitleProperty("Name"),
  status: new RichTextProperty("Status"),
})
const database = new Database(notion, databaseId, schema)

/**
 * Local map to store task pageId to its last status.
 * { [pageId: string]: string }
 */
const taskPageIdToStatusMap = {}

/**
 * Initialize local data store.
 * Then poll for changes every 5 seconds (5000 milliseconds).
 */
setInitialTaskPageIdToStatusMap().then(() => {
  setInterval(findAndSendEmailsForUpdatedTasks, 5000)
})

/**
 * Get and set the initial data store with tasks currently in the database.
 */
async function setInitialTaskPageIdToStatusMap() {
  const currentTasks = await getTasksFromNotionDatabase()
  for (const { pageId, status } of currentTasks) {
    taskPageIdToStatusMap[pageId] = status
  }
}

async function findAndSendEmailsForUpdatedTasks() {
  // Get the tasks currently in the database.
  console.log("\nFetching tasks from Notion DB...")
  const currentTasks = await getTasksFromNotionDatabase()

  // Return any tasks that have had their status updated.
  const updatedTasks = findUpdatedTasks(currentTasks)
  console.log(`Found ${updatedTasks.length} updated tasks.`)

  // For each updated task, update taskPageIdToStatusMap and send an email notification.
  for (const task of updatedTasks) {
    taskPageIdToStatusMap[task.pageId] = task.status
    await sendUpdateEmailWithSendgrid(task)
  }
}

/**
 * Gets tasks from the database.
 */
async function getTasksFromNotionDatabase(): Promise<
  Array<{ pageId: string; status: string; title: string }>
> {
  const pages = await database.query({})
  console.log(`${pages.length} pages successfully fetched.`)
  const tasks = pages.map(({ id: pageId, ...taskProps }) => ({
    pageId,
    ...taskProps,
  }))
  return tasks
}

/**
 * Compares task to most recent version of task stored in taskPageIdToStatusMap.
 * Returns any tasks that have a different status than their last version.
 */
function findUpdatedTasks(
  currentTasks: Array<{ pageId: string; status: string; title: string }>
): Array<{ pageId: string; status: string; title: string }> {
  return currentTasks.filter(currentTask => {
    const previousStatus = getPreviousTaskStatus(currentTask)
    return currentTask.status !== previousStatus
  })
}

/**
 * Sends task update notification using Sendgrid.
 */
async function sendUpdateEmailWithSendgrid({
  title,
  status,
}: {
  status: string
  title: string
}) {
  const message = `Status of Notion task ("${title}") has been updated to "${status}".`
  console.log(message)

  try {
    // Send an email about this change.
    await SendGrid.send({
      to: EMAIL_TO_FIELD,
      from: { email: EMAIL_FROM_FIELD! },
      subject: "Notion Task Status Updated",
      text: message,
    })
    console.log(`Email Sent to ${EMAIL_TO_FIELD}, from: ${EMAIL_FROM_FIELD}`)
  } catch (error) {
    console.error(error)
  }
}

/**
 * Finds or creates task in local data store and returns its status.
 */
function getPreviousTaskStatus({ pageId, status }): string {
  // If this task hasn't been seen before, add to local pageId to status map.
  if (!taskPageIdToStatusMap[pageId]) {
    taskPageIdToStatusMap[pageId] = status
  }
  return taskPageIdToStatusMap[pageId]
}
