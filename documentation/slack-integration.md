# Slack integration

We have a slack integration that is connected with a couple of cloud functions.

There are two cloud functions that integrate with slack

1. `handleSlackRequest` - users requesting access - slack app posts to a channel that someone wants access
2. `handleSlackInteractive` - button actions from channel - user presses accept/reject/ignore and slack app posts to a cloud function that gives access to a user or rejects it

For these cloud functions to work you need to add a webhook url from a slack app:

## Set up

Firebase steps:
1. Open your gcloud console and go to IAM section
2. Give your Firebase account `Pub/Sub subscriber` role

Slack steps:
1. Go to slack application page and create a new app or go to your existing app
2. Activate `Incoming Webhooks` and create a new Webhook URL

Copy the webhook URL and inject it into Firebase as an environment variable:

`firebase functions:config:set slack.deploymentWebhook="YOUR SLACK WEBHOOK HERE"`
