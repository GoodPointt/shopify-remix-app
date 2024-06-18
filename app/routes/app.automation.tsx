import type { ActionFunction } from "@remix-run/node";
import React from "react";
import { authenticate } from "~/shopify.server";

type Props = {};

export const action: ActionFunction = async ({ request }) => {
  //TRIGGER WEBHOOK

  const { admin, session } = await authenticate.admin(request);
  const webhook = new admin.rest.resources.Webhook({ session });
  const { shop, accessToken } = session;
  console.log(shop);
  console.log(accessToken);

  if (webhook) {
    console.log(webhook);

    webhook.address = "pbsub://projectName:topicName";
    webhook.topic = "customers/create";
    webhook.format = "json";

    console.log("=========WEBHOOK CREATED SUCCESS========");
    await webhook.save({ update: true });
  }

  return null;
};

const AutomationPage = (props: Props) => {
  return <div>AutomationPage</div>;
};

export default AutomationPage;
