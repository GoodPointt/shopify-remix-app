import type { ActionFunction } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { Button, Form, Layout, Page, TextField } from "@shopify/polaris";
import React, { useCallback, useState } from "react";
import VercelInviteUserEmail from "~/emails/custom";
import { authenticate } from "~/shopify.server";

type Props = {};

export const action: ActionFunction = async ({ request }) => {
  //TRIGGER WEBHOOK

  const { admin, session } = await authenticate.admin(request);
  const webhook = new admin.rest.resources.Webhook({ session });
  // const { shop, accessToken } = session;
  // console.log(shop);
  // console.log(accessToken);

  if (webhook) {
    console.log(webhook);

    webhook.address = "pbsub://projectName:topicName";
    webhook.topic = "customers/create";
    webhook.format = "json";

    console.log("=========WEBHOOK CREATED SUCCESS========", webhook);
    await webhook.save({ update: true });
  }

  return null;
};

const AutomationPage = (props: Props) => {
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();

  console.log(actionData, "CreateCampaingForm");

  const sendAutomation = () => submit({}, { replace: true, method: "POST" });

  const [value, setValue] = useState("default");

  const handleChangeText = useCallback(
    (newValue: string) => setValue(newValue),
    [],
  );

  return (
    <Page>
      <Form onSubmit={sendAutomation} method="post" action="/app/automations">
        <h1>CREATE AUTOMATION (AUTOMATIC EMAIL SEND AFTER USER SIGN UP)</h1>
        <Layout>
          <Layout.Section>
            <TextField
              label="Automation Name"
              value={value}
              onChange={handleChangeText}
              autoComplete="off"
            />
            <TextField
              label="To"
              value={value}
              onChange={handleChangeText}
              autoComplete="off"
            />
            <TextField
              label="Corporation"
              value={value}
              onChange={handleChangeText}
              autoComplete="off"
            />
            <TextField
              label="From"
              value={value}
              onChange={handleChangeText}
              autoComplete="off"
            />
            <TextField
              label="Email Subject"
              value={value}
              onChange={handleChangeText}
              autoComplete="off"
            />
            <TextField
              label="Content"
              value={value}
              onChange={handleChangeText}
              autoComplete="off"
            />
            <Button submit>send</Button>
          </Layout.Section>
          <Layout.Section>
            <VercelInviteUserEmail />
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
};

export default AutomationPage;
