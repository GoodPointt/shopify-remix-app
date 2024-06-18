import { render } from "@react-email/components";
import type { ActionFunction } from "@remix-run/node";
import { Form, json, useActionData, useSubmit } from "@remix-run/react";
import {
  Button,
  Frame,
  Layout,
  Modal,
  Page,
  TextField,
} from "@shopify/polaris";
import React, { useCallback, useState, useRef } from "react";
import { Resend } from "resend";
import VercelInviteUserEmail from "~/emails/custom";

type CreateCampaignFormProps = {
  activate: boolean;
  setActivate: React.Dispatch<React.SetStateAction<boolean>>;
};

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const campaignName = formData.get("campaignName") as string;
  const recipient = formData.get("recipient") as string;
  const corporation = formData.get("corporation") as string;
  const sender = formData.get("sender") as string;
  const emailSubject = formData.get("emailSubject") as string;
  const content = formData.get("content") as string;

  const emailHtml = render(
    <VercelInviteUserEmail
      teamName={campaignName}
      username={recipient}
      invitedByUsername={corporation}
      content={content}
    />,
  );

  const { data, error } = await resend.emails.send({
    from: `${sender || "no-reply"} <onboarding@resend.dev>`,
    to: [recipient || ""],
    subject: emailSubject || "",
    html: emailHtml,
  });

  if (error) {
    return json({ error }, 400);
  }

  return json({ data }, 200);
};

const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({
  activate,
  setActivate,
}) => {
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);

  console.log(actionData);

  const sendEmails = () => {
    if (formRef.current) {
      submit(new FormData(formRef.current), { replace: true, method: "POST" });
    }
  };

  const handleChange = useCallback(
    () => setActivate(!activate),
    [activate, setActivate],
  );

  const [campaignName, setCampaignName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [corporation, setCorporation] = useState("");
  const [sender, setSender] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [content, setContent] = useState("");

  return (
    <Page>
      <Frame>
        <Modal
          activator={<Button onClick={handleChange}>Create new</Button>}
          open={activate}
          onClose={handleChange}
          title="Create new email campaign"
          primaryAction={{
            content: "Send",
            onAction: sendEmails,
          }}
          secondaryActions={[
            {
              content: "Finish Later",
              onAction: handleChange,
            },
          ]}
        >
          <Modal.Section>
            <Form ref={formRef} method="POST" action="/app/createcampaignform">
              <Layout.Section>
                <TextField
                  label="Campaign name"
                  name="campaignName"
                  placeholder="Campaign name"
                  value={campaignName}
                  onChange={(value) => setCampaignName(value)}
                  autoComplete="off"
                />
                <TextField
                  label="To"
                  name="recipient"
                  value={recipient}
                  placeholder="Recipient"
                  onChange={(value) => setRecipient(value)}
                  autoComplete="off"
                />
                <TextField
                  label="Corporation"
                  name="corporation"
                  placeholder="Corporation"
                  value={corporation}
                  onChange={(value) => setCorporation(value)}
                  autoComplete="off"
                />
                <TextField
                  label="From"
                  name="sender"
                  placeholder="Sender"
                  value={sender}
                  onChange={(value) => setSender(value)}
                  autoComplete="off"
                />
                <TextField
                  label="Email Subject"
                  name="emailSubject"
                  placeholder="Subject"
                  value={emailSubject}
                  onChange={(value) => setEmailSubject(value)}
                  autoComplete="off"
                />
                <TextField
                  label="Content"
                  name="content"
                  value={content}
                  onChange={(value) => setContent(value)}
                  autoComplete="off"
                />
                <Button submit>Send</Button>
              </Layout.Section>
            </Form>
          </Modal.Section>
        </Modal>
      </Frame>
    </Page>
  );
};

export default CreateCampaignForm;
